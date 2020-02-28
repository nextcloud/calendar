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
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\IInitialStateService;
use OCP\IRequest;

/**
 * Class ViewController
 *
 * @package OCA\Calendar\Controller
 */
class ViewController extends Controller {

	/**
	 * @var IConfig
	 */
	private $config;

	/**
	 * @var string
	 */
	private $userId;

	/**
	 * @var IInitialStateService
	 */
	private $initialStateService;

	/**
	 * @var IAppManager
	 */
	private $appManager;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IConfig $config
	 * @param IInitialStateService $initialStateService
	 * @param IAppManager $appManager
	 * @param string $userId
	 */
	public function __construct(string $appName,
								IRequest $request,
								IConfig $config,
								IInitialStateService $initialStateService,
								IAppManager $appManager,
								?string $userId) {
		parent::__construct($appName, $request);
		$this->config = $config;
		$this->userId = $userId;
		$this->initialStateService = $initialStateService;
		$this->appManager = $appManager;
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

		$appVersion = $this->config->getAppValue($this->appName, 'installed_version');
		$eventLimit = $this->config->getUserValue($this->userId, $this->appName, 'eventLimit', $defaultEventLimit) === 'yes';
		$firstRun = $this->config->getUserValue($this->userId, $this->appName, 'firstRun', 'yes') === 'yes';
		$initialView = $this->getView($this->config->getUserValue($this->userId, $this->appName, 'currentView', $defaultInitialView));
		$showWeekends = $this->config->getUserValue($this->userId, $this->appName, 'showWeekends', $defaultShowWeekends) === 'yes';
		$showWeekNumbers = $this->config->getUserValue($this->userId, $this->appName, 'showWeekNr', $defaultWeekNumbers) === 'yes';
		$skipPopover = $this->config->getUserValue($this->userId, $this->appName, 'skipPopover', $defaultSkipPopover) === 'yes';
		$talkEnabled = $this->appManager->isEnabledForUser('spreed');
		$timezone = $this->config->getUserValue($this->userId, $this->appName, 'timezone', $defaultTimezone);
		$slotDuration = $this->config->getUserValue($this->userId, $this->appName, 'slotDuration', $defaultSlotDuration);

		$this->initialStateService->provideInitialState($this->appName, 'app_version', $appVersion);
		$this->initialStateService->provideInitialState($this->appName, 'event_limit', $eventLimit);
		$this->initialStateService->provideInitialState($this->appName, 'first_run', $firstRun);
		$this->initialStateService->provideInitialState($this->appName, 'initial_view', $initialView);
		$this->initialStateService->provideInitialState($this->appName, 'show_weekends', $showWeekends);
		$this->initialStateService->provideInitialState($this->appName, 'show_week_numbers', $showWeekNumbers);
		$this->initialStateService->provideInitialState($this->appName, 'skip_popover', $skipPopover);
		$this->initialStateService->provideInitialState($this->appName, 'talk_enabled', $talkEnabled);
		$this->initialStateService->provideInitialState($this->appName, 'timezone', $timezone);
		$this->initialStateService->provideInitialState($this->appName, 'slot_duration', $slotDuration);

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
}
