<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Dashboard;

use DateTimeImmutable;
use OCA\Calendar\Service\JSDataService;
use OCP\AppFramework\Services\IInitialState;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\Calendar\ICalendar;
use OCP\Calendar\ICalendarIsEnabled;
use OCP\Calendar\IManager;
use OCP\Dashboard\IButtonWidget;
use OCP\Dashboard\Model\WidgetItem;
use OCP\IDateTimeFormatter;
use OCP\IL10N;
use OCP\IURLGenerator;
use PHPUnit\Framework\MockObject\MockObject;
use Test\TestCase;

interface ITestCalendar extends ICalendar, ICalendarIsEnabled {
	// workaround for creating mock class with multiple interfaces
	// TODO: remove after phpUnit 10 is supported.
}

class CalendarWidgetTest extends TestCase {
	/** @var IL10N|MockObject */
	private $l10n;

	/** @var IInitialState|MockObject */
	private $initialState;

	/** @var JSDataService|MockObject */
	private $service;

	private CalendarWidget $widget;

	/** @var IDateTimeFormatter|MockObject */
	private $dateTimeFormatter;

	/** @var IURLGenerator|MockObject */
	private $urlGenerator;

	/** @var IManager|MockObject */
	private $calendarManager;

	/** @var ITimeFactory|MockObject */
	private $timeFactory;

	protected function setUp(): void {
		parent::setUp();

		if (!interface_exists(IButtonWidget::class)) {
			self::markTestIncomplete();
		}

		$this->l10n = $this->createMock(IL10N::class);
		$this->initialState = $this->createMock(IInitialState::class);
		$this->service = $this->createMock(JSDataService::class);
		$this->dateTimeFormatter = $this->createMock(IDateTimeFormatter::class);
		$this->urlGenerator = $this->createMock(IURLGenerator::class);
		$this->calendarManager = $this->createMock(IManager::class);
		$this->timeFactory = $this->createMock(ITimeFactory::class);

		$this->widget = new CalendarWidget(
			$this->l10n,
			$this->initialState,
			$this->service,
			$this->dateTimeFormatter,
			$this->urlGenerator,
			$this->calendarManager,
			$this->timeFactory,
		);
	}

	public function testGetId(): void {
		$this->assertEquals('calendar', $this->widget->getId());
	}

	public function testGetTitle(): void {
		$this->l10n->expects($this->exactly(1))
			->method('t')
			->willReturnArgument(0);

		$this->assertEquals('Upcoming events', $this->widget->getTitle());
	}

	public function testGetOrder(): void {
		$this->assertEquals(2, $this->widget->getOrder());
	}

	public function testGetIconClass(): void {
		$this->assertEquals('app-icon-calendar', $this->widget->getIconClass());
	}

	public function testGetUrl(): void {
		$this->assertNull($this->widget->getUrl());
	}

	public function testGetItems() : void {
		$userId = 'admin';
		$calendar = $this->createMock(ITestCalendar::class);
		self::invokePrivate($calendar, 'calendarInfo', [['{http://apple.com/ns/ical/}calendar-color' => '#ffffff']]);
		$calendars = [$calendar];
		$time = 1665550936;
		$start = (new DateTimeImmutable())->setTimestamp($time);
		$twoWeeks = $start->add(new \DateInterval('P14D'));
		$options = [
			'timerange' => [
				'start' => $start,
				'end' => $twoWeeks,
			]
		];
		$result = [
			'id' => '3599',
			'uid' => '59d30b6c-5a31-4d28-b1d6-c8f928180e96',
			'uri' => '60EE4FCB-2144-4811-BBD3-FFEA44739F40.ics',
			'objects' => [
				[
					'DTSTART' => [
						$start
					],
					'SUMMARY' => [
						'Test',
					]
				]
			]
		];

		$this->calendarManager->expects(self::once())
			->method('getCalendarsForPrincipal')
			->with('principals/users/' . $userId)
			->willReturn($calendars);
		$this->timeFactory->expects(self::once())
			->method('getTime')
			->willReturn($time);
		$calendar->expects(self::once())
			->method('isEnabled')
			->willReturn(true);
		$calendar->expects(self::once())
			->method('isDeleted')
			->willReturn(false);
		$calendar->expects(self::once())
			->method('search')
			->with('', [], $options, null)
			->willReturn([$result]);
		$calendar->expects(self::once())
			->method('getDisplayColor')
			->willReturn('#ffffff');
		$this->dateTimeFormatter->expects(self::once())
			->method('formatTimeSpan')
			->willReturn('12345678');
		$this->urlGenerator->expects(self::once())
			->method('getAbsoluteURL')
			->willReturn('59d30b6c-5a31-4d28-b1d6-c8f928180e96');

		$icon = 'data:image/svg+xml,' . rawurlencode('<svg height="32" width="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ffffff"/></svg>');

		$widget = new WidgetItem(
			$result['objects'][0]['SUMMARY'][0],
			'12345678',
			'59d30b6c-5a31-4d28-b1d6-c8f928180e96',
			$icon,
			(string)$start->getTimestamp(),
		);

		$widgets = $this->widget->getItems($userId);
		$this->assertCount(1, $widgets);
		$this->assertEquals($widgets[0], $widget);
	}

	public function testGetItemsCachesCalendarDotPerRequest(): void {
		$userId = 'admin';
		$calendarA = $this->createMock(ITestCalendar::class);
		$calendarB = $this->createMock(ITestCalendar::class);
		$time = 1665550936;
		$start = (new DateTimeImmutable())->setTimestamp($time);
		$twoWeeks = $start->add(new \DateInterval('P14D'));
		$options = [
			'timerange' => [
				'start' => $start,
				'end' => $twoWeeks,
			]
		];
		$resultA = [
			'id' => '3599',
			'uid' => 'uid-a',
			'uri' => 'a.ics',
			'objects' => [[
				'DTSTART' => [$start],
				'SUMMARY' => ['Test A'],
			]],
		];
		$resultB = [
			'id' => '3600',
			'uid' => 'uid-b',
			'uri' => 'b.ics',
			'objects' => [[
				'DTSTART' => [$start],
				'SUMMARY' => ['Test B'],
			]],
		];

		$this->calendarManager->expects(self::once())
			->method('getCalendarsForPrincipal')
			->with('principals/users/' . $userId)
			->willReturn([$calendarA, $calendarB]);
		$this->timeFactory->expects(self::once())
			->method('getTime')
			->willReturn($time);
		$calendarA->expects(self::once())
			->method('isEnabled')
			->willReturn(true);
		$calendarB->expects(self::once())
			->method('isEnabled')
			->willReturn(true);
		$calendarA->expects(self::once())
			->method('isDeleted')
			->willReturn(false);
		$calendarB->expects(self::once())
			->method('isDeleted')
			->willReturn(false);
		$calendarA->expects(self::once())
			->method('search')
			->with('', [], $options, null)
			->willReturn([$resultA]);
		$calendarB->expects(self::once())
			->method('search')
			->with('', [], $options, null)
			->willReturn([$resultB]);
		$calendarA->expects(self::once())
			->method('getDisplayColor')
			->willReturn('#abcdef');
		$calendarB->expects(self::once())
			->method('getDisplayColor')
			->willReturn('#abcdef');
		$this->dateTimeFormatter->expects(self::exactly(2))
			->method('formatTimeSpan')
			->willReturn('12345678');
		$this->urlGenerator->expects(self::exactly(2))
			->method('getAbsoluteURL')
			->willReturnOnConsecutiveCalls('uid-a', 'uid-b');

		$widgets = $this->widget->getItems($userId);

		$this->assertCount(2, $widgets);
		$this->assertSame($widgets[0]->getIconUrl(), $widgets[1]->getIconUrl());
	}

	public function testGetItemsWithDisabledCalendar() {
		$userId = 'admin';
		$calendar = $this->createMock(ITestCalendar::class);
		$calendars = [$calendar];
		$time = 1665550936;
		$start = (new DateTimeImmutable())->setTimestamp($time);
		$twoWeeks = $start->add(new \DateInterval('P14D'));
		$options = [
			'timerange' => [
				'start' => $start,
				'end' => $twoWeeks,
			]
		];
		$limit = 7;
		$result = [
			'id' => '3599',
			'uid' => '59d30b6c-5a31-4d28-b1d6-c8f928180e96',
			'uri' => '60EE4FCB-2144-4811-BBD3-FFEA44739F40.ics',
			'objects' => [
				[
					'DTSTART' => [
						$start
					],
					'SUMMARY' => [
						'Test',
					]
				]
			]
		];

		$this->calendarManager->expects(self::once())
			->method('getCalendarsForPrincipal')
			->with('principals/users/' . $userId)
			->willReturn($calendars);
		$this->timeFactory->expects(self::once())
			->method('getTime')
			->willReturn($time);
		$calendar->expects(self::once())
			->method('isEnabled')
			->willReturn(false);
		$calendar->expects(self::never())
			->method('isDeleted');

		$widgets = $this->widget->getItems($userId);
		$this->assertCount(0, $widgets);
	}

	public function testGetItemsWithDeletedCalendar() {
		$userId = 'admin';
		$calendar = $this->createMock(ITestCalendar::class);
		$calendars = [$calendar];
		$time = 1665550936;
		$start = (new DateTimeImmutable())->setTimestamp($time);
		$twoWeeks = $start->add(new \DateInterval('P14D'));
		$options = [
			'timerange' => [
				'start' => $start,
				'end' => $twoWeeks,
			]
		];
		$limit = 7;
		$result = [
			'id' => '3599',
			'uid' => '59d30b6c-5a31-4d28-b1d6-c8f928180e96',
			'uri' => '60EE4FCB-2144-4811-BBD3-FFEA44739F40.ics',
			'objects' => [
				[
					'DTSTART' => [
						$start
					],
					'SUMMARY' => [
						'Test',
					]
				]
			]
		];

		$this->calendarManager->expects(self::once())
			->method('getCalendarsForPrincipal')
			->with('principals/users/' . $userId)
			->willReturn($calendars);
		$this->timeFactory->expects(self::once())
			->method('getTime')
			->willReturn($time);
		$calendar->expects(self::once())
			->method('isEnabled')
			->willReturn(true);
		$calendar->expects(self::once())
			->method('isDeleted')
			->willReturn(true);
		$calendar->expects(self::never())
			->method('search');

		$widgets = $this->widget->getItems($userId);
		$this->assertCount(0, $widgets);
	}

	public function testGetItemsIncludesSoonestEventCreatedLast(): void {
		$time = 1665550936;
		$tomorrow = $time + 86400;
		$events = [];
		for ($i = 1; $i <= 7; $i++) {
			$events[] = $this->createSearchResult("Event $i", $tomorrow + ($i - 1) * 1800);
		}
		$events[] = $this->createSearchResult('Event 8', $tomorrow - 3600);
		$this->timeFactory->method('getTime')->willReturn($time);
		$this->dateTimeFormatter->method('formatTimeSpan')->willReturn('');
		$this->calendarManager->method('getCalendarsForPrincipal')->willReturn([$this->createCalendar($events)]);

		$widgets = $this->widget->getItems('admin');

		$this->assertSame(
			['Event 8', 'Event 1', 'Event 2', 'Event 3', 'Event 4', 'Event 5', 'Event 6'],
			array_map(static fn (WidgetItem $item): string => $item->getTitle(), $widgets),
		);
	}

	public function testGetItemsIncludesSoonestRecurrenceCreatedLast(): void {
		$time = 1665550936;
		$day = 86400;
		$series = [];
		for ($i = 1; $i <= 7; $i++) {
			$next = $time + ($i + 1) * $day;
			$series[] = $this->createSearchResult("Series $i", $next, $next + 7 * $day);
		}
		// The first occurrence started an hour ago and is still running, the widget shows the next one
		$series[] = $this->createSearchResult('Series 8', $time - 3600, $time + $day);
		$this->timeFactory->method('getTime')->willReturn($time);
		$this->dateTimeFormatter->method('formatTimeSpan')->willReturn('');
		$this->calendarManager->method('getCalendarsForPrincipal')->willReturn([$this->createCalendar($series)]);

		$widgets = $this->widget->getItems('admin');

		$this->assertSame(
			['Series 8', 'Series 1', 'Series 2', 'Series 3', 'Series 4', 'Series 5', 'Series 6'],
			array_map(static fn (WidgetItem $item): string => $item->getTitle(), $widgets),
		);
		$this->assertSame((string)($time + $day), $widgets[0]->getSinceId());
	}

	public function testGetItemsLimitsItemsAcrossCalendars(): void {
		$time = 1665550936;
		$eventsA = [];
		$eventsB = [];
		for ($i = 1; $i <= 5; $i++) {
			$eventsA[] = $this->createSearchResult("A$i", $time + (2 * $i - 1) * 3600);
			$eventsB[] = $this->createSearchResult("B$i", $time + 2 * $i * 3600);
		}
		$this->timeFactory->method('getTime')->willReturn($time);
		$this->dateTimeFormatter->method('formatTimeSpan')->willReturn('');
		$this->calendarManager->method('getCalendarsForPrincipal')->willReturn([
			$this->createCalendar($eventsA),
			$this->createCalendar($eventsB),
		]);

		$widgets = $this->widget->getItems('admin');

		$this->assertSame(
			['A1', 'B1', 'A2', 'B2', 'A3', 'B3', 'A4'],
			array_map(static fn (WidgetItem $item): string => $item->getTitle(), $widgets),
		);
	}

	public function testGetItemsV2IncludesEventLaterTodayCreatedLast(): void {
		$time = 1665550936;
		$startOfTomorrow = (new DateTimeImmutable('@' . $time))->modify('tomorrow');
		$events = [];
		for ($i = 1; $i <= 7; $i++) {
			$events[] = $this->createSearchResult("Tomorrow $i", $startOfTomorrow->getTimestamp() + $i * 3600);
		}
		$events[] = $this->createSearchResult('Today', $time + 3 * 3600);
		$this->timeFactory->method('getTime')->willReturn($time);
		$this->timeFactory->method('getDateTime')->with('tomorrow')->willReturn(\DateTime::createFromImmutable($startOfTomorrow));
		$this->dateTimeFormatter->method('formatTimeSpan')->willReturn('');
		$this->l10n->method('t')->willReturnArgument(0);
		$this->calendarManager->method('getCalendarsForPrincipal')->willReturn([$this->createCalendar($events)]);

		$widgetItems = $this->widget->getItemsV2('admin');

		$this->assertSame('', $widgetItems->getHalfEmptyContentMessage());
		$this->assertSame('Today', $widgetItems->getItems()[0]->getTitle());
	}

	/**
	 * Like CalDavBackend::search(), a limit keeps the first events in creation order, not the soonest ones.
	 */
	private function createCalendar(array $events): ITestCalendar&MockObject {
		$calendar = $this->createMock(ITestCalendar::class);
		$calendar->method('isEnabled')->willReturn(true);
		$calendar->method('isDeleted')->willReturn(false);
		$calendar->method('search')->willReturnCallback(
			static fn (string $pattern, array $searchProperties = [], array $options = [], ?int $limit = null): array => array_slice($events, 0, $limit),
		);

		return $calendar;
	}

	private function createSearchResult(string $summary, int ...$timestamps): array {
		return [
			'uid' => $summary,
			'objects' => array_map(static fn (int $timestamp): array => [
				'DTSTART' => [(new DateTimeImmutable())->setTimestamp($timestamp)],
				'SUMMARY' => [$summary],
			], $timestamps),
		];
	}
}
