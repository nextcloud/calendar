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
		$this->initialState->provideInitialState('reference', $this->referenceManager->resolveReference($link));

		$this->eventDispatcher->dispatchTyped(new RenderReferenceEvent());
		Util::addScript(Application::APP_ID, 'reference');
		return new TemplateResponse(Application::APP_ID, 'reference', [], TemplateResponse::RENDER_AS_PUBLIC);
	}
}
