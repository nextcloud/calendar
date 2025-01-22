<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Controller;

use OCA\Calendar\AppInfo\Application;
use OCA\Calendar\Http\JsonResponse;
use OCA\Calendar\Service\ExampleEventService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\Attribute\FrontpageRoute;
use OCP\IRequest;

class ExampleEventController extends Controller {
	public function __construct(
		IRequest $request,
		private readonly ExampleEventService $exampleEventService,
	) {
		parent::__construct(Application::APP_ID, $request);
	}

	#[FrontpageRoute(verb: 'POST', url: '/v1/exampleEvent/enable')]
	public function setCreateExampleEvent(bool $enable): JSONResponse {
		$this->exampleEventService->setCreateExampleEvent($enable);
		return JsonResponse::success([]);
	}

	#[FrontpageRoute(verb: 'POST', url: '/v1/exampleEvent/event')]
	public function uploadExampleEvent(string $ics): JSONResponse {
		if (!$this->exampleEventService->shouldCreateExampleEvent()) {
			return JSONResponse::fail([], Http::STATUS_FORBIDDEN);
		}

		$this->exampleEventService->saveCustomExampleEvent($ics);
		return JsonResponse::success([]);
	}

	#[FrontpageRoute(verb: 'DELETE', url: '/v1/exampleEvent/event')]
	public function deleteExampleEvent(): JSONResponse {
		$this->exampleEventService->deleteCustomExampleEvent();
		return JsonResponse::success([]);
	}
}
