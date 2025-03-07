<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Tests\Unit\Service;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Service\ExampleEventService;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\Calendar\ICalendarEventBuilder;
use OCP\Calendar\ICreateFromString;
use OCP\Calendar\IManager as ICalendarManager;
use OCP\Files\IAppData;
use OCP\Files\NotFoundException;
use OCP\Files\SimpleFS\ISimpleFile;
use OCP\Files\SimpleFS\ISimpleFolder;
use OCP\IAppConfig;
use OCP\Security\ISecureRandom;
use PHPUnit\Framework\MockObject\MockObject;

class ExampleEventServiceTest extends TestCase {
	private ExampleEventService $service;

	private ICalendarManager&MockObject $calendarManager;
	private ISecureRandom&MockObject $random;
	private ITimeFactory&MockObject $time;
	private IAppData&MockObject $appData;
	private IAppConfig&MockObject $appConfig;

	protected function setUp(): void {
		if (!interface_exists(ICalendarEventBuilder::class)) {
			$this->markTestSkipped('Feature is not available on this version of Nextcloud');
			return;
		}

		$this->calendarManager = $this->createMock(ICalendarManager::class);
		$this->random = $this->createMock(ISecureRandom::class);
		$this->time = $this->createMock(ITimeFactory::class);
		$this->appData = $this->createMock(IAppData::class);
		$this->appConfig = $this->createMock(IAppConfig::class);

		$this->service = new ExampleEventService(
			$this->calendarManager,
			$this->random,
			$this->time,
			$this->appData,
			$this->appConfig,
		);
	}

	public static function createExampleEventWithCustomEventDataProvider(): array {
		return [
			[file_get_contents(__DIR__ . '/../../../assets/ics/example-events/custom-event.ics')],
			[file_get_contents(__DIR__ . '/../../../assets/ics/example-events/custom-event-with-attendees.ics')],
		];
	}

	/** @dataProvider createExampleEventWithCustomEventDataProvider */
	public function testCreateExampleEventWithCustomEvent($customEventIcs): void {
		$calendar = $this->createMock(ICreateFromString::class);
		$this->calendarManager->expects(self::once())
			->method('getCalendarsForPrincipal')
			->with('principals/users/user')
			->willReturn([$calendar]);

		$exampleEventFolder = $this->createMock(ISimpleFolder::class);
		$this->appData->expects(self::once())
			->method('getFolder')
			->with('example_event')
			->willReturn($exampleEventFolder);
		$exampleEventFile = $this->createMock(ISimpleFile::class);
		$exampleEventFolder->expects(self::once())
			->method('getFile')
			->with('example_event.ics')
			->willReturn($exampleEventFile);
		$exampleEventFile->expects(self::once())
			->method('getContent')
			->willReturn($customEventIcs);

		$this->calendarManager->expects(self::never())
			->method('createEventBuilder');

		$this->random->expects(self::once())
			->method('generate')
			->with(32, ISecureRandom::CHAR_ALPHANUMERIC)
			->willReturn('RANDOM-UID');

		$now = new \DateTimeImmutable('2025-01-21T00:00:00Z');
		$this->time->expects(self::exactly(2))
			->method('now')
			->willReturn($now);

		$expectedIcs = file_get_contents(__DIR__ . '/../../../assets/ics/example-events/custom-event-expected.ics');
		$calendar->expects(self::once())
			->method('createFromString')
			->with('RANDOM-UID.ics', $expectedIcs);

		$this->service->createExampleEvent('user');
	}

	public function testCreateExampleEventWithDefaultEvent(): void {
		$calendar = $this->createMock(ICreateFromString::class);
		$this->calendarManager->expects(self::once())
			->method('getCalendarsForPrincipal')
			->with('principals/users/user')
			->willReturn([$calendar]);

		$this->appData->expects(self::once())
			->method('getFolder')
			->with('example_event')
			->willThrowException(new NotFoundException());

		$eventBuilder = $this->createMock(ICalendarEventBuilder::class);
		$this->calendarManager->expects(self::once())
			->method('createEventBuilder')
			->willReturn($eventBuilder);

		$eventBuilder->expects(self::once())
			->method('setSummary');
		$eventBuilder->expects(self::once())
			->method('setDescription');
		$eventBuilder->expects(self::once())
			->method('setStartDate')
			->with(new \DateTimeImmutable('2025-01-28T10:00:00Z'));
		$eventBuilder->expects(self::once())
			->method('setEndDate')
			->with(new \DateTimeImmutable('2025-01-28T11:00:00Z'));
		$eventBuilder->expects(self::once())
			->method('createInCalendar')
			->with($calendar);

		$now = new \DateTimeImmutable('2025-01-21T00:00:00Z');
		$this->time->expects(self::exactly(2))
			->method('now')
			->willReturn($now);

		$calendar->expects(self::never())
			->method('createFromString');

		$this->service->createExampleEvent('user');
	}

	public function testCreateExampleEventWithoutCalendars(): void {
		$this->calendarManager->expects(self::once())
			->method('getCalendarsForPrincipal')
			->with('principals/users/invalid')
			->willReturn([]);

		$this->calendarManager->expects(self::never())
			->method('createEventBuilder');

		$this->appData->expects(self::never())
			->method('getFolder');

		$this->expectException(ServiceException::class);
		$this->expectExceptionMessage('has no calendars');
		$this->service->createExampleEvent('invalid');
	}
}
