<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Service;

use OC\App\CompareVersion;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCP\App\IAppManager;
use OCP\AppFramework\Services\IInitialState;
use OCP\Calendar\Resource\IManager as IResourceManager;
use OCP\Calendar\Room\IManager as IRoomManager;
use OCP\IAppConfig;
use OCP\IConfig;
use function in_array;

class CalendarInitialStateService {

	public function __construct(
		private string $appName,
		private IInitialState $initialStateService,
		private IAppManager $appManager,
		private IConfig $config,
		private IAppConfig $appConfig,
		private AppointmentConfigService $appointmentConfigService,
		private CompareVersion $compareVersion,
		private ?string $userId,
		private IResourceManager $resourceManager,
		private IRoomManager $roomManager,
	) {
	}

	public function run(): void {
		$defaultEventLimit = $this->config->getAppValue($this->appName, 'eventLimit', 'yes');
		$defaultInitialView = $this->config->getAppValue($this->appName, 'currentView', 'dayGridMonth');
		$defaultShowWeekends = $this->config->getAppValue($this->appName, 'showWeekends', 'yes');
		$defaultWeekNumbers = $this->config->getAppValue($this->appName, 'showWeekNr', 'no');
		$defaultSkipPopover = $this->config->getAppValue($this->appName, 'skipPopover', 'no');
		$defaultTimezone = $this->config->getAppValue($this->appName, 'timezone', 'automatic');
		$defaultSlotDuration = $this->config->getAppValue($this->appName, 'slotDuration', '00:30:00');
		$defaultDefaultReminder = $this->config->getAppValue($this->appName, 'defaultReminder', 'none');
		$defaultShowTasks = $this->config->getAppValue($this->appName, 'showTasks', 'yes');
		$defaultTasksSidebar = $this->config->getAppValue($this->appName, 'tasksSidebar', 'yes');

		$appVersion = $this->config->getAppValue($this->appName, 'installed_version', '');
		$eventLimit = $this->config->getUserValue($this->userId, $this->appName, 'eventLimit', $defaultEventLimit) === 'yes';
		$firstRun = $this->config->getUserValue($this->userId, $this->appName, 'firstRun', 'yes') === 'yes';
		$initialView = $this->getView($this->config->getUserValue($this->userId, $this->appName, 'currentView', $defaultInitialView));
		$showWeekends = $this->config->getUserValue($this->userId, $this->appName, 'showWeekends', $defaultShowWeekends) === 'yes';
		$showWeekNumbers = $this->config->getUserValue($this->userId, $this->appName, 'showWeekNr', $defaultWeekNumbers) === 'yes';
		$skipPopover = $this->config->getUserValue($this->userId, $this->appName, 'skipPopover', $defaultSkipPopover) === 'yes';
		$timezone = $this->config->getUserValue($this->userId, $this->appName, 'timezone', $defaultTimezone);
		$attachmentsFolder = $this->config->getUserValue($this->userId, 'dav', 'attachmentsFolder', '/Calendar');
		$slotDuration = $this->config->getUserValue($this->userId, $this->appName, 'slotDuration', $defaultSlotDuration);
		$defaultReminder = $this->config->getUserValue($this->userId, $this->appName, 'defaultReminder', $defaultDefaultReminder);
		$showTasks = $this->config->getUserValue($this->userId, $this->appName, 'showTasks', $defaultShowTasks) === 'yes';
		$tasksSidebar = $this->config->getUserValue($this->userId, $this->appName, 'tasksSidebar', $defaultTasksSidebar) === 'yes';
		$hideEventExport = $this->config->getAppValue($this->appName, 'hideEventExport', 'no') === 'yes';
		$disableAppointments = $this->config->getAppValue($this->appName, 'disableAppointments', 'no') === 'yes';
		$forceEventAlarmType = $this->config->getAppValue($this->appName, 'forceEventAlarmType', '');
		if (!in_array($forceEventAlarmType, ['DISPLAY', 'EMAIL'], true)) {
			$forceEventAlarmType = false;
		}
		$canSubscribeLink = $this->config->getAppValue('dav', 'allow_calendar_link_subscriptions', 'yes') === 'yes';
		$showResources = $this->config->getAppValue($this->appName, 'showResources', 'yes') === 'yes';
		$publicCalendars = $this->config->getAppValue($this->appName, 'publicCalendars', '');

		$talkEnabled = $this->appManager->isEnabledForUser('spreed');
		$talkApiVersion = version_compare($this->appManager->getAppVersion('spreed'), '12.0.0', '>=') ? 'v4' : 'v1';
		$tasksEnabled = $this->appManager->isEnabledForUser('tasks');

		$circleVersion = $this->appManager->getAppVersion('circles');
		$isCirclesEnabled = $this->appManager->isEnabledForUser('circles') === true;
		// if circles is not installed, we use 0.0.0
		$isCircleVersionCompatible = $this->compareVersion->isCompatible($circleVersion ? $circleVersion : '0.0.0', '22');

		$calendarFederationEnabled = $this->appConfig->getValueBool(
			'dav',
			'enableCalendarFederation',
			true,
		);

		$enableResourceBooking = !empty($this->resourceManager->getBackends())
			|| !empty($this->roomManager->getBackends());

		$this->initialStateService->provideInitialState('app_version', $appVersion);
		$this->initialStateService->provideInitialState('event_limit', $eventLimit);
		$this->initialStateService->provideInitialState('first_run', $firstRun);
		$this->initialStateService->provideInitialState('initial_view', $initialView);
		$this->initialStateService->provideInitialState('show_weekends', $showWeekends);
		$this->initialStateService->provideInitialState('show_week_numbers', $showWeekNumbers);
		$this->initialStateService->provideInitialState('skip_popover', $skipPopover);
		$this->initialStateService->provideInitialState('talk_enabled', $talkEnabled);
		$this->initialStateService->provideInitialState('talk_api_version', $talkApiVersion);
		$this->initialStateService->provideInitialState('timezone', $timezone);
		$this->initialStateService->provideInitialState('attachments_folder', $attachmentsFolder);
		$this->initialStateService->provideInitialState('slot_duration', $slotDuration);
		$this->initialStateService->provideInitialState('default_reminder', $defaultReminder);
		$this->initialStateService->provideInitialState('show_tasks', $showTasks);
		$this->initialStateService->provideInitialState('tasks_sidebar', $tasksSidebar);
		$this->initialStateService->provideInitialState('tasks_enabled', $tasksEnabled);
		$this->initialStateService->provideInitialState('hide_event_export', $hideEventExport);
		$this->initialStateService->provideInitialState('force_event_alarm_type', $forceEventAlarmType);
		if (!is_null($this->userId)) {
			$this->initialStateService->provideInitialState('appointmentConfigs', $this->appointmentConfigService->getAllAppointmentConfigurations($this->userId));
		}
		$this->initialStateService->provideInitialState('disable_appointments', $disableAppointments);
		$this->initialStateService->provideInitialState('can_subscribe_link', $canSubscribeLink);
		$this->initialStateService->provideInitialState('show_resources', $showResources);
		$this->initialStateService->provideInitialState('isCirclesEnabled', $isCirclesEnabled && $isCircleVersionCompatible);
		$this->initialStateService->provideInitialState('publicCalendars', $publicCalendars);
		$this->initialStateService->provideInitialState(
			'calendar_federation_enabled',
			$calendarFederationEnabled,
		);
		$this->initialStateService->provideInitialState(
			'resource_booking_enabled',
			$enableResourceBooking,
		);
	}

	/**
	 * Makes sure we don't use the old views anymore
	 *
	 * @param string $view
	 * @return string
	 */
	private function getView(string $view): string {
		switch ($view) {
			case 'agendaDay':
				return 'timeGridDay';

			case 'agendaWeek':
				return 'timeGridWeek';

			case 'month':
				return 'dayGridMonth';

			default:
				return $view;
		}
	}
}
