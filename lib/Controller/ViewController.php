<?php
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

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\IRequest;
use OCP\IURLGenerator;

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
	 * @var IURLGenerator
	 */
	private $urlGenerator;

	/**
	 * @var string
	 */
	private $userId;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IConfig $config
	 * @param IURLGenerator $urlGenerator
	 * @param string $userId
	 */
	public function __construct(string $appName,
								IRequest $request,
								IConfig $config,
								IURLGenerator $urlGenerator,
								string $userId) {
		parent::__construct($appName, $request);
		$this->config = $config;
		$this->urlGenerator = $urlGenerator;
		$this->userId = $userId;
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
			'timezone' => $this->config->getUserValue($this->userId, $this->appName, 'timezone', 'automatic'),
		]);
	}

	/**
	 * Load the public sharing calendar page with branding
	 *
	 * @param string $token
	 * @return TemplateResponse
	 */
	public function publicIndexWithBranding(string $token):TemplateResponse {
		return $this->publicIndex($token, 'public');
	}

	/**
	 * Load the public sharing calendar page that is to be used for embedding
	 *
	 * @param string $token
	 * @return TemplateResponse
	 */
	public function publicIndexForEmbedding(string $token):TemplateResponse {
		$response = $this->publicIndex($token, 'main');
		$response->addHeader('X-Frame-Options', 'ALLOW');

		return $response;
	}

	/**
	 * @param string $token
	 * @param string $baseTemplate
	 * @return TemplateResponse
	 */
	private function publicIndex(string $token,
								 string $baseTemplate):TemplateResponse {
		return new TemplateResponse($this->appName, $baseTemplate, [
			'app_version' => $this->config->getAppValue($this->appName, 'installed_version'),
			'first_run' => false,
			'initial_view' => 'dayGridMonth',
			'show_weekends' => true,
			'show_week_numbers' => false,
			'skip_popover' => true,
			'timezone' => 'automatic',
			'share_url' => $this->getShareURL(),
			'preview_image' => $this->getPreviewImage(),
		], 'base');
	}

	/**
	 * Get the sharing Url
	 *
	 * @return string
	 */
	private function getShareURL():string {
		$shareURL = $this->request->getServerProtocol() . '://';
		$shareURL .= $this->request->getServerHost();
		$shareURL .= $this->request->getRequestUri();

		return $shareURL;
	}

	/**
	 * Get an image for preview when sharing in social media
	 *
	 * @return string
	 */
	private function getPreviewImage():string {
		$relativeImagePath = $this->urlGenerator->imagePath('core', 'favicon-touch.png');
		return  $this->urlGenerator->getAbsoluteURL($relativeImagePath);
	}
}
