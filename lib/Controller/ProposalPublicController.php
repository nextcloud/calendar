<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Controller;

use OCA\Calendar\AppInfo\Application;
use OCA\Calendar\Service\Proposal\ProposalService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\AnonRateLimit;
use OCP\AppFramework\Http\Attribute\FrontpageRoute;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\Attribute\PublicPage;
use OCP\AppFramework\Http\Attribute\UserRateLimit;
use OCP\AppFramework\Http\Response;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;

class ProposalPublicController extends Controller {

	public function __construct(
		IRequest $request,
		private ProposalService $proposalService,
	) {
		parent::__construct(Application::APP_ID, $request);
	}

	#[FrontpageRoute(verb: 'GET', url: '/proposal/{token}', root: '/calendar')]
	#[PublicPage]
	#[NoCSRFRequired]
	#[NoAdminRequired]
	#[AnonRateLimit(limit: 10, period: 300)]
	#[UserRateLimit(limit: 10, period: 300)]
	public function index(string $token): Response {
		\OCP\Util::addScript(Application::APP_ID, Application::APP_ID . '-proposal-public');

		return new TemplateResponse(Application::APP_ID, 'public', [], TemplateResponse::RENDER_AS_PUBLIC);
	}
}
