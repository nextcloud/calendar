<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Service;

use OCA\Calendar\AppInfo\Application;
use OCA\Calendar\Exception\ServiceException;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\Calendar\ICreateFromString;
use OCP\Calendar\IManager as ICalendarManager;
use OCP\Files\IAppData;
use OCP\Files\NotFoundException;
use OCP\Files\NotPermittedException;
use OCP\IAppConfig;
use OCP\Security\ISecureRandom;
use Sabre\VObject\Component\VCalendar;
use Sabre\VObject\Component\VEvent;

class ExampleEventService {
	private const FOLDER_NAME = 'example_event';
	private const FILE_NAME = 'example_event.ics';
	private const ENABLE_CONFIG_KEY = 'create_example_event';

	public function __construct(
		private readonly ICalendarManager $calendarManager,
		private readonly ISecureRandom $random,
		private readonly ITimeFactory $time,
		private readonly IAppData $appData,
		private readonly IAppConfig $appConfig,
	) {
	}

	public function createExampleEvent(string $userId): void {
		$calendars = $this->calendarManager->getCalendarsForPrincipal("principals/users/$userId");
		if ($calendars === []) {
			throw new ServiceException("User $userId has no calendars");
		}

		/** @var ICreateFromString $firstCalendar */
		$firstCalendar = $calendars[0];

		$customIcs = $this->getCustomExampleEvent();
		if ($customIcs === null) {
			$this->createDefaultEvent($firstCalendar);
			return;
		}

		// TODO: parsing should be handled inside OCP
		try {
			$vCalendar = \Sabre\VObject\Reader::read($customIcs);
			if (!($vCalendar instanceof VCalendar)) {
				throw new ServiceException('Custom event does not contain a VCALENDAR component');
			}

			/** @var VEvent|null $vEvent */
			$vEvent = $vCalendar->getBaseComponent('VEVENT');
			if ($vEvent === null) {
				throw new ServiceException('Custom event does not contain a VEVENT component');
			}
		} catch (\Exception $e) {
			throw new ServiceException('Failed to parse custom event: ' . $e->getMessage(), 0, $e);
		}

		$uid = $this->random->generate(32, ISecureRandom::CHAR_ALPHANUMERIC);
		$vEvent->UID = $uid;
		$vEvent->DTSTART = $this->getStartDate();
		$vEvent->DTEND = $this->getEndDate();
		$vEvent->remove('ORGANIZER');
		$vEvent->remove('ATTENDEE');
		$firstCalendar->createFromString("$uid.ics", $vCalendar->serialize());
	}

	private function getStartDate(): \DateTimeInterface {
		return $this->time->now()
			->add(new \DateInterval('P7D'))
			->setTime(10, 00);
	}

	private function getEndDate(): \DateTimeInterface {
		return $this->time->now()
			->add(new \DateInterval('P7D'))
			->setTime(11, 00);
	}

	private function createDefaultEvent(ICreateFromString $calendar): void {
		$defaultDescription = <<<EOF
Welcome to Nextcloud Calendar!

This is a sample event - explore the flexibility of planning with Nextcloud Calendar by making any edits you want!

With Nextcloud Calendar, you can:
- Create, edit, and manage events effortlessly.
- Create multiple calendars and share them with teammates, friends, or family.
- Check availability and display your busy times to others.
- Seamlessly integrate with apps and devices via CalDAV.
- Customize your experience: schedule recurring events, adjust notifications and other settings.
EOF;

		$eventBuilder = $this->calendarManager->createEventBuilder();
		$eventBuilder->setSummary('Example event - open me!');
		$eventBuilder->setDescription($defaultDescription);
		$eventBuilder->setStartDate($this->getStartDate());
		$eventBuilder->setEndDate($this->getEndDate());
		$eventBuilder->createInCalendar($calendar);
	}

	/**
	 * @return string|null The ics of the custom example event or null if no custom event was uploaded.
	 * @throws ServiceException If reading the custom ics file fails.
	 */
	private function getCustomExampleEvent(): ?string {
		try {
			$folder = $this->appData->getFolder(self::FOLDER_NAME);
			$icsFile = $folder->getFile(self::FILE_NAME);
		} catch (NotFoundException $e) {
			return null;
		}

		try {
			return $icsFile->getContent();
		} catch (NotFoundException|NotPermittedException $e) {
			throw new ServiceException(
				'Failed to read custom example event',
				0,
				$e,
			);
		}
	}

	public function saveCustomExampleEvent(string $ics): void {
		try {
			$folder = $this->appData->getFolder(self::FOLDER_NAME);
		} catch (NotFoundException $e) {
			$folder = $this->appData->newFolder(self::FOLDER_NAME);
		}

		try {
			$existingFile = $folder->getFile(self::FILE_NAME);
			$existingFile->putContent($ics);
		} catch (NotFoundException $e) {
			$folder->newFile(self::FILE_NAME, $ics);
		}
	}

	public function deleteCustomExampleEvent(): void {
		try {
			$folder = $this->appData->getFolder(self::FOLDER_NAME);
			$file = $folder->getFile(self::FILE_NAME);
		} catch (NotFoundException $e) {
			return;
		}

		$file->delete();
	}

	public function hasCustomExampleEvent(): bool {
		try {
			return $this->getCustomExampleEvent() !== null;
		} catch (ServiceException $e) {
			return false;
		}
	}

	public function setCreateExampleEvent(bool $enable) {
		$this->appConfig->setValueBool(Application::APP_ID, self::ENABLE_CONFIG_KEY, $enable);
	}

	public function shouldCreateExampleEvent(): bool {
		return $this->appConfig->getValueBool(Application::APP_ID, self::ENABLE_CONFIG_KEY, true);
	}
}
