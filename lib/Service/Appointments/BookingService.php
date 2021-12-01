<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @copyright 2021 Anna Larch <anna.larch@gmx.net>
 *
 * @author Anna Larch <anna.larch@gmx.net>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace OCA\Calendar\Service\Appointments;

use DateTimeImmutable;
use DateTimeZone;
use InvalidArgumentException;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\Booking;
use OCA\Calendar\Db\BookingMapper;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Exception\NoSlotFoundException;
use OCA\Calendar\Exception\ServiceException;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Http;
use OCP\DB\Exception;
use OCP\DB\Exception as DbException;
use OCP\IUser;
use OCP\Security\ISecureRandom;
use Psr\Log\LoggerInterface;
use function count;

class BookingService {

	/** @var int the expiry of a booking confirmation */
	public const EXPIRY = 86400;

	/** @var AvailabilityGenerator */
	private $availabilityGenerator;

	/** @var SlotExtrapolator */
	private $extrapolator;

	/** @var DailyLimitFilter */
	private $dailyLimitFilter;

	/** @var EventConflictFilter */
	private $eventConflictFilter;

	/** @var BookingCalendarWriter */
	private $calendarWriter;

	/** @var BookingMapper */
	private $bookingMapper;

	/** @var ISecureRandom */
	private $random;

	/** @var MailService */
	private $mailService;

	/** @var LoggerInterface */
	private $logger;

	public function __construct(AvailabilityGenerator $availabilityGenerator,
								SlotExtrapolator $extrapolator,
								DailyLimitFilter $dailyLimitFilter,
								EventConflictFilter $eventConflictFilter,
								BookingMapper $bookingMapper,
								BookingCalendarWriter $calendarWriter,
								ISecureRandom $random,
								MailService $mailService,
								LoggerInterface $logger) {
		$this->availabilityGenerator = $availabilityGenerator;
		$this->extrapolator = $extrapolator;
		$this->dailyLimitFilter = $dailyLimitFilter;
		$this->eventConflictFilter = $eventConflictFilter;
		$this->calendarWriter = $calendarWriter;
		$this->bookingMapper = $bookingMapper;
		$this->random = $random;
		$this->mailService = $mailService;
		$this->logger = $logger;
	}

	/**
	 * @throws ClientException|DbException
	 */
	public function confirmBooking(Booking $booking, AppointmentConfig $config): Booking {
		$bookingSlot = current($this->getAvailableSlots($config, $booking->getStart(), $booking->getEnd()));

		if (!$bookingSlot) {
			throw new ClientException('Slot for booking is not available any more');
		}

		$tz = new DateTimeZone($booking->getTimezone());
		$startObj = (new DateTimeImmutable())->setTimestamp($booking->getStart())->setTimezone($tz);
		if (!$startObj) {
			throw new ClientException('Could not make sense of booking times');
		}

		$this->calendarWriter->write($config, $startObj, $booking->getDisplayName(), $booking->getEmail(), $booking->getDescription());
		$booking->setConfirmed(true);
		$this->bookingMapper->update($booking);
		return $booking;
	}

	/**
	 * @throws ClientException|ServiceException|DbException
	 */
	public function book(AppointmentConfig $config,int $start, int $end, string $timeZone, string $displayName, string $email, ?string $description = null): Booking {
		$bookingSlot = current($this->getAvailableSlots($config, $start, $end));

		if (!$bookingSlot) {
			throw new NoSlotFoundException('Could not find slot for booking');
		}

		try {
			$tz = new DateTimeZone($timeZone);
		} catch (Exception $e) {
			throw new InvalidArgumentException('Could not make sense of the timezone', $e->getCode(), $e);
		}

		$booking = new Booking();
		$booking->setApptConfigId($config->getId());
		$booking->setCreatedAt(time());
		$booking->setToken($this->random->generate(32, ISecureRandom::CHAR_ALPHANUMERIC));
		$booking->setDisplayName($displayName);
		$booking->setDescription($description);
		$booking->setEmail($email);
		$booking->setStart($start);
		$booking->setEnd($end);
		$booking->setTimezone($tz->getName());
		try {
			$this->bookingMapper->insert($booking);
		} catch (Exception $e) {
			throw new ServiceException('Could not create booking', 0, $e);
		}

		try {
			$this->mailService->sendConfirmationEmail($booking, $config);
		} catch (ServiceException $e) {
			$this->bookingMapper->delete($booking);
			throw $e;
		}

		return $booking;
	}

	/**
	 * @return Interval[]
	 */
	public function getAvailableSlots(AppointmentConfig $config, int $startTime, int $endTime): array {
		// 1. Build intervals at which slots may be booked
		$availabilityIntervals = $this->availabilityGenerator->generate($config, $startTime, $endTime);
		// 2. Generate all possible slots
		$allPossibleSlots = $this->extrapolator->extrapolate($config, $availabilityIntervals);
		// 3. Filter out the daily limits
		$filteredByDailyLimit = $this->dailyLimitFilter->filter($config, $allPossibleSlots);
		// 4. Filter out booking conflicts
		$available = $this->eventConflictFilter->filter($config, $filteredByDailyLimit);

		$this->logger->debug('Appointment config ' . $config->getToken() . ' has {availabilityIntervals} intervals that result in {allPossibleSlots} possible slots. {filteredByDailyLimit} slots remain after the daily limit. {available} available slots remain after conflict checking.', [
			'availabilityIntervals' => count($availabilityIntervals),
			'allPossibleSlots' => count($allPossibleSlots),
			'filteredByDailyLimit' => count($filteredByDailyLimit),
			'available' => count($available)
		]);

		return $available;
	}

	/**
	 * @throws ClientException
	 */
	public function findByToken(string $token): Booking {
		try {
			return $this->bookingMapper->findByToken($token);
		} catch (DoesNotExistException $e) {
			throw new ClientException(
				"Booking $token does not exist",
				0,
				$e,
				Http::STATUS_NOT_FOUND
			);
		}
	}

	public function deleteByUser(IUser $user): void {
		$this->bookingMapper->deleteByUserId($user->getUID());
	}

	/**
	 * @throws DbException
	 */
	public function deleteOutdated(): int {
		return $this->bookingMapper->deleteOutdated(self::EXPIRY);
	}
}
