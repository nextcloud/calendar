<?php
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
 * @author Raghu Nayyar
 * @copyright 2016 Raghu Nayyar <hey@raghunayyar.com>
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

use OC\AppFramework\Http;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataDisplayResponse;
use OCP\AppFramework\Http\NotFoundResponse;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\IRequest;
use OCP\IUserSession;

class ViewController extends Controller {

	/**
	 * @var IConfig
	 */
	private $config;

	/**
	 * @var IUserSession
	 */
	private $userSession;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IUserSession $userSession
	 * @param IConfig $config
	 */
	public function __construct($appName, IRequest $request,
								IUserSession $userSession, IConfig $config) {
		parent::__construct($appName, $request);
		$this->config = $config;
		$this->userSession = $userSession;
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @return TemplateResponse
	 */
	public function index() {
		$runningOn = $this->config->getSystemValue('version');
		$runningOnNextcloud10OrLater = version_compare($runningOn, '9.1', '>=');

		$supportsClass = $runningOnNextcloud10OrLater;
		$assetPipelineBroken = !$runningOnNextcloud10OrLater;

		$isAssetPipelineEnabled = $this->config->getSystemValue('asset-pipeline.enabled', false);
		if ($isAssetPipelineEnabled && $assetPipelineBroken) {
			return new TemplateResponse('calendar', 'main-asset-pipeline-unsupported');
		}

		$user = $this->userSession->getUser();
		$userId = $user->getUID();
		$emailAddress = $user->getEMailAddress();

		$appVersion = $this->config->getAppValue($this->appName, 'installed_version');
		$defaultView = $this->config->getUserValue($userId, $this->appName, 'currentView', 'month');
		$skipPopover = $this->config->getUserValue($userId, $this->appName, 'skipPopover', 'no');
		$weekNumbers = $this->config->getUserValue($userId, $this->appName, 'showWeekNr', 'no');
		$defaultColor = $this->config->getAppValue('theming', 'color', '#0082C9');

		$webCalWorkaround = $runningOnNextcloud10OrLater ? 'no' : 'yes';
		
		return new TemplateResponse('calendar', 'main', [
			'appVersion' => $appVersion,
			'defaultView' => $defaultView,
			'emailAddress' => $emailAddress,
			'skipPopover' => $skipPopover,
			'weekNumbers' => $weekNumbers,
			'supportsClass' => $supportsClass,
			'defaultColor' => $defaultColor,
			'webCalWorkaround' => $webCalWorkaround,
		]);
	}

	/**
	 * @NoAdminRequired
	 *
	 * @param string $id
	 * @return DataDisplayResponse
	 */
	public function getTimezone($id) {
		if (!in_array($id, $this->getTimezoneList())) {
			return new NotFoundResponse();
		}

		$tzData = file_get_contents(__DIR__ . '/../timezones/' . $id);

		return new DataDisplayResponse($tzData, HTTP::STATUS_OK, [
			'content-type' => 'text/calendar',
		]);
	}


	/**
	 * @NoAdminRequired
	 *
	 * @param $region
	 * @param $city
	 * @return DataDisplayResponse
	 */
	public function getTimezoneWithRegion($region, $city) {
		return $this->getTimezone($region . '-' . $city);
	}


	/**
	 * @NoAdminRequired
	 *
	 * @param $region
	 * @param $subregion
	 * @param $city
	 * @return DataDisplayResponse
	 */
	public function getTimezoneWithSubRegion($region, $subregion, $city) {
		return $this->getTimezone($region . '-' . $subregion . '-' . $city);
	}


	/**
	 * get a list of default timezones
	 *
	 * @return array
	 */
	private function getTimezoneList() {
		$allFiles = scandir(__DIR__ . '/../timezones/');

		return array_values(array_filter($allFiles, function($file) {
			return (substr($file, -4) === '.ics');
		}));
	}
}
