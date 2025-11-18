<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Service\Appointments;

use DateTimeImmutable;
use OCA\Calendar\AppInfo\Application;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\Booking;
use OCP\Calendar\Exceptions\CalendarException;
use OCP\Calendar\ICreateFromString;
use OCP\Calendar\IManager;
use OCP\IConfig;
use OCP\IL10N;
use OCP\IUser;
use OCP\IUserManager;
use OCP\L10N\IFactory as L10NFactory;
use RuntimeException;
use Sabre\VObject\Component\VAlarm;
use Sabre\VObject\Component\VCalendar;
use Sabre\VObject\Component\VEvent;
use Symfony\Component\Uid\Uuid;

use function abs;

class BookingCalendarWriter {

	private IL10N $l10n;

	public function __construct(
		private readonly IConfig $config,
		private readonly IManager $manager,
		private readonly IUserManager $userManager,
		private readonly L10NFactory $l10nFactory,
		private readonly TimezoneGenerator $timezoneGenerator,
	) {
	}

	private function secondsToIso8601Duration(int $secs): string {
		$day = 24 * 60 * 60;
		$hour = 60 * 60;
		$minute = 60;
		if ($secs % $day === 0) {
			return 'PT' . (int)($secs / $day) . 'S';
		}
		if ($secs % $hour === 0) {
			return 'PT' . (int)($secs / $hour) . 'H';
		}
		if ($secs % $minute === 0) {
			return 'PT' . (int)($secs / $minute) . 'M';
		}
		return 'PT' . $secs . 'S';
	}

	/**
	 * @param AppointmentConfig $config
	 * @param Booking $booking
	 *
	 * @return string
	 * @throws RuntimeException
	 */
	public function write(AppointmentConfig $config, Booking $booking) : string {
		$calendar = current($this->manager->getCalendarsForPrincipal($config->getPrincipalUri(), [$config->getTargetCalendarUri()]));
		if (!($calendar instanceof ICreateFromString)) {
			throw new RuntimeException('Could not find a writable calendar for this principal');
		}
		$user = $this->userManager->get($config->getUserId());
		if ($user === null) {
			throw new RuntimeException('Organizer not registered user for this instance');
		}

		$userLanguage = $this->config->getUserValue($user->getUID(), 'core', 'lang', null);
		$this->l10n = $this->l10nFactory->get('calendar', $userLanguage);

		$vAppointmentObject = $this->generateAppointment($user, $config, $booking);
		try {
			$this->createFromString($calendar, Uuid::v4()->toRfc4122() . '.ics', $vAppointmentObject->serialize());
		} catch (CalendarException $e) {
			throw new RuntimeException('Could not write event  for appointment config id ' . $config->getId() . ' to calendar: ' . $e->getMessage(), 0, $e);
		}

		if ($config->getPreparationDuration() !== 0) {
			$vPreAppointmentObject = $this->generatePreAppointment($config, $vAppointmentObject);
			try {
				$this->createFromString($calendar, Uuid::v4()->toRfc4122() . '.ics', $vPreAppointmentObject->serialize());
			} catch (CalendarException $e) {
				throw new RuntimeException('Could not write event for appointment config id ' . $config->getId() . ' to calendar: ' . $e->getMessage(), 0, $e);
			}
		}

		if ($config->getFollowupDuration() !== 0) {
			$vPostAppointmentObject = $this->generatePostAppointment($config, $vAppointmentObject);
			try {
				$this->createFromString($calendar, Uuid::v4()->toRfc4122() . '.ics', $vPostAppointmentObject->serialize());
			} catch (CalendarException $e) {
				throw new RuntimeException('Could not write event for appointment config id ' . $config->getId() . ' to calendar: ' . $e->getMessage(), 0, $e);
			}
		}

		return $vAppointmentObject->serialize();
	}

	public function generateAppointment(IUser $user, AppointmentConfig $config, Booking $booking): VCalendar {
		$timezone = $booking->getTimezone();
		if (empty($timezone)) {
			throw new RuntimeException('Invalid timezone for booking');
		}
		$start = (new DateTimeImmutable())->setTimestamp($booking->getStart())->setTimezone(new \DateTimeZone($timezone));
		$end = (clone $start)->setTimestamp($start->getTimestamp() + $config->getLength());

		// construct the envelope
		$vCalendar = new VCalendar(['CALSCALE' => 'GREGORIAN', 'VERSION' => '2.0']);
		$vTimezone = $this->timezoneGenerator->generateVTimezone($booking->getTimezone(), $start->getTimestamp(), $end->getTimestamp());
		if ($vTimezone) {
			$vCalendar->add($vTimezone);
		}

		// construct the event
		/** @var VEvent $vEvent */
		$vEvent = $vCalendar->add('VEVENT');
		$vEvent->add('DTSTART', $start);
		$vEvent->add('DTEND', $end);
		$vEvent->add('STATUS', 'CONFIRMED');
		$vEvent->add('X-NC-APPOINTMENT', $config->getToken());

		if (!empty($booking->getDisplayName())) {
			$vEvent->add('SUMMARY', $booking->getDisplayName() . ' - ' . $config->getName());
		} else {
			$vEvent->add('SUMMARY', $config->getName());
		}

		if (!empty($booking->getDescription()) && !empty($config->getDescription())) {
			$vEvent->add('DESCRIPTION',
				$this->l10n->t('Requestor Comments:') . PHP_EOL
				. $booking->getDescription() . PHP_EOL . PHP_EOL
				. $this->l10n->t('Appointment Description:') . PHP_EOL
				. $config->getDescription()
			);
		} elseif (!empty($booking->getDescription())) {
			$vEvent->add('DESCRIPTION',
				$this->l10n->t('Requestor Comments:') . PHP_EOL
				. $booking->getDescription()
			);
		} elseif (!empty($config->getDescription())) {
			$vEvent->add('DESCRIPTION',
				$this->l10n->t('Appointment Description:') . PHP_EOL
				. $config->getDescription()
			);
		}

		if (!empty($config->getLocation())) {
			$vEvent->add('LOCATION', $config->getLocation());
		}

		$vEvent->add(
			'ORGANIZER',
			'mailto:' . $user->getEMailAddress(),
			[
				'CN' => $user->getDisplayName(),
				'CUTYPE' => 'INDIVIDUAL',
				'PARTSTAT' => 'ACCEPTED'
			]
		);

		$vEvent->add('ATTENDEE',
			'mailto:' . $booking->getEmail(),
			[
				'CN' => $booking->getDisplayName(),
				'CUTYPE' => 'INDIVIDUAL',
				'RSVP' => 'TRUE',
				'ROLE' => 'REQ-PARTICIPANT',
				'PARTSTAT' => 'ACCEPTED'
			]
		);

		$defaultReminder = $this->config->getUserValue(
			$config->getUserId(),
			Application::APP_ID,
			'defaultReminder',
			'none'
		);
		if ($defaultReminder !== 'none') {
			/** @var VAlarm $alarm */
			$alarm = $vCalendar->createComponent('VALARM');
			$alarm->add('TRIGGER', '-' . $this->secondsToIso8601Duration(abs((int)$defaultReminder)), ['RELATED' => 'START']);
			$alarm->add('ACTION', 'DISPLAY');
			$vEvent->add($alarm);
		}

		return $vCalendar;
	}

	public function generatePreAppointment(AppointmentConfig $config, VCalendar $vAppointmentObject): VCalendar {
		$anchorDate = $vAppointmentObject->VEVENT->DTSTART->getDateTime();
		$vCalendar = new VCalendar([
			'CALSCALE' => 'GREGORIAN',
			'VERSION' => '2.0',
			'VEVENT' => [
				'DTSTART' => (clone $anchorDate)->modify('-' . $config->getPreparationDuration() . ' seconds'),
				'DTEND' => $anchorDate,
				'STATUS' => 'CONFIRMED',
				'SUMMARY' => $this->l10n->t('Prepare for %s', [$config->getName()]),
				'DESCRIPTION' => $config->getDescription(),
				'RELATED-TO' => $vAppointmentObject->VEVENT->UID->getValue(),
				'RELTYPE' => 'PARENT',
				'X-NC-PRE-APPOINTMENT' => $config->getToken(),
			]
		]);
		if ($vAppointmentObject->VTIMEZONE) {
			$vCalendar->add(clone $vAppointmentObject->VTIMEZONE);
		}
		return $vCalendar;
	}

	public function generatePostAppointment(AppointmentConfig $config, VCalendar $vAppointmentObject): VCalendar {
		$anchorDate = $vAppointmentObject->VEVENT->DTEND->getDateTime();
		$vCalendar = new VCalendar([
			'CALSCALE' => 'GREGORIAN',
			'VERSION' => '2.0',
			'VEVENT' => [
				'DTSTART' => $anchorDate,
				'DTEND' => (clone $anchorDate)->modify('+' . $config->getFollowupDuration() . ' seconds'),
				'STATUS' => 'CONFIRMED',
				'SUMMARY' => $this->l10n->t('Follow up for %s', [$config->getName()]),
				'RELATED-TO' => $vAppointmentObject->VEVENT->UID->getValue(),
				'RELTYPE' => 'PARENT',
				'X-NC-POST-APPOINTMENT' => $config->getToken()
			]
		]);
		if ($vAppointmentObject->VTIMEZONE) {
			$vCalendar->add(clone $vAppointmentObject->VTIMEZONE);
		}
		return $vCalendar;
	}

	/**
	 * Compatibility adapter for Nextcloud >= 32 for the ICreateFromString interface in OCP.
	 *
	 * @throws CalendarException
	 */
	private function createFromString(
		ICreateFromString $calendar,
		string $fileName,
		string $ics,
	): void {
		// TODO: drop condition once we only support Nextcloud >= 32
		// Need to use the new minimal method here since the original one was fixed starting
		// from Nextcloud 32. The behavior differs a bit. The old, unpatched one and the minimal
		// one are not sending email invitations which we want to leverage here.
		if (method_exists($calendar, 'createFromStringMinimal')) {
			$calendar->createFromStringMinimal($fileName . '.ics', $ics);
		} else {
			$calendar->createFromString($fileName . '.ics', $ics);
		}
	}
}
