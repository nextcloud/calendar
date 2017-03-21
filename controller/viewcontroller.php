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
			'isEmbedded' => false,
			'token' => '',
		]));
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @param string $token
	 *
	 * @return TemplateResponse
	 */
	public function publicIndexWithBranding($token) {
		if ($this->needsAssetPipelineWarning()) {
			return new TemplateResponse('calendar', 'main-asset-pipeline-unsupported');
		}

		$templateParameters = $this->getTemplateParams();
		$publicTemplateParameters = $this->getPublicTemplateParameters($token);
		$params = array_merge($templateParameters, $publicTemplateParameters);
		$params['isEmbedded'] = false;

		return new TemplateResponse('calendar', 'public', $params, 'base');
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @param string $token
	 *
	 * @return TemplateResponse
	 */
	public function publicIndex($token) {
		if ($this->needsAssetPipelineWarning()) {
			return new TemplateResponse('calendar', 'main-asset-pipeline-unsupported');
		}

		$templateParameters = $this->getTemplateParams();
		$publicTemplateParameters = $this->getPublicTemplateParameters($token);
		$params = array_merge($templateParameters, $publicTemplateParameters);
		$params['isEmbedded'] = true;

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
	 * @param string $token
	 * @return array
	 */
	private function getPublicTemplateParameters($token) {
		$shareURL = $this->request->getServerProtocol() . '://';
		$shareURL .= $this->request->getServerHost();
		$shareURL .= $this->request->getRequestUri();

		$relativeImagePath = $this->urlGenerator->imagePath('core', 'favicon-touch.png');
		$previewImage = $this->urlGenerator->getAbsoluteURL($relativeImagePath);

		$remoteBase = $this->urlGenerator->linkTo('', 'remote.php');
		$remoteBase .= '/dav/public-calendars/' . $token . '?export';

		$downloadUrl = $this->urlGenerator->getAbsoluteURL($remoteBase);

		$protocolLength = strlen($this->request->getServerProtocol()) + 3;
		$webcalUrl = 'webcal://' . substr($downloadUrl, $protocolLength);

		return [
			'initialView' => 'month',
			'emailAddress' => '',
			'skipPopover' => 'no',
			'weekNumbers' => 'no',
			'firstRun' => 'no',
			'webCalWorkaround' => 'no',
			'isPublic' => true,
			'shareURL' => $shareURL,
			'previewImage' => $previewImage,
			'webcalURL' => $webcalUrl,
			'downloadURL' => $downloadUrl,
			'token' => $token,
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
