<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Service\Appointments;

use DateTimeImmutable;
use DateTimeZone;
use InvalidArgumentException;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\Booking;
use OCA\Calendar\Db\BookingMapper;
use OCA\Calendar\Events\BeforeAppointmentBookedEvent;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Exception\NoSlotFoundException;
use OCA\Calendar\Exception\ServiceException;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Http;
use OCP\DB\Exception;
use OCP\DB\Exception as DbException;
use OCP\EventDispatcher\IEventDispatcher;
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

	/** @var IEventDispatcher */
	private $eventDispatcher;

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
		IEventDispatcher $eventDispatcher,
		LoggerInterface $logger) {
		$this->availabilityGenerator = $availabilityGenerator;
		$this->extrapolator = $extrapolator;
		$this->dailyLimitFilter = $dailyLimitFilter;
		$this->eventConflictFilter = $eventConflictFilter;
		$this->calendarWriter = $calendarWriter;
		$this->bookingMapper = $bookingMapper;
		$this->random = $random;
		$this->mailService = $mailService;
		$this->eventDispatcher = $eventDispatcher;
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

		// TODO: inject broker here and remove indirection
		$this->eventDispatcher->dispatchTyped(
			new BeforeAppointmentBookedEvent(
				$booking,
				$config,
			)
		);

		$calendar = $this->calendarWriter->write(
			$config,
			$startObj,
			$booking->getDisplayName(),
			$booking->getEmail(),
			$booking->getTimezone(),
			$booking->getDescription(),
			$config->getCreateTalkRoom() ? $booking->getTalkUrl() : $config->getLocation(),
		);
		$booking->setConfirmed(true);
		$this->bookingMapper->update($booking);

		try {
			$this->mailService->sendBookingInformationEmail($booking, $config, $calendar);
			$this->mailService->sendOrganizerBookingInformationEmail($booking, $config, $calendar);
		} catch (ServiceException $e) {
			$this->logger->info('Could not send booking emails after confirmation from user ' . $booking->getEmail(), ['exception' => $e, 'app' => 'calendar-appointments']);
		}

		try {
			$this->mailService->sendOrganizerBookingInformationNotification($booking, $config);
		} catch (\InvalidArgumentException $e) {
			$this->logger->warning('Could not send booking information notification after confirmation by user ' . $booking->getEmail(), ['exception' => $e, 'app' => 'calendar-appointments']);
		}

		return $booking;
	}

	/**
	 * @throws ServiceException|DbException|NoSlotFoundException|InvalidArgumentException
	 */
	public function book(AppointmentConfig $config, int $start, int $end, string $timeZone, string $displayName, string $email, ?string $description = null): Booking {
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
		if ($config->getFutureLimit() !== null) {
			/** @var int $maxEndTime */
			$maxEndTime = time() + $config->getFutureLimit();
			$this->logger->debug('Maximum end time: ' . $maxEndTime, ['app' => 'calendar-appointments']);
			if ($startTime > $maxEndTime) {
				$this->logger->debug('Start time is higher than maximum end time. Start time: ' . $startTime, ['app' => 'calendar-appointments']);
				return [];
			}
			if ($endTime > $maxEndTime) {
				$this->logger->debug('End time is higher than maximum end time. Setting end time to maximum end time. End time: ' . $endTime, ['app' => 'calendar-appointments']);
				$endTime = $maxEndTime;
			}
		}

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
			'available' => count($available),
			'app' => 'calendar-appointments',
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
