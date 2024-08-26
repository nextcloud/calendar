<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Service;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OC\App\CompareVersion;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCP\App\IAppManager;
use OCP\AppFramework\Services\IInitialState;
use OCP\IConfig;
use PHPUnit\Framework\MockObject\MockObject;

class CalendarInitialStateServiceTest extends TestCase {

	/** @var string */
	private $appName;

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

	/** @var CalendarInitialStateService */
	private $service;

	/** @var CompareVersion|MockObject */
	private $compareVersion;

	protected function setUp(): void {
		$this->appName = 'calendar';
		$this->appManager = $this->createMock(IAppManager::class);
		$this->config = $this->createMock(IConfig::class);
		$this->appointmentContfigService = $this->createMock(AppointmentConfigService::class);
		$this->initialStateService = $this->createMock(IInitialState::class);
		$this->compareVersion = $this->createMock(CompareVersion::class);
		$this->userId = 'user123';
	}

	public function testRun(): void {
		$this->service = new CalendarInitialStateService(
			$this->appName,
			$this->initialStateService,
			$this->appManager,
			$this->config,
			$this->appointmentContfigService,
			$this->compareVersion,
			$this->userId,
		);
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

		$this->service->run();
	}

	public function testRunAnonymously(): void {
		$this->service = new CalendarInitialStateService(
			$this->appName,
			$this->initialStateService,
			$this->appManager,
			$this->config,
			$this->appointmentContfigService,
			$this->compareVersion,
			null,
		);
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
				[null, 'calendar', 'eventLimit', 'defaultEventLimit', 'yes'],
				[null, 'calendar', 'firstRun', 'yes', 'yes'],
				[null, 'calendar', 'currentView', 'defaultCurrentView', 'timeGridWeek'],
				[null, 'calendar', 'showWeekends', 'defaultShowWeekends', 'yes'],
				[null, 'calendar', 'showWeekNr', 'defaultShowWeekNr', 'yes'],
				[null, 'calendar', 'skipPopover', 'defaultSkipPopover', 'yes'],
				[null, 'calendar', 'timezone', 'defaultTimezone', 'Europe/Berlin'],
				[null, 'dav', 'attachmentsFolder', '/Calendar', '/Calendar'],
				[null, 'calendar', 'slotDuration', 'defaultSlotDuration', '00:15:00'],
				[null, 'calendar', 'defaultReminder', 'defaultDefaultReminder', '00:10:00'],
				[null, 'calendar', 'showTasks', 'defaultShowTasks', '00:15:00'],
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
		$this->initialStateService->expects(self::exactly(22))
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
				['disable_appointments', false],
				['can_subscribe_link', false],
				['show_resources', true],
				['isCirclesEnabled', false],
				['publicCalendars', null],
			);

		$this->service->run();
	}

	/**
	 * @dataProvider viewFixDataProvider
	 *
	 * @param string $savedView
	 * @param string $expectedView
	 */
	public function testIndexViewFix(string $savedView, string $expectedView): void {
		$this->service = new CalendarInitialStateService(
			$this->appName,
			$this->initialStateService,
			$this->appManager,
			$this->config,
			$this->appointmentContfigService,
			$this->compareVersion,
			$this->userId,
		);
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

		$this->service->run();

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
