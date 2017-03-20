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

use OC\AppFramework\Http\Request;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\ContentSecurityPolicy;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\IRequest;
use OCP\IUserSession;
use OCP\IURLGenerator;

class ViewController extends Controller {

	/**
	 * @var IConfig
	 */
	private $config;

	/**
	 * @var IURLGenerator
	 */
	private $urlGenerator;

	/**
	 * @var IUserSession
	 */
	private $userSession;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IUserSession $userSession
	 * @param IConfig $config
	 * @param IURLGenerator $urlGenerator
	 */
	public function __construct($appName, IRequest $request, IUserSession $userSession,
								IConfig $config, IURLGenerator $urlGenerator) {
		parent::__construct($appName, $request);
		$this->config = $config;
		$this->userSession = $userSession;
		$this->urlGenerator = $urlGenerator;
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @return TemplateResponse
	 */
	public function index() {
		if ($this->needsAssetPipelineWarning()) {
			return new TemplateResponse('calendar', 'main-asset-pipeline-unsupported');
		}

		$templateParameters = $this->getTemplateParams();

		$user = $this->userSession->getUser();
		$userId = $user->getUID();
		$emailAddress = $user->getEMailAddress();

		$initialView = $this->config->getUserValue($userId, $this->appName, 'currentView', null);
		$skipPopover = $this->config->getUserValue($userId, $this->appName, 'skipPopover', 'no');
		$weekNumbers = $this->config->getUserValue($userId, $this->appName, 'showWeekNr', 'no');
		$firstRun = $this->config->getUserValue($userId, $this->appName, 'firstRun', null);

		// the default view will be saved as soon as a user
		// opens the calendar app, therefore this is a good
		// indication if the calendar was used before
		if ($firstRun === null) {
			if ($initialView === null) {
				$firstRun = 'yes';
			} else {
				$this->config->setUserValue($userId, $this->appName, 'firstRun', 'no');
				$firstRun = 'no';
			}
		}

		if ($initialView === null) {
			$initialView = 'month';
		}

		return new TemplateResponse('calendar', 'main', array_merge($templateParameters, [
			'initialView' => $initialView,
			'emailAddress' => $emailAddress,
			'skipPopover' => $skipPopover,
			'weekNumbers' => $weekNumbers,
			'firstRun' => $firstRun,
			'isPublic' => false,
		]));
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @return TemplateResponse
	 */
	public function publicIndexWithBranding() {
		if ($this->needsAssetPipelineWarning()) {
			return new TemplateResponse('calendar', 'main-asset-pipeline-unsupported');
		}

		$templateParameters = $this->getTemplateParams();
		$publicTemplateParameters = $this->getPublicTemplateParameters();
		$params = array_merge($templateParameters, $publicTemplateParameters);

		return new TemplateResponse('calendar', 'public', $params, 'base');
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @return TemplateResponse
	 */
	public function publicIndex() {
		if ($this->needsAssetPipelineWarning()) {
			return new TemplateResponse('calendar', 'main-asset-pipeline-unsupported');
		}

		$templateParameters = $this->getTemplateParams();
		$publicTemplateParameters = $this->getPublicTemplateParameters();
		$params = array_merge($templateParameters, $publicTemplateParameters);

		$response = new TemplateResponse('calendar', 'main', $params, 'public');

		$response->addHeader('X-Frame-Options', 'ALLOW');
		$csp = new ContentSecurityPolicy();
		$csp->addAllowedScriptDomain('*');
		$response->setContentSecurityPolicy($csp);

		return $response;
	}

	/**
	 * get common parameters used for all three routes
	 * @return array
	 */
	private function getTemplateParams() {
		$runningOn = $this->config->getSystemValue('version');
		$runningOnNextcloud10OrLater = version_compare($runningOn, '9.1', '>=');
		$runningOnNextcloud11OrLater = version_compare($runningOn, '11', '>=');

		$supportsClass = $runningOnNextcloud10OrLater;
		$needsAutosize = !$runningOnNextcloud11OrLater;

		$appVersion = $this->config->getAppValue($this->appName, 'installed_version');
		$webCalWorkaround = $runningOnNextcloud10OrLater ? 'no' : 'yes';
		$isIE = $this->request->isUserAgent([Request::USER_AGENT_IE]);
		$defaultColor = $this->config->getAppValue('theming', 'color', '#0082C9');

		return [
			'appVersion' => $appVersion,
			'supportsClass' => $supportsClass,
			'isIE' => $isIE,
			'webCalWorkaround' => $webCalWorkaround,
			'needsAutosize' => $needsAutosize,
			'defaultColor' => $defaultColor,
		];
	}

	/**
	 * get common parameters for public sites
	 * @return array
	 */
	private function getPublicTemplateParameters() {
		return [
			'initialView' => 'month',
			'emailAddress' => '',
			'skipPopover' => 'no',
			'weekNumbers' => 'no',
			'firstRun' => 'no',
			'webCalWorkaround' => 'no',
			'isPublic' => true,
			'shareURL' => $this->request->getServerProtocol() . '://' . $this->request->getServerHost() . $this->request->getRequestUri(),
			'previewImage' => $this->urlGenerator->getAbsoluteURL($this->urlGenerator->imagePath('core', 'favicon-touch.png')),
			'webcalURL' => '',
			'downloadURL' => '',
		];
	}

	/**
	 * check if we need to show the asset pipeline warning
	 * @return bool
	 */
	private function needsAssetPipelineWarning() {
		$runningOn = $this->config->getSystemValue('version');
		$assetPipelineBroken = version_compare($runningOn, '9.1', '<');
		$isAssetPipelineEnabled = $this->config->getSystemValue('asset-pipeline.enabled', false);

		return ($isAssetPipelineEnabled && $assetPipelineBroken);
	}
}
