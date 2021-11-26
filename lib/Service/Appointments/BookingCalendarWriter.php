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
use OCA\Calendar\AppInfo\Application;
use OCA\Calendar\Db\AppointmentConfig;
use OCP\Calendar\Exceptions\CalendarException;
use OCP\Calendar\ICreateFromString;
use OCP\Calendar\IManager;
use OCP\IConfig;
use OCP\IUserManager;
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

	public function __construct(IConfig $config,
								IManager $manager,
								IUserManager $userManager,
								ISecureRandom $random) {
		$this->config = $config;
		$this->manager = $manager;
		$this->userManager = $userManager;
		$this->random = $random;
	}

	private function secondsToIso8601Duration(int $secs): string {
		$day = 24 * 60 * 60;
		$hour = 60 * 60;
		$minute = 60;
		if ($secs % $day === 0) {
			return 'PT' . $secs / $day . 'S';
		}
		if ($secs % $hour === 0) {
			return 'PT' . $secs / $hour . 'H';
		}
		if ($secs % $minute === 0) {
			return 'PT' . $secs / $minute . 'M';
		}
		return 'PT' . $secs . 'S';
	}

	/**
	 * @param AppointmentConfig $config
	 * @param DateTimeImmutable $start
	 * @param string $name
	 * @param string $email
	 * @param string $description
	 *
	 * @throws RuntimeException
	 *
	 */
	public function write(AppointmentConfig $config, DateTimeImmutable $start, string $displayName, string $email, ?string $description = null) : void {
		$calendar = current($this->manager->getCalendarsForPrincipal($config->getPrincipalUri(), [$config->getTargetCalendarUri()]));
		if (!$calendar || !($calendar instanceof ICreateFromString)) {
			throw new RuntimeException('Could not find a public writable calendar for this principal');
		}

		$organizer = $this->userManager->get($config->getUserId());
		if ($organizer === null) {
			throw new RuntimeException('Organizer not registered user for this instance');
		}

		$vcalendar = new VCalendar([
			'CALSCALE' => 'GREGORIAN',
			'VERSION' => '2.0',
			'VEVENT' => [
				'SUMMARY' => $config->getName(),
				'STATUS' => 'CONFRIMED',
				'DTSTART' => $start,
				'DTEND' => $start->setTimestamp($start->getTimestamp() + ($config->getLength()))
			]
		]);

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
			$alarm->add($vcalendar->createProperty('TRIGGER', '-' . $this->secondsToIso8601Duration(abs((int) $defaultReminder)), ['RELATED' => 'START']));
			$alarm->add($vcalendar->createProperty('ACTION', 'DISPLAY'));
			$vcalendar->VEVENT->add($alarm);
		}

		$vcalendar->VEVENT->add('X-NC-APPOINTMENT', $config->getToken());

		$filename = $this->random->generate(32, ISecureRandom::CHAR_ALPHANUMERIC);

		try {
			$calendar->createFromString($filename . '.ics', $vcalendar->serialize());
		} catch (CalendarException $e) {
			throw new RuntimeException('Could not write to calendar', 0, $e);
		}
	}
}
