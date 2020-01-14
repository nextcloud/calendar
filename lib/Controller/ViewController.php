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
use OCP\IRequest;
use OCP\IURLGenerator;
use OCP\Notification\IApp;

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
	 * @var IAppManager
	 */
	private $appManager;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IAppManager $appManager
	 * @param IConfig $config
	 * @param string $userId
	 */
	public function __construct(string $appName,
								IRequest $request,
								IConfig $config,
								IAppManager $appManager,
								?string $userId) {
		parent::__construct($appName, $request);
		$this->config = $config;
		$this->userId = $userId;
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
		return new TemplateResponse($this->appName, 'main', [
			'app_version' => $this->config->getAppValue($this->appName, 'installed_version'),
			'first_run' => $this->config->getUserValue($this->userId, $this->appName, 'firstRun', 'yes') === 'yes',
			'initial_view' => $this->config->getUserValue($this->userId, $this->appName, 'currentView', 'dayGridMonth'),
			'show_weekends' => $this->config->getUserValue($this->userId, $this->appName, 'showWeekends', 'yes') === 'yes',
			'show_week_numbers' => $this->config->getUserValue($this->userId, $this->appName, 'showWeekNr', 'no') === 'yes',
			'skip_popover' => $this->config->getUserValue($this->userId, $this->appName, 'skipPopover', 'no') === 'yes',
			'talk_enabled' => $this->appManager->isEnabledForUser('spreed'),
			'timezone' => $this->config->getUserValue($this->userId, $this->appName, 'timezone', 'automatic'),
		]);
	}
}
