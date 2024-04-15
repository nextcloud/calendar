<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @author Thomas Citharel <nextcloud@tcit.fr>
 *
 * @author Richard Steinmetz <richard@steinmetz.cloud>
 * @author Jonas Heinrich <heinrich@synyx.net>
 * @copyright 2019 Georg Ehrke <oc.list@georgehrke.com>
 * @copyright Copyright (c) 2022 Informatyka Boguslawski sp. z o.o. sp.k., http://www.ib.pl/
 * @copyright 2023 Jonas Heinrich <heinrich@synyx.net>
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

use OC\App\CompareVersion;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCP\App\IAppManager;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\FileDisplayResponse;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Services\IInitialState;
use OCP\Files\IAppData;
use OCP\Files\NotFoundException;
use OCP\Files\NotPermittedException;
use OCP\IConfig;
use OCP\IRequest;
use function in_array;

class ViewController extends Controller {
	public function __construct(string $appName,
		IRequest $request,
		private IConfig $config,
		private AppointmentConfigService $appointmentConfigService,
		private IInitialState $initialStateService,
		private IAppManager $appManager,
		private CompareVersion $compareVersion,
		private ?string $userId,
		private IAppData $appData) {
		parent::__construct($appName, $request);
	}

	/**
	 * Load the main calendar page
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @return TemplateResponse
	 */
	public function index():TemplateResponse {
		$defaultEventLimit = $this->config->getAppValue($this->appName, 'eventLimit', 'yes');
		$defaultInitialView = $this->config->getAppValue($this->appName, 'currentView', 'dayGridMonth');
		$defaultShowWeekends = $this->config->getAppValue($this->appName, 'showWeekends', 'yes');
		$defaultWeekNumbers = $this->config->getAppValue($this->appName, 'showWeekNr', 'no');
		$defaultSkipPopover = $this->config->getAppValue($this->appName, 'skipPopover', 'no');
		$defaultTimezone = $this->config->getAppValue($this->appName, 'timezone', 'automatic');
		$defaultSlotDuration = $this->config->getAppValue($this->appName, 'slotDuration', '00:30:00');
		$defaultDefaultReminder = $this->config->getAppValue($this->appName, 'defaultReminder', 'none');
		$defaultShowTasks = $this->config->getAppValue($this->appName, 'showTasks', 'yes');

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
		$this->initialStateService->provideInitialState('tasks_enabled', $tasksEnabled);
		$this->initialStateService->provideInitialState('hide_event_export', $hideEventExport);
		$this->initialStateService->provideInitialState('force_event_alarm_type', $forceEventAlarmType);
		$this->initialStateService->provideInitialState('appointmentConfigs', $this->appointmentConfigService->getAllAppointmentConfigurations($this->userId));
		$this->initialStateService->provideInitialState('disable_appointments', $disableAppointments);
		$this->initialStateService->provideInitialState('can_subscribe_link', $canSubscribeLink);
		$this->initialStateService->provideInitialState('show_resources', $showResources);
		$this->initialStateService->provideInitialState('isCirclesEnabled', $isCirclesEnabled && $isCircleVersionCompatible);
		$this->initialStateService->provideInitialState('publicCalendars', $publicCalendars);

		return new TemplateResponse($this->appName, 'main');
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

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * This function makes the colour dots work for mobile widgets
	 *
	 * Returns an SVG with size32x32 if the hex colour is valid
	 * or a Nextcloud blue svg if the colour is not
	 *
	 * @param string $color - url encoded HEX colour
	 * @return FileDisplayResponse
	 * @throws NotPermittedException
	 */
	public function getCalendarDotSvg(string $color = "#0082c9"): FileDisplayResponse {
		$validColor = '#0082c9';
		$color = trim(urldecode($color), '#');
		if (preg_match('/^([0-9a-f]{3}|[0-9a-f]{6})$/i', $color)) {
			$validColor = '#' . $color;
		}
		$svg = '<svg height="32" width="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="' . $validColor . '"/></svg>';
		$folderName = implode('_', [
			'calendar',
			$this->userId
		]);
		try {
			$folder = $this->appData->getFolder($folderName);
		} catch (NotFoundException $e) {
			$folder = $this->appData->newFolder($folderName);
		}
		$file = $folder->newFile($color . '.svg', $svg);
		$response = new FileDisplayResponse($file);
		// Some browsers won't render SVGs without content types (for security reasons)
		$response->addHeader('Content-Type', 'image/svg+xml');
		$response->cacheFor(24 * 3600); // 1 day
		return $response;
	}
}
