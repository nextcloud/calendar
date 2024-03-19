<?php

declare(strict_types=1);

/*
 * @copyright 2024 Hamza Mahjoubi <hamza.mahjoubi221@proton.me>
 *
 * @author 2024 Hamza Mahjoubi <hamza.mahjoubi221@proton.me>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

namespace OCA\Calendar\Listener;

use OC\App\CompareVersion;
use OCA\Calendar\AppInfo\Application;
use OCP\App\IAppManager;
use OCP\AppFramework\Services\IInitialState;
use OCP\Collaboration\Reference\RenderReferenceEvent;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Files\IAppData;
use OCP\IConfig;



use OCP\Util;

/**
 * @template-implements IEventListener<Event|RenderReferenceEvent>
 */
class CalendarReferenceListener implements IEventListener {

	/** @var IInitialState */
	private $initialStateService;

	/** @var IAppManager */
	private $appManager;

	/** @var IConfig */
	private $config;
	
	/** @var CompareVersion */
	private $compareVersion;

	private IAppData $appData;

	public function __construct(
		IInitialState $initialStateService,
		IAppManager $appManager,
		IConfig $config,
		IAppData $appData,
		CompareVersion $compareVersion,
	) {
		$this->config = $config;
		$this->initialStateService = $initialStateService;
		$this->appManager = $appManager;
		$this->appData = $appData;
		$this->compareVersion = $compareVersion;

	}

	public function handle(Event $event): void {
		if (!$event instanceof RenderReferenceEvent) {
			return;
		}
		$defaultEventLimit = $this->config->getAppValue('calendar', 'eventLimit', 'yes');
		$defaultInitialView = $this->config->getAppValue('calendar', 'currentView', 'dayGridMonth');
		$defaultShowWeekends = $this->config->getAppValue('calendar', 'showWeekends', 'yes');
		$defaultWeekNumbers = $this->config->getAppValue('calendar', 'showWeekNr', 'no');
		$defaultSkipPopover = $this->config->getAppValue('calendar', 'skipPopover', 'no');
		$defaultTimezone = $this->config->getAppValue('calendar', 'timezone', 'automatic');
		$defaultSlotDuration = $this->config->getAppValue('calendar', 'slotDuration', '00:30:00');
		$defaultDefaultReminder = $this->config->getAppValue('calendar', 'defaultReminder', 'none');

		$appVersion = $this->config->getAppValue('calendar', 'installed_version', '');
		$forceEventAlarmType = $this->config->getAppValue('calendar', 'forceEventAlarmType', '');
		if (!in_array($forceEventAlarmType, ['DISPLAY', 'EMAIL'], true)) {
			$forceEventAlarmType = false;
		}
		$showResources = $this->config->getAppValue('calendar', 'showResources', 'yes') === 'yes';
		$publicCalendars = $this->config->getAppValue('calendar', 'publicCalendars', '');

		$talkApiVersion = version_compare($this->appManager->getAppVersion('spreed'), '12.0.0', '>=') ? 'v4' : 'v1';
		$tasksEnabled = $this->appManager->isEnabledForUser('tasks');

		$circleVersion = $this->appManager->getAppVersion('circles');
		$isCirclesEnabled = $this->appManager->isEnabledForUser('circles') === true;
		// if circles is not installed, we use 0.0.0
		$isCircleVersionCompatible = $this->compareVersion->isCompatible($circleVersion ? $circleVersion : '0.0.0', '22');

		$this->initialStateService->provideInitialState('app_version', $appVersion);
		$this->initialStateService->provideInitialState('event_limit', $defaultEventLimit);
		$this->initialStateService->provideInitialState('first_run', false);
		$this->initialStateService->provideInitialState('initial_view', $defaultInitialView);
		$this->initialStateService->provideInitialState('show_weekends', $defaultShowWeekends);
		$this->initialStateService->provideInitialState('show_week_numbers', $defaultWeekNumbers === 'yes');
		$this->initialStateService->provideInitialState('skip_popover', true);
		$this->initialStateService->provideInitialState('talk_enabled', false);
		$this->initialStateService->provideInitialState('talk_api_version', $talkApiVersion);
		$this->initialStateService->provideInitialState('show_tasks', false);
		$this->initialStateService->provideInitialState('timezone', $defaultTimezone);
		$this->initialStateService->provideInitialState('attachments_folder', '/Calendar');
		$this->initialStateService->provideInitialState('slot_duration', $defaultSlotDuration);
		$this->initialStateService->provideInitialState('default_reminder', $defaultDefaultReminder);
		$this->initialStateService->provideInitialState('tasks_enabled', $tasksEnabled);
		$this->initialStateService->provideInitialState('hide_event_export', true);
		$this->initialStateService->provideInitialState('force_event_alarm_type', $forceEventAlarmType);
		$this->initialStateService->provideInitialState('disable_appointments', true);
		$this->initialStateService->provideInitialState('can_subscribe_link', false);
		$this->initialStateService->provideInitialState('show_resources', $showResources);
		$this->initialStateService->provideInitialState('publicCalendars', $publicCalendars);

		Util::addScript(Application::APP_ID, 'calendar-reference');
	}
}
