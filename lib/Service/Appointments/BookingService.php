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
use OC\URLGenerator;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\AppointmentConfigMapper;
use OCA\Calendar\Db\Booking;
use OCA\Calendar\Db\BookingMapper;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Exception\ServiceException;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\AppFramework\Http;
use OCP\DB\Exception;
use OCP\DB\Exception as DbException;
use OCP\Defaults;
use OCP\EventDispatcher\IEventDispatcher;
use OCP\IDateTimeFormatter;
use OCP\IL10N;
use OCP\ILogger;
use OCP\IUserManager;
use OCP\L10N\IFactory;
use OCP\Mail\IEMailTemplate;
use OCP\Mail\IMailer;
use OCP\Security\ISecureRandom;
use OCP\Util;
use Sabre\VObject\Component\VEvent;

class BookingService {

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

	public function __construct(AvailabilityGenerator $availabilityGenerator,
								SlotExtrapolator $extrapolator,
								DailyLimitFilter $dailyLimitFilter,
								EventConflictFilter $eventConflictFilter,
								BookingMapper $bookingMapper,
								BookingCalendarWriter $calendarWriter,
								ISecureRandom $random) {

		$this->availabilityGenerator = $availabilityGenerator;
		$this->extrapolator = $extrapolator;
		$this->dailyLimitFilter = $dailyLimitFilter;
		$this->eventConflictFilter = $eventConflictFilter;
		$this->calendarWriter = $calendarWriter;
		$this->bookingMapper = $bookingMapper;
		$this->random = $random;
	}

	/**
	 * @param Booking $booking
	 * @param AppointmentConfig $config
	 * @return Booking
	 *
	 * @throws ClientException
	 */
	public function confirmBooking(Booking $booking, AppointmentConfig $config): Booking {
		$bookingSlot = current($this->getAvailableSlots($config, $booking->getStart(), $booking->getEnd()));

		if (!$bookingSlot) {
			throw new ClientException('Slot for booking is not available any more');
		}

		$tz = new DateTimeZone($booking->getTimezone());
		$startObj = (new DateTimeImmutable())->setTimestamp($booking->getStart())->setTimezone($tz);
		if(!$startObj) {
			throw new ClientException('Could not make sense of booking times');
		}

		// Pass the $startTimeInTz to get the correct timezone for the booking user
		$this->calendarWriter->write($config, $startObj, $booking->getDisplayName(), $booking->getEmail(), $booking->getDescription());

		return $booking;
	}

	/**
	 * @param AppointmentConfig $config
	 * @param int $start
	 * @param int $end
	 * @param string $timeZone
	 * @param string $displayName
	 * @param string $email
	 * @param string|null $description
	 *
	 * @return Booking
	 *
	 * @throws ClientException
	 * @throws ServiceException
	 */
	public function book(AppointmentConfig $config,int $start, int $end, string $timeZone, string $displayName, string $email, ?string $description = null): Booking {
		$bookingSlot = current($this->getAvailableSlots($config, $start, $end));

		if (!$bookingSlot) {
			throw new ClientException('Could not find slot for booking');
		}

		// this can move probably? run the booking logic, return slot, set that as start and end time for the new Booking obj?
		$booking = new Booking();
		$booking->setApptConfigId($config->getId());
		$booking->setCreatedAt(time());
		$booking->setToken($this->random->generate(32, ISecureRandom::CHAR_ALPHANUMERIC));
		$booking->setDisplayName($displayName);
		$booking->setDescription($description);
		$booking->setEmail($email);
		$booking->setStart($start);
		$booking->setEnd($end);
		$booking->setTimezone($timeZone);
		try {
			$this->bookingMapper->insert($booking);
		} catch (Exception $e) {
			throw new ServiceException('Could not create booking', 0, $e);
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
		return $this->eventConflictFilter->filter($config, $filteredByDailyLimit);
	}

	// Update
	public function updateBooking() {
		// noop for now? we don't support a public update method at the moment
	}

	// Delete
	public function delete() {
		// this would be a cancel request to ICreateFromString::create()
	}

	/**
	 * @param string $token
	 * @return Booking
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

	/**
	 * @param $booking
	 * @throws DbException
	 */
	public function deleteEntity($booking): void {
		$this->bookingMapper->delete($booking);
	}
}
