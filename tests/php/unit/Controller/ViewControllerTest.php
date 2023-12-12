<?php

declare(strict_types=1);

/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @author Richard Steinmetz
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

use ChristophWurst\Nextcloud\Testing\TestCase;
use OC\App\CompareVersion;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCP\App\IAppManager;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Services\IInitialState;
use OCP\Files\IAppData;
use OCP\IConfig;
use OCP\IRequest;
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

	/** @var AppointmentConfigService|MockObject */
	private $appointmentContfigService;

	/** @var IInitialState|MockObject */
	private $initialStateService;

	/** @var string */
	private $userId;

	/** @var ViewController */
	private $controller;

	/** @var IAppData|MockObject */
	private $appData;

	/** @var CompareVersion|MockObject*/
	private $compareVersion;

	protected function setUp(): void {
		$this->appName = 'calendar';
		$this->request = $this->createMock(IRequest::class);
		$this->appManager = $this->createMock(IAppManager::class);
		$this->config = $this->createMock(IConfig::class);
		$this->appointmentContfigService = $this->createMock(AppointmentConfigService::class);
		$this->initialStateService = $this->createMock(IInitialState::class);
		$this->compareVersion = $this->createMock(CompareVersion::class);
		$this->userId = 'user123';
		$this->appData = $this->createMock(IAppData::class);

		$this->controller = new ViewController(
			$this->appName,
			$this->request,
			$this->config,
			$this->appointmentContfigService,
			$this->initialStateService,
			$this->appManager,
			$this->compareVersion,
			$this->userId,
			$this->appData,
		);
	}

	public function testIndex(): void {
		$this->config->expects(self::exactly(16))
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
				['calendar', 'installed_version', '', '1.0.0'],
				['calendar', 'hideEventExport', 'no', 'yes'],
				['calendar', 'disableAppointments', 'no', 'no'],
				['calendar', 'forceEventAlarmType', '', 'forceEventAlarmType'],
				['dav', 'allow_calendar_link_subscriptions', 'yes', 'no'],
				['calendar', 'showResources', 'yes', 'yes'],
				['calendar', 'publicCalendars', ''],
			]);
		$this->config->expects(self::exactly(11))
			->method('getUserValue')
			->willReturnMap([
				['user123', 'calendar', 'eventLimit', 'defaultEventLimit', 'yes'],
				['user123', 'calendar', 'firstRun', 'yes', 'yes'],
				['user123', 'calendar', 'currentView', 'defaultCurrentView', 'timeGridWeek'],
				['user123', 'calendar', 'showWeekends', 'defaultShowWeekends', 'yes'],
				['user123', 'calendar', 'showWeekNr', 'defaultShowWeekNr', 'yes'],
				['user123', 'calendar', 'skipPopover', 'defaultSkipPopover', 'yes'],
				['user123', 'calendar', 'timezone', 'defaultTimezone', 'Europe/Berlin'],
				['user123', 'dav', 'attachmentsFolder', '/Calendar', '/Calendar'],
				['user123', 'calendar', 'slotDuration', 'defaultSlotDuration', '00:15:00'],
				['user123', 'calendar', 'defaultReminder', 'defaultDefaultReminder', '00:10:00'],
				['user123', 'calendar', 'showTasks', 'defaultShowTasks', '00:15:00'],
			]);
		$this->appManager->expects(self::exactly(3))
			->method('isEnabledForUser')
			->willReturnMap([
				['spreed', null, true],
				['tasks', null, true],
				['circles', null, false],
			]);
		$this->appManager->expects(self::exactly(2))
			->method('getAppVersion')
			->willReturnMap([
				['spreed', true, '12.0.0'],
				['circles', true, '22.0.0'],
			]);
		$this->appointmentContfigService->expects(self::once())
			->method('getAllAppointmentConfigurations')
			->with($this->userId)
			->willReturn([new AppointmentConfig()]);
		$this->initialStateService->expects(self::exactly(23))
			->method('provideInitialState')
			->withConsecutive(
				['app_version', '1.0.0'],
				['event_limit', true],
				['first_run', true],
				['initial_view', 'timeGridWeek'],
				['show_weekends', true],
				['show_week_numbers', true],
				['skip_popover', true],
				['talk_enabled', true],
				['talk_api_version', 'v4'],
				['timezone', 'Europe/Berlin'],
				['attachments_folder', '/Calendar'],
				['slot_duration', '00:15:00'],
				['default_reminder', '00:10:00'],
				['show_tasks', false],
				['tasks_enabled', true],
				['hide_event_export', true],
				['force_event_alarm_type', null],
				['appointmentConfigs', [new AppointmentConfig()]],
				['disable_appointments', false],
				['can_subscribe_link', false],
				['show_resources', true],
				['isCirclesEnabled', false],
				['publicCalendars', null],
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
		$this->config->expects(self::exactly(16))
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
				['calendar', 'installed_version', '', '1.0.0'],
				['calendar', 'hideEventExport', 'no', 'yes'],
				['calendar', 'disableAppointments', 'no', 'no'],
				['calendar', 'forceEventAlarmType', '', 'forceEventAlarmType'],
				['dav', 'allow_calendar_link_subscriptions', 'yes', 'no'],
				['calendar', 'showResources', 'yes', 'yes'],
				['calendar', 'publicCalendars', ''],
			]);
		$this->config->expects(self::exactly(11))
			->method('getUserValue')
			->willReturnMap([
				['user123', 'calendar', 'eventLimit', 'defaultEventLimit', 'yes'],
				['user123', 'calendar', 'firstRun', 'yes', 'yes'],
				['user123', 'calendar', 'currentView', 'defaultCurrentView', $savedView],
				['user123', 'calendar', 'showWeekends', 'defaultShowWeekends', 'yes'],
				['user123', 'calendar', 'showWeekNr', 'defaultShowWeekNr', 'yes'],
				['user123', 'calendar', 'skipPopover', 'defaultSkipPopover', 'yes'],
				['user123', 'calendar', 'timezone', 'defaultTimezone', 'Europe/Berlin'],
				['user123', 'dav', 'attachmentsFolder', '/Calendar', '/Calendar'],
				['user123', 'calendar', 'slotDuration', 'defaultSlotDuration', '00:15:00'],
				['user123', 'calendar', 'defaultReminder', 'defaultDefaultReminder', '00:10:00'],
				['user123', 'calendar', 'showTasks', 'defaultShowTasks', '00:15:00'],
			]);
		$this->appManager->expects(self::exactly(3))
			->method('isEnabledForUser')
			->willReturnMap([
				['spreed', null, false],
				['tasks', null, false],
				['circles', null, false],
			]);
		$this->appManager->expects(self::exactly(2))
			->method('getAppVersion')
			->willReturnMap([
				['spreed', true, '11.3.0'],
				['circles', true, '22.0.0'],
			]);
		$this->appointmentContfigService->expects(self::once())
			->method('getAllAppointmentConfigurations')
			->with($this->userId)
			->willReturn([new AppointmentConfig()]);
		$this->initialStateService->expects(self::exactly(23))
			->method('provideInitialState')
			->withConsecutive(
				['app_version', '1.0.0'],
				['event_limit', true],
				['first_run', true],
				['initial_view', $expectedView],
				['show_weekends', true],
				['show_week_numbers', true],
				['skip_popover', true],
				['talk_enabled', false],
				['talk_api_version', 'v1'],
				['timezone', 'Europe/Berlin'],
				['attachments_folder', '/Calendar'],
				['slot_duration', '00:15:00'],
				['default_reminder', '00:10:00'],
				['show_tasks', false],
				['tasks_enabled', false],
				['hide_event_export', true],
				['force_event_alarm_type', null],
				['appointmentConfigs', [new AppointmentConfig()]],
				['disable_appointments', false],
				['can_subscribe_link', false],
				['show_resources', true],
				['isCirclesEnabled', false],
				['publicCalendars', null],
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
