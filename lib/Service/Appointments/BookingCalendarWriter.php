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
use OCP\Calendar\Exceptions\CalendarException;
use OCP\Calendar\ICreateFromString;
use OCP\Calendar\IManager;
use OCP\IConfig;
use OCP\IUserManager;
use OCP\L10N\IFactory;
use OCP\Security\ISecureRandom;
use RuntimeException;
use Sabre\VObject\Component\VCalendar;
use function abs;

class BookingCalendarWriter {
	/** @var IConfig */
	private $config;

	/** @var IManager */
	private $manager;

	/** @var IUserManager */
	private $userManager;

	/** @var ISecureRandom */
	private $random;

	private TimezoneGenerator $timezoneGenerator;

	public function __construct(
		IConfig $config,
		IManager $manager,
		IUserManager $userManager,
		ISecureRandom $random,
		TimezoneGenerator $timezoneGenerator,
		private IFactory $l10nFactory,
	) {
		$this->config = $config;
		$this->manager = $manager;
		$this->userManager = $userManager;
		$this->random = $random;
		$this->timezoneGenerator = $timezoneGenerator;
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
	 * @param DateTimeImmutable $start
	 * @param string $displayName
	 * @param string $email
	 * @param string|null $description
	 *
	 * @return string
	 * @throws RuntimeException
	 */
	public function write(AppointmentConfig $config,
		DateTimeImmutable $start,
		string $displayName,
		string $email,
		string $timezone, ?string $description = null,
		?string $location = null) : string {
		$calendar = current($this->manager->getCalendarsForPrincipal($config->getPrincipalUri(), [$config->getTargetCalendarUri()]));
		if (!($calendar instanceof ICreateFromString)) {
			throw new RuntimeException('Could not find a public writable calendar for this principal');
		}
		$organizer = $this->userManager->get($config->getUserId());
		if ($organizer === null) {
			throw new RuntimeException('Organizer not registered user for this instance');
		}

		$lang = $this->config->getUserValue($organizer->getUID(), 'core', 'lang', null);
		$l10n = $this->l10nFactory->get('calendar', $lang);

		$vcalendar = new VCalendar([
			'CALSCALE' => 'GREGORIAN',
			'VERSION' => '2.0',
			'VEVENT' => [
				// TRANSLATORS Title for event appoinment, first the attendee name, then the appointment name
				'SUMMARY' => $l10n->t('%1$s - %2$s', [$displayName, $config->getName()]),
				'STATUS' => 'CONFIRMED',
				'DTSTART' => $start,
				'DTEND' => $start->setTimestamp($start->getTimestamp() + ($config->getLength()))
			]
		]);

		$end = $start->getTimestamp() + $config->getLength();
		$tz = $this->timezoneGenerator->generateVTimezone($timezone, $start->getTimestamp(), $end);
		if ($tz) {
			$vcalendar->add($tz);
		}

		if (!empty($description)) {
			$vcalendar->VEVENT->add('DESCRIPTION', $description);
		}

		$vcalendar->VEVENT->add(
			'ORGANIZER',
			'mailto:' . $organizer->getEMailAddress(),
			[
				'CN' => $organizer->getDisplayName(),
				'CUTYPE' => 'INDIVIDUAL',
				'PARTSTAT' => 'ACCEPTED'
			]
		);

		$vcalendar->VEVENT->add(
			'ATTENDEE',
			'mailto:' . $organizer->getEMailAddress(),
			[
				'CN' => $organizer->getDisplayName(),
				'CUTYPE' => 'INDIVIDUAL',
				'RSVP' => 'TRUE',
				'ROLE' => 'REQ-PARTICIPANT',
				'PARTSTAT' => 'ACCEPTED'
			]
		);

		$vcalendar->VEVENT->add('ATTENDEE',
			'mailto:' . $email,
			[
				'CN' => $displayName,
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
			$alarm = $vcalendar->createComponent('VALARM');
			$alarm->add($vcalendar->createProperty('TRIGGER', '-' . $this->secondsToIso8601Duration(abs((int)$defaultReminder)), ['RELATED' => 'START']));
			$alarm->add($vcalendar->createProperty('ACTION', 'DISPLAY'));
			$vcalendar->VEVENT->add($alarm);
		}

		if ($location !== null) {
			$vcalendar->VEVENT->add('LOCATION', $location);
		}

		$vcalendar->VEVENT->add('X-NC-APPOINTMENT', $config->getToken());

		$filename = $this->random->generate(32, ISecureRandom::CHAR_ALPHANUMERIC);

		try {
			$this->createFromString($calendar, $filename . '.ics', $vcalendar->serialize());
		} catch (CalendarException $e) {
			throw new RuntimeException('Could not write event  for appointment config id ' . $config->getId() . ' to calendar: ' . $e->getMessage(), 0, $e);
		}

		if ($config->getPreparationDuration() !== 0) {
			$string = $l10n->t('Prepare for %s', [$config->getName()]);
			$prepStart = $start->setTimestamp($start->getTimestamp() - $config->getPreparationDuration());
			$prepCalendar = new VCalendar([
				'CALSCALE' => 'GREGORIAN',
				'VERSION' => '2.0',
				'VEVENT' => [
					'SUMMARY' => $string,
					'STATUS' => 'CONFIRMED',
					'DTSTART' => $prepStart,
					'DTEND' => $start
				]
			]);
			$tz = $this->timezoneGenerator->generateVTimezone($timezone, $prepStart->getTimestamp(), $start->getTimestamp());
			if ($tz) {
				$prepCalendar->add($tz);
			}

			$prepCalendar->VEVENT->add('RELATED-TO', $vcalendar->VEVENT->{'UID'});
			$prepCalendar->VEVENT->add('RELTYPE', 'PARENT');
			$prepCalendar->VEVENT->add('X-NC-PRE-APPOINTMENT', $config->getToken());

			$prepFileName = $this->random->generate(32, ISecureRandom::CHAR_ALPHANUMERIC);

			try {
				$this->createFromString($calendar, $prepFileName . '.ics', $prepCalendar->serialize());
			} catch (CalendarException $e) {
				throw new RuntimeException('Could not write event  for appointment config id ' . $config->getId() . ' to calendar: ' . $e->getMessage(), 0, $e);
			}
		}

		if ($config->getFollowupDuration() !== 0) {
			$string = $l10n->t('Follow up for %s', [$config->getName()]);
			$followupStart = $start->setTimestamp($start->getTimestamp() + $config->getLength());
			$followUpEnd = $followupStart->setTimestamp($followupStart->getTimestamp() + $config->getFollowupDuration());
			$followUpCalendar = new VCalendar([
				'CALSCALE' => 'GREGORIAN',
				'VERSION' => '2.0',
				'VEVENT' => [
					'SUMMARY' => $string,
					'STATUS' => 'CONFIRMED',
					'DTSTART' => $followupStart,
					'DTEND' => $followUpEnd
				]
			]);

			$tz = $this->timezoneGenerator->generateVTimezone($timezone, $followupStart->getTimestamp(), $followUpEnd->getTimestamp());
			if ($tz) {
				$followUpCalendar->add($tz);
			}

			$followUpCalendar->VEVENT->add('RELATED-TO', $vcalendar->VEVENT->{'UID'});
			$followUpCalendar->VEVENT->add('RELTYPE', 'PARENT');
			$followUpCalendar->VEVENT->add('X-NC-POST-APPOINTMENT', $config->getToken());

			$followUpFilename = $this->random->generate(32, ISecureRandom::CHAR_ALPHANUMERIC);

			try {
				$this->createFromString($calendar, $followUpFilename . '.ics', $followUpCalendar->serialize());
			} catch (CalendarException $e) {
				throw new RuntimeException('Could not write event  for appointment config id ' . $config->getId() . ' to calendar: ' . $e->getMessage(), 0, $e);
			}
		}
		return $vcalendar->serialize();
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
