<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2019 Georg Ehrke <oc.list@georgehrke.com>
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

namespace OCA\Calendar\Controller;

use OCP\App\IAppManager;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\IInitialStateService;
use OCP\IRequest;
use ChristophWurst\Nextcloud\Testing\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

class ViewControllerTest extends TestCase {

	/** @var string */
	private $appName;

	/** @var IRequest|MockObject */
	private $request;

	/** @var IAppManager|MockObject */
	private $appManager;

	/** @var IConfig|MockObject */
	private $config;

	/** @var IInitialStateService|MockObject */
	private $initialStateService;

	/** @var string */
	private $userId;

	/** @var ViewController */
	private $controller;

	protected function setUp(): void {
		$this->appName = 'calendar';
		$this->request = $this->createMock(IRequest::class);
		$this->appManager = $this->createMock(IAppManager::class);
		$this->config = $this->createMock(IConfig::class);
		$this->initialStateService = $this->createMock(IInitialStateService::class);
		$this->userId = 'user123';

		$this->controller = new ViewController($this->appName, $this->request,
			$this->config, $this->initialStateService, $this->appManager, $this->userId);
	}

	public function testIndex(): void {
		$this->config
			->method('getAppValue')
			->willReturnMap([
				['calendar', 'eventLimit', 'yes', 'defaultEventLimit'],
				['calendar', 'currentView', 'dayGridMonth', 'defaultCurrentView'],
				['calendar', 'showWeekends', 'yes', 'defaultShowWeekends'],
				['calendar', 'showWeekNr', 'no', 'defaultShowWeekNr'],
				['calendar', 'skipPopover', 'no', 'defaultSkipPopover'],
				['calendar', 'timezone', 'automatic', 'defaultTimezone'],
				['calendar', 'slotDuration', '00:30:00', 'defaultSlotDuration'],
				['calendar', 'defaultReminder', 'none', 'defaultDefaultReminder'],
				['calendar', 'showTasks', 'yes', 'defaultShowTasks'],
				['calendar', 'installed_version', null, '1.0.0'],
			]);
		$this->config
			->method('getUserValue')
			->willReturnMap([
				['user123', 'calendar', 'eventLimit', 'defaultEventLimit', 'yes'],
				['user123', 'calendar', 'firstRun', 'yes', 'yes'],
				['user123', 'calendar', 'currentView', 'defaultCurrentView', 'timeGridWeek'],
				['user123', 'calendar', 'showWeekends', 'defaultShowWeekends', 'yes'],
				['user123', 'calendar', 'showWeekNr', 'defaultShowWeekNr', 'yes'],
				['user123', 'calendar', 'skipPopover', 'defaultSkipPopover', 'yes'],
				['user123', 'calendar', 'timezone', 'defaultTimezone', 'Europe/Berlin'],
				['user123', 'calendar', 'slotDuration', 'defaultSlotDuration', '00:15:00'],
				['user123', 'calendar', 'defaultReminder', 'defaultDefaultReminder', '00:10:00'],
				['user123', 'calendar', 'showTasks', 'defaultShowTasks', '00:15:00'],
			]);
		$this->appManager
			->method('isEnabledForUser')
			->willReturnMap([
				['spreed', null, true],
				['tasks', null, true]
			]);
		$this->appManager
			->method('getAppVersion')
			->willReturnMap([
				['spreed', true, '12.0.0'],
			]);

		$this->initialStateService
			->method('provideInitialState')
			->withConsecutive(
				['calendar', 'app_version', '1.0.0'],
				['calendar', 'event_limit', true],
				['calendar', 'first_run', true],
				['calendar', 'initial_view', 'timeGridWeek'],
				['calendar', 'show_weekends', true],
				['calendar', 'show_week_numbers', true],
				['calendar', 'skip_popover', true],
				['calendar', 'talk_enabled', true],
				['calendar', 'talk_api_version', 'v4'],
				['calendar', 'timezone', 'Europe/Berlin'],
				['calendar', 'slot_duration', '00:15:00'],
				['calendar', 'default_reminder', '00:10:00'],
				['calendar', 'show_tasks', false],
				['calendar', 'tasks_enabled', true]
			);

		$response = $this->controller->index();

		$this->assertInstanceOf(TemplateResponse::class, $response);
		$this->assertEquals([], $response->getParams());
		$this->assertEquals('user', $response->getRenderAs());
		$this->assertEquals('main', $response->getTemplateName());
	}

	/**
	 * @dataProvider viewFixDataProvider
	 *
	 * @param string $savedView
	 * @param string $expectedView
	 */
	public function testIndexViewFix(string $savedView, string $expectedView): void {
		$this->config
			->method('getAppValue')
			->willReturnMap([
				['calendar', 'eventLimit', 'yes', 'defaultEventLimit'],
				['calendar', 'currentView', 'dayGridMonth', 'defaultCurrentView'],
				['calendar', 'showWeekends', 'yes', 'defaultShowWeekends'],
				['calendar', 'showWeekNr', 'no', 'defaultShowWeekNr'],
				['calendar', 'skipPopover', 'no', 'defaultSkipPopover'],
				['calendar', 'timezone', 'automatic', 'defaultTimezone'],
				['calendar', 'slotDuration', '00:30:00', 'defaultSlotDuration'],
				['calendar', 'defaultReminder', 'none', 'defaultDefaultReminder'],
				['calendar', 'showTasks', 'yes', 'defaultShowTasks'],
				['calendar', 'installed_version', null, '1.0.0'],
			]);
		$this->config
			->method('getUserValue')
			->willReturnMap([
				['user123', 'calendar', 'eventLimit', 'defaultEventLimit', 'yes'],
				['user123', 'calendar', 'firstRun', 'yes', 'yes'],
				['user123', 'calendar', 'currentView', 'defaultCurrentView', $savedView],
				['user123', 'calendar', 'showWeekends', 'defaultShowWeekends', 'yes'],
				['user123', 'calendar', 'showWeekNr', 'defaultShowWeekNr', 'yes'],
				['user123', 'calendar', 'skipPopover', 'defaultSkipPopover', 'yes'],
				['user123', 'calendar', 'timezone', 'defaultTimezone', 'Europe/Berlin'],
				['user123', 'calendar', 'slotDuration', 'defaultSlotDuration', '00:15:00'],
				['user123', 'calendar', 'defaultReminder', 'defaultDefaultReminder', '00:10:00'],
				['user123', 'calendar', 'showTasks', 'defaultShowTasks', '00:15:00'],
			]);
		$this->appManager
			->method('isEnabledForUser')
			->willReturnMap([
				['spreed', null, false],
				['tasks', null, false]
			]);
		$this->appManager
			->method('getAppVersion')
			->willReturnMap([
				['spreed', true, '11.3.0'],
			]);

		$this->initialStateService
			->method('provideInitialState')
			->withConsecutive(
				['calendar', 'app_version', '1.0.0'],
				['calendar', 'event_limit', true],
				['calendar', 'first_run', true],
				['calendar', 'initial_view', $expectedView],
				['calendar', 'show_weekends', true],
				['calendar', 'show_week_numbers', true],
				['calendar', 'skip_popover', true],
				['calendar', 'talk_enabled', false],
				['calendar', 'talk_api_version', 'v1'],
				['calendar', 'timezone', 'Europe/Berlin'],
				['calendar', 'slot_duration', '00:15:00'],
				['calendar', 'default_reminder', '00:10:00'],
				['calendar', 'show_tasks', false],
				['calendar', 'tasks_enabled', false]
			);

		$response = $this->controller->index();

		$this->assertInstanceOf(TemplateResponse::class, $response);
		$this->assertEquals([], $response->getParams());
		$this->assertEquals('user', $response->getRenderAs());
		$this->assertEquals('main', $response->getTemplateName());
	}

	/**
	 * @return array
	 */
	public function viewFixDataProvider(): array {
		return [
			['agendaDay', 'timeGridDay'],
			['timeGridDay', 'timeGridDay'],
			['agendaWeek', 'timeGridWeek'],
			['timeGridWeek', 'timeGridWeek'],
			['month', 'dayGridMonth'],
			['dayGridMonth', 'dayGridMonth'],
		];
	}
}
