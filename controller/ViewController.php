<?php
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2018 Georg Ehrke <oc.list@georgehrke.com>
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

use OCP\AppFramework\Controller;
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
	public function index():TemplateResponse {
		\OCP\Util::connectHook('\OCP\Config', 'js', $this, 'addJavaScriptVariablesForIndex');
		return new TemplateResponse('calendar', 'main');
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @return TemplateResponse
	 */
	public function indexViewTimerange():TemplateResponse {
		return $this->index();
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @param string $token
	 *
	 * @return TemplateResponse
	 */
	public function publicIndexWithBranding(string $token):TemplateResponse {
		$params = $this->getPublicTemplateParameters($token);
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
	public function publicIndexWithBrandingAndFancyName(string $token):TemplateResponse {
		return $this->publicIndexWithBranding($token);
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 * @NoSameSiteCookieRequired
	 *
	 * @param string $token
	 *
	 * @return TemplateResponse
	 */
	public function publicIndexForEmbedding(string $token):TemplateResponse {
		$params = $this->getPublicTemplateParameters($token);
		$params['isEmbedded'] = true;

		$response = new TemplateResponse('calendar', 'main', $params, 'base');
		$response->addHeader('X-Frame-Options', 'ALLOW');
		return $response;
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @param string $token
	 *
	 * @return TemplateResponse
	 */
	public function publicIndexForEmbeddingLegacy(string $token):TemplateResponse {
		return $this->publicIndexForEmbedding($token);
	}

	/**
	 * add parameters to javascript for user sites
	 *
	 * @param array $array
	 */
	public function addJavaScriptVariablesForIndex(array $array) {
		$user = $this->userSession->getUser();
		if ($user === null) {
			return;
		}

		$userId = $user->getUID();
		$emailAddress = $user->getEMailAddress();
		$initialView = $this->config->getUserValue($userId, $this->appName, 'currentView', null);
		$showWeekends = $this->config->getUserValue($userId, $this->appName, 'showWeekends', 'yes');
		$skipPopover = $this->config->getUserValue($userId, $this->appName, 'skipPopover', 'no');
		$weekNumbers = $this->config->getUserValue($userId, $this->appName, 'showWeekNr', 'no');
		$firstRun = $this->config->getUserValue($userId, $this->appName, 'firstRun', null);
		$timezone = $this->config->getUserValue($userId, $this->appName, 'timezone', 'automatic');

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

		$array['array']['oca_calendar'] = \json_encode([
			'emailAddress' => $emailAddress,
			'firstRun' => $firstRun,
			'initialView' => $initialView,
			'showWeekends' => $showWeekends,
			'skipPopover' => $skipPopover,
			'timezone' => $timezone,
			'weekNumbers' => $weekNumbers,
		]);
	}

	/**
	 * add parameters to javascript for public sites
	 *
	 * @param array $array
	 */
	public function addJavaScriptVariablesForPublicIndex($array) {
		$array['array']['oca_calendar'] = \json_encode([
			'emailAddress' => '',
			'firstRun' => 'no',
			'initialView' => 'month',
			'showWeekends' => 'yes',
			'skipPopover' => 'no',
			'timezone' => 'automatic',
			'weekNumbers' => 'no',
		]);
	}

	/**
	 * get common parameters for public sites
	 *
	 * @param string $token
	 * @return array
	 */
	private function getPublicTemplateParameters(string $token):array {
		$serverProtocol = $this->request->getServerProtocol();

		$shareURL = $serverProtocol . '://';
		$shareURL .= $this->request->getServerHost();
		$shareURL .= $this->request->getRequestUri();

		$relativeImagePath = $this->urlGenerator->imagePath('core', 'favicon-touch.png');
		$previewImage = $this->urlGenerator->getAbsoluteURL($relativeImagePath);

		$remoteBase = $this->urlGenerator->linkTo('', 'remote.php');
		$remoteBase .= '/dav/public-calendars/' . $token . '?export';
		$downloadURL = $this->urlGenerator->getAbsoluteURL($remoteBase);

		$webcalURL = (($serverProtocol === 'http') ? 'webcal' : 'webcals') . '://';
		$webcalURL .= substr($downloadURL, \strlen($serverProtocol) + 3);

		return [
			'shareURL' => $shareURL,
			'previewImage' => $previewImage,
			'webcalURL' => $webcalURL,
			'downloadURL' => $downloadURL,
		];
	}
}
