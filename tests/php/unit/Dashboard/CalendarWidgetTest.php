<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @author Thomas Citharel <nextcloud@tcit.fr>
 *
 * @copyright 2020 Georg Ehrke <oc.list@georgehrke.com>
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
namespace OCA\Calendar\Dashboard;

use OC\AppFramework\Services\InitialState;
use OCA\Calendar\Service\JSDataService;
use OCA\DAV\CalDAV\CalendarImpl;
use OCP\AppFramework\Services\IInitialState;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\Calendar\IManager;
use OCP\Dashboard\IButtonWidget;
use OCP\Dashboard\Model\WidgetItem;
use OCP\IDateTimeFormatter;
use OCP\IInitialStateService;
use OCP\IL10N;
use OCP\IURLGenerator;
use PHPUnit\Framework\MockObject\MockObject;
use Safe\DateTimeImmutable;
use Test\TestCase;

class CalendarWidgetTest extends TestCase {
	/** @var IL10N|MockObject  */
	private $l10n;

	/** @var IInitialState|MockObject  */
	private $initialState;

	/** @var JSDataService|MockObject  */
	private $service;

	private CalendarWidget $widget;

	/** @var IDateTimeFormatter|MockObject  */
	private $dateTimeFormatter;

	/** @var IURLGenerator|MockObject  */
	private $urlGenerator;

	/** @var IManager|MockObject  */
	private $calendarManager;

	/** @var ITimeFactory|MockObject  */
	private $timeFactory;

	protected function setUp(): void {
		parent::setUp();

		if (!interface_exists(IButtonWidget::class)) {
			self::markTestIncomplete();
		}

		$this->l10n = $this->createMock(IL10N::class);
		$this->initialState = $this->createMock(InitialState::class);
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

	public function testLoad(): void {
		$this->initialState->expects($this->once())
			->method('provideLazyInitialState')
			->with('dashboard_data', $this->callback(function ($actual) {
				$fnResult = $actual();
				return $fnResult === $this->service;
			}));

		$this->widget->load();
	}

	public function testGetItems() : void {
		$userId = 'admin';
		$calendar = $this->createMock(CalendarImpl::class);
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
			->method('search')
			->with('', [], $options, $limit)
			->willReturn([$result]);
		$calendar->expects(self::once())
			->method('getDisplayColor')
			->willReturn('#ffffff');
		$this->dateTimeFormatter->expects(self::once())
			->method('formatTimeSpan')
			->willReturn('12345678');
		$this->urlGenerator->expects(self::exactly(2))
			->method('getAbsoluteURL')
			->willReturnOnConsecutiveCalls('59d30b6c-5a31-4d28-b1d6-c8f928180e96', '#ffffff');

		$widget = new WidgetItem(
			$result['objects'][0]['SUMMARY'][0],
			'12345678',
			'59d30b6c-5a31-4d28-b1d6-c8f928180e96',
			'#ffffff',
			(string) $start->getTimestamp(),
		);

		$widgets = $this->widget->getItems($userId);
		$this->assertCount(1, $widgets);
		$this->assertEquals($widgets[0], $widget);
	}
}
