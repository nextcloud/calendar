<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\EventEditorExtension\Controller;

use OCA\EventEditorExtension\AppInfo\Application;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\FrontpageRoute;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\Attribute\PublicPage;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Services\IInitialState;
use OCP\Collaboration\Reference\IReferenceManager;
use OCP\Collaboration\Reference\RenderReferenceEvent;
use OCP\EventDispatcher\IEventDispatcher;
use OCP\IRequest;
use OCP\IURLGenerator;
use OCP\Util;

/**
 * Stand-in for apps rendering references (e.g. Talk, Text),
 * which are not installed in the E2E test environment.
 */
class ReferenceController extends Controller {
	public function __construct(
		IRequest $request,
		private IEventDispatcher $eventDispatcher,
		private IReferenceManager $referenceManager,
		private IURLGenerator $urlGenerator,
		private IInitialState $initialState,
	) {
		parent::__construct(Application::APP_ID, $request);
	}

	/**
	 * Render the reference to a public calendar, like apps do for a link to it in e.g. a chat message.
	 *
	 * Public, so that it can be visited without being logged in.
	 * Otherwise, the event editor would also be loaded for the app menu.
	 *
	 * @param string $token Token of the public calendar
	 */
	#[PublicPage]
	#[NoCSRFRequired]
	#[FrontpageRoute(verb: 'GET', url: '/reference/{token}')]
	public function index(string $token): TemplateResponse {
		$link = $this->urlGenerator->getAbsoluteURL('/apps/calendar/p/' . $token);
		return $this->render($link, TemplateResponse::RENDER_AS_PUBLIC);
	}

	/**
	 * Render the reference to a calendar of the logged-in user, like apps do for a link to its CalDAV URL.
	 *
	 * @param string $userId Owner of the calendar
	 * @param string $calendarUri URI of the calendar
	 */
	#[NoAdminRequired]
	#[NoCSRFRequired]
	#[FrontpageRoute(verb: 'GET', url: '/reference/calendars/{userId}/{calendarUri}')]
	public function calendar(string $userId, string $calendarUri): TemplateResponse {
		$link = $this->urlGenerator->getAbsoluteURL('/remote.php/dav/calendars/' . $userId . '/' . $calendarUri . '/');
		return $this->render($link, TemplateResponse::RENDER_AS_USER);
	}

	/**
	 * Render the reference to a link with `NcReferenceWidget`.
	 *
	 * @param string $link The link to render the reference of
	 * @param string $renderAs How the page is rendered, see `TemplateResponse::RENDER_AS_*`
	 */
	private function render(string $link, string $renderAs): TemplateResponse {
		$this->initialState->provideInitialState('reference', $this->referenceManager->resolveReference($link));

		$this->eventDispatcher->dispatchTyped(new RenderReferenceEvent());
		// After the scripts of the Calendar app, so that its widget is registered before `NcReferenceWidget` is set up
		Util::addScript(Application::APP_ID, 'reference', 'calendar');
		Util::addStyle(Application::APP_ID, 'reference');
		return new TemplateResponse(Application::APP_ID, 'reference', [], $renderAs);
	}
}
