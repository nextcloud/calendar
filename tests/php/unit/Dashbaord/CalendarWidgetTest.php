<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @author Georg Ehrke
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

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Service\JSDataService;
use OCP\IInitialStateService;
use OCP\IL10N;

class CalendarWidgetTest extends TestCase {

	/** @var IL10N|\PHPUnit\Framework\MockObject\MockObject */
	private $l10n;

	/** @var IInitialStateService|\PHPUnit\Framework\MockObject\MockObject */
	private $initialState;

	/** @var JSDataService|\PHPUnit\Framework\MockObject\MockObject */
	private $service;

	/** @var CalendarWidget */
	private $widget;

	protected function setUp(): void {
		parent::setUp();

		$this->l10n = $this->createMock(IL10N::class);
		$this->initialState = $this->createMock(IInitialStateService::class);
		$this->service = $this->createMock(JSDataService::class);

		$this->widget = new CalendarWidget($this->l10n, $this->initialState, $this->service);
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
		$this->assertEquals('icon-calendar-dark', $this->widget->getIconClass());
	}

	public function testGetUrl(): void {
		$this->assertNull($this->widget->getUrl());
	}

	public function testLoad(): void {
		$this->initialState->expects($this->once())
			->method('provideLazyInitialState')
			->with('calendar', 'dashboard_data', $this->callback(function ($actual) {
				$fnResult = $actual();
				return $fnResult === $this->service;
			}));

		$this->widget->load();
	}
}
