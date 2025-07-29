<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Controller;

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\ContentSecurityPolicy;
use OCP\AppFramework\Http\RedirectResponse;
use OCP\AppFramework\Http\Response;
use OCP\AppFramework\Http\Template\PublicTemplateResponse;
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
	 */
	public function publicIndexWithBranding(string $token):Response {
		$acceptHeader = $this->request->getHeader('Accept');
		if (strpos($acceptHeader, 'text/calendar') !== false) {
			return new RedirectResponse($this->urlGenerator->linkTo('', 'remote.php') . '/dav/public-calendars/' . $token . '/?export');
		}
		return $this->publicIndex($token);
	}

	/**
	 * Load the public sharing calendar page that is to be used for embedding
	 *
	 * @PublicPage
	 * @NoCSRFRequired
	 * @NoSameSiteCookieRequired
	 */
	public function publicIndexForEmbedding(string $token):PublicTemplateResponse {
		$response = $this->publicIndex($token);
		$response->setFooterVisible(false);
		$response->addHeader('X-Frame-Options', 'ALLOW');

		$csp = new ContentSecurityPolicy();
		$csp->addAllowedFrameAncestorDomain('*');
		$response->setContentSecurityPolicy($csp);

		$this->initialStateService->provideInitialState($this->appName, 'is_embed', true);

		return $response;
	}

	private function publicIndex(string $token):PublicTemplateResponse {
		$defaultEventLimit = $this->config->getAppValue($this->appName, 'eventLimit', 'yes');
		$defaultInitialView = $this->config->getAppValue($this->appName, 'currentView', 'dayGridMonth');
		$defaultShowWeekends = $this->config->getAppValue($this->appName, 'showWeekends', 'yes');
		$defaultWeekNumbers = $this->config->getAppValue($this->appName, 'showWeekNr', 'no');
		$defaultSkipPopover = $this->config->getAppValue($this->appName, 'skipPopover', 'yes');
		$defaultTimezone = $this->config->getAppValue($this->appName, 'timezone', 'automatic');
		$defaultSlotDuration = $this->config->getAppValue($this->appName, 'slotDuration', '00:30:00');
		$defaultDefaultReminder = $this->config->getAppValue($this->appName, 'defaultReminder', 'none');
		$defaultShowTasks = $this->config->getAppValue($this->appName, 'showTasks', 'yes');
		$defaultTasksSidebar = $this->config->getAppValue($this->appName, 'tasksSidebar', 'yes');
		$defaultCanSubscribeLink = $this->config->getAppValue('dav', 'allow_calendar_link_subscriptions', 'yes');

		$appVersion = $this->config->getAppValue($this->appName, 'installed_version', '');

		$this->initialStateService->provideInitialState($this->appName, 'app_version', $appVersion);
		$this->initialStateService->provideInitialState($this->appName, 'event_limit', ($defaultEventLimit === 'yes'));
		$this->initialStateService->provideInitialState($this->appName, 'first_run', false);
		$this->initialStateService->provideInitialState($this->appName, 'initial_view', $defaultInitialView);
		$this->initialStateService->provideInitialState($this->appName, 'show_weekends', ($defaultShowWeekends === 'yes'));
		$this->initialStateService->provideInitialState($this->appName, 'show_week_numbers', ($defaultWeekNumbers === 'yes'));
		$this->initialStateService->provideInitialState($this->appName, 'skip_popover', ($defaultSkipPopover === 'yes'));
		$this->initialStateService->provideInitialState($this->appName, 'talk_enabled', false);
		$this->initialStateService->provideInitialState($this->appName, 'talk_api_version', 'v1');
		$this->initialStateService->provideInitialState($this->appName, 'timezone', $defaultTimezone);
		$this->initialStateService->provideInitialState($this->appName, 'slot_duration', $defaultSlotDuration);
		$this->initialStateService->provideInitialState($this->appName, 'default_reminder', $defaultDefaultReminder);
		$this->initialStateService->provideInitialState($this->appName, 'show_tasks', $defaultShowTasks === 'yes');
		$this->initialStateService->provideInitialState($this->appName, 'tasks_sidebar', $defaultTasksSidebar === 'yes');
		$this->initialStateService->provideInitialState($this->appName, 'tasks_enabled', false);
		$this->initialStateService->provideInitialState($this->appName, 'hide_event_export', false);
		$this->initialStateService->provideInitialState($this->appName, 'can_subscribe_link', $defaultCanSubscribeLink);
		$this->initialStateService->provideInitialState($this->appName, 'show_resources', false);

		return new PublicTemplateResponse($this->appName, 'main', [
			'share_url' => $this->getShareURL(),
			'preview_image' => $this->getPreviewImage(),
		]);
	}

	/**
	 * Get the sharing Url
	 */
	private function getShareURL():string {
		$shareURL = $this->request->getServerProtocol() . '://';
		$shareURL .= $this->request->getServerHost();
		$shareURL .= $this->request->getRequestUri();

		return $shareURL;
	}

	/**
	 * Get an image for preview when sharing in social media
	 */
	private function getPreviewImage():string {
		$relativeImagePath = $this->urlGenerator->imagePath('core', 'favicon-touch.png');
		return  $this->urlGenerator->getAbsoluteURL($relativeImagePath);
	}
}
