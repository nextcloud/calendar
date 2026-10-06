<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Controller;

use OCA\DAV\CalDAV\CalDavBackend;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\ContentSecurityPolicy;
use OCP\AppFramework\Http\RedirectResponse;
use OCP\AppFramework\Http\Response;
use OCP\AppFramework\Http\Template\PublicTemplateResponse;
use OCP\Defaults;
use OCP\IConfig;
use OCP\IInitialStateService;
use OCP\IL10N;
use OCP\IRequest;
use OCP\IURLGenerator;
use OCP\Util;
use Sabre\DAV\Exception\NotFound;

/**
 * Class PublicViewController
 *
 * @package OCA\Calendar\Controller
 */
class PublicViewController extends Controller {

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IConfig $config
	 * @param IInitialStateService $initialStateService
	 * @param IURLGenerator $urlGenerator
	 * @param IL10N $l10n
	 * @param Defaults $defaults
	 * @param CalDavBackend $calDavBackend
	 */
	public function __construct(
		string $appName,
		IRequest $request,
		private IConfig $config,
		private IInitialStateService $initialStateService,
		private IURLGenerator $urlGenerator,
		private IL10N $l10n,
		private Defaults $defaults,
		private CalDavBackend $calDavBackend,
	) {
		parent::__construct($appName, $request);
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
		$this->initialStateService->provideInitialState($this->appName, 'show_tasks', $defaultShowTasks === 'yes');
		$this->initialStateService->provideInitialState($this->appName, 'show_declined', true);
		$this->initialStateService->provideInitialState($this->appName, 'tasks_sidebar', $defaultTasksSidebar === 'yes');
		$this->initialStateService->provideInitialState($this->appName, 'tasks_enabled', false);
		$this->initialStateService->provideInitialState($this->appName, 'hide_event_export', false);
		$this->initialStateService->provideInitialState($this->appName, 'can_subscribe_link', $defaultCanSubscribeLink);
		$this->initialStateService->provideInitialState($this->appName, 'show_resources', false);

		$shareUrl = $this->getShareURL();
		$previewImage = $this->getPreviewImage();

		$response = new PublicTemplateResponse($this->appName, 'main', [
			'share_url' => $shareUrl,
			'preview_image' => $previewImage,
		]);

		[$title, $description, $sharedBy] = $this->resolvePublicShareMeta($token);
		$response->setHeaderTitle($title);
		if ($sharedBy !== null) {
			$response->setHeaderDetails($sharedBy);
		}
		$this->addOpenGraphHeaders($title, $description, $shareUrl, $previewImage);

		return $response;
	}

	/**
	 * Resolve calendar display name and owner for Open Graph / public header.
	 *
	 * @return array{0: string, 1: string, 2: ?string} title, description, shared-by details
	 */
	private function resolvePublicShareMeta(string $token): array {
		$fallbackTitle = $this->l10n->t('Calendar');
		$fallbackDescription = $this->l10n->t('A publicly shared calendar');

		if ($token === '') {
			return [$fallbackTitle, $fallbackDescription, null];
		}

		try {
			$calendarInfo = $this->calDavBackend->getPublicCalendar($token);
		} catch (NotFound) {
			return [$fallbackTitle, $fallbackDescription, null];
		}

		$calendarName = $this->extractPublicCalendarDisplayName($calendarInfo);
		$ownerDisplayName = $calendarInfo['{http://nextcloud.com/ns}owner-displayname'] ?? null;
		if (!is_string($ownerDisplayName) || $ownerDisplayName === '') {
			$ownerDisplayName = null;
		}

		if ($calendarName === null) {
			return [$fallbackTitle, $fallbackDescription, $ownerDisplayName !== null
				? $this->l10n->t('Shared by %s', [$ownerDisplayName])
				: null];
		}

		$title = $calendarName;
		if ($ownerDisplayName !== null) {
			$description = $this->l10n->t('%s is a publicly shared calendar by %s', [$calendarName, $ownerDisplayName]);
			$sharedBy = $this->l10n->t('Shared by %s', [$ownerDisplayName]);
		} else {
			$description = $this->l10n->t('%s is a publicly shared calendar', [$calendarName]);
			$sharedBy = null;
		}

		return [$title, $description, $sharedBy];
	}

	/**
	 * @param array<string, mixed> $calendarInfo
	 */
	private function extractPublicCalendarDisplayName(array $calendarInfo): ?string {
		$displayName = $calendarInfo['{DAV:}displayname'] ?? null;
		if (!is_string($displayName) || $displayName === '') {
			return null;
		}

		// getPublicCalendar() appends " (uid)" to the display name for DAV clients.
		$principalUri = $calendarInfo['principaluri'] ?? '';
		if (is_string($principalUri) && $principalUri !== '') {
			$uid = basename($principalUri);
			if ($uid !== '') {
				$suffix = ' (' . $uid . ')';
				if (str_ends_with($displayName, $suffix)) {
					$displayName = substr($displayName, 0, -strlen($suffix));
				}
			}
		}

		$displayName = trim($displayName);
		return $displayName !== '' ? $displayName : null;
	}

	/**
	 * Add Open Graph / Twitter meta tags so crawlers see title and description without JS.
	 */
	private function addOpenGraphHeaders(
		string $title,
		string $description,
		string $shareUrl,
		string $previewImage,
	): void {
		$siteName = $this->defaults->getName();

		// Open Graph: https://ogp.me/
		Util::addHeader('meta', ['property' => 'og:title', 'content' => $title]);
		Util::addHeader('meta', ['property' => 'og:description', 'content' => $description]);
		Util::addHeader('meta', ['property' => 'og:site_name', 'content' => $siteName]);
		Util::addHeader('meta', ['property' => 'og:url', 'content' => $shareUrl]);
		Util::addHeader('meta', ['property' => 'og:type', 'content' => 'website']);
		Util::addHeader('meta', ['property' => 'og:image', 'content' => $previewImage]);

		// Twitter / X cards
		Util::addHeader('meta', ['property' => 'twitter:title', 'content' => $title]);
		Util::addHeader('meta', ['property' => 'twitter:description', 'content' => $description]);
		Util::addHeader('meta', ['property' => 'twitter:card', 'content' => 'summary']);
		Util::addHeader('meta', ['property' => 'twitter:image', 'content' => $previewImage]);
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
