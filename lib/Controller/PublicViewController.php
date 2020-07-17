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

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\ContentSecurityPolicy;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\IInitialStateService;
use OCP\IRequest;
use OCP\IURLGenerator;

/**
 * Class PublicViewController
 *
 * @package OCA\Calendar\Controller
 */
class PublicViewController extends Controller {

	/**
	 * @var IConfig
	 */
	private $config;

	/**
	 * @var IInitialStateService
	 */
	private $initialStateService;

	/**
	 * @var IURLGenerator
	 */
	private $urlGenerator;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IConfig $config
	 * @param IInitialStateService $initialStateService
	 * @param IURLGenerator $urlGenerator
	 */
	public function __construct(string $appName,
								IRequest $request,
								IConfig $config,
								IInitialStateService $initialStateService,
								IURLGenerator $urlGenerator) {
		parent::__construct($appName, $request);
		$this->config = $config;
		$this->initialStateService = $initialStateService;
		$this->urlGenerator = $urlGenerator;
	}


	/**
	 * Load the public sharing calendar page with branding
	 *
	 * @PublicPage
	 * @NoCSRFRequired
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
	 * @PublicPage
	 * @NoCSRFRequired
	 * @NoSameSiteCookieRequired
	 *
	 * @param string $token
	 * @return TemplateResponse
	 */
	public function publicIndexForEmbedding(string $token):TemplateResponse {
		$response = $this->publicIndex($token, 'base');
		$response->addHeader('X-Frame-Options', 'ALLOW');

		$csp = new ContentSecurityPolicy();
		$csp->addAllowedFrameAncestorDomain('*');
		$response->setContentSecurityPolicy($csp);

		return $response;
	}

	/**
	 * @param string $token
	 * @param string $renderAs
	 * @return TemplateResponse
	 */
	private function publicIndex(string $token,
								 string $renderAs):TemplateResponse {
		$defaultEventLimit = $this->config->getAppValue($this->appName, 'eventLimit', 'yes');
		$defaultInitialView = $this->config->getAppValue($this->appName, 'currentView', 'dayGridMonth');
		$defaultShowWeekends = $this->config->getAppValue($this->appName, 'showWeekends', 'yes');
		$defaultWeekNumbers = $this->config->getAppValue($this->appName, 'showWeekNr', 'no');
		$defaultSkipPopover = $this->config->getAppValue($this->appName, 'skipPopover', 'yes');
		$defaultTimezone = $this->config->getAppValue($this->appName, 'timezone', 'automatic');
		$defaultSlotDuration = $this->config->getAppValue($this->appName, 'slotDuration', '00:30:00');
		$defaultShowTasks = $this->config->getAppValue($this->appName, 'showTasks', 'yes');

		$appVersion = $this->config->getAppValue($this->appName, 'installed_version');

		$this->initialStateService->provideInitialState($this->appName, 'app_version', $appVersion);
		$this->initialStateService->provideInitialState($this->appName, 'event_limit', ($defaultEventLimit === 'yes'));
		$this->initialStateService->provideInitialState($this->appName, 'first_run', false);
		$this->initialStateService->provideInitialState($this->appName, 'initial_view', $defaultInitialView);
		$this->initialStateService->provideInitialState($this->appName, 'show_weekends', ($defaultShowWeekends === 'yes'));
		$this->initialStateService->provideInitialState($this->appName, 'show_week_numbers', ($defaultWeekNumbers === 'yes'));
		$this->initialStateService->provideInitialState($this->appName, 'skip_popover', ($defaultSkipPopover === 'yes'));
		$this->initialStateService->provideInitialState($this->appName, 'talk_enabled', false);
		$this->initialStateService->provideInitialState($this->appName, 'timezone', $defaultTimezone);
		$this->initialStateService->provideInitialState($this->appName, 'slot_duration', $defaultSlotDuration);
		$this->initialStateService->provideInitialState($this->appName, 'show_tasks', $defaultShowTasks === 'yes');
		$this->initialStateService->provideInitialState($this->appName, 'tasks_enabled', false);

		return new TemplateResponse($this->appName, 'main', [
			'share_url' => $this->getShareURL(),
			'preview_image' => $this->getPreviewImage(),
		], $renderAs);
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
