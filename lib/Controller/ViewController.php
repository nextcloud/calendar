<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Controller;

use OC\App\CompareVersion;
use OCA\Calendar\Service\CalendarInitialStateService;
use OCP\App\IAppManager;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\FrontpageRoute;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\Attribute\UserRateLimit;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\IRequest;

class ViewController extends Controller {

	/** @var IAppManager */
	private $appManager;

	/** @var CompareVersion */
	private $compareVersion;

	public function __construct(
		string $appName,
		IRequest $request,
		private IConfig $config,
		private CalendarInitialStateService $calendarInitialStateService,
	) {
		parent::__construct($appName, $request);
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
		$this->calendarInitialStateService->run();
		return new TemplateResponse($this->appName, 'main');
	}

	#[FrontpageRoute(verb: 'GET', url: '/proposal/view/{id}')]
	#[NoAdminRequired]
	#[NoCSRFRequired]
	#[UserRateLimit(limit: 10, period: 60)]
	public function view(string $id): TemplateResponse {
		$this->calendarInitialStateService->run();
		return new TemplateResponse($this->appName, 'main');
	}
}
