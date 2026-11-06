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
use OCP\Collaboration\Reference\RenderReferenceEvent;
use OCP\EventDispatcher\IEventDispatcher;
use OCP\IRequest;

/**
 * Stand-in for apps rendering references (e.g. Talk, Text),
 * which are not installed in the E2E test environment.
 */
class ReferenceController extends Controller {
	public function __construct(
		IRequest $request,
		private IEventDispatcher $eventDispatcher,
	) {
		parent::__construct(Application::APP_ID, $request);
	}

	/**
	 * Public, so that it can be visited without being logged in.
	 * Otherwise, the event editor would also be loaded for the app menu.
	 */
	#[PublicPage]
	#[NoCSRFRequired]
	#[FrontpageRoute(verb: 'GET', url: '/reference')]
	public function index(): TemplateResponse {
		$this->eventDispatcher->dispatchTyped(new RenderReferenceEvent());
		return new TemplateResponse(Application::APP_ID, 'reference', [], TemplateResponse::RENDER_AS_GUEST);
	}
}
