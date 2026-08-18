<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Controller;

use OC\App\CompareVersion;
use OCA\Calendar\Events\BeforeAppointmentModalLoadedEvent;
use OCA\Calendar\Events\BeforeEventEditorLoadedEvent;
use OCA\Calendar\Service\CalendarInitialStateService;
use OCP\App\IAppManager;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\EventDispatcher\IEventDispatcher;
use OCP\IConfig;
use OCP\IRequest;

class ViewController extends Controller {
	/** @var IConfig */
	private $config;

	/** @var IAppManager */
	private $appManager;

	/** @var CompareVersion */
	private $compareVersion;

	private CalendarInitialStateService $calendarInitialStateService;

	private IEventDispatcher $eventDispatcher;

	public function __construct(string $appName,
		IRequest $request,
		IConfig $config,
		CalendarInitialStateService $calendarInitialStateService,
		IEventDispatcher $eventDispatcher) {
		parent::__construct($appName, $request);
		$this->config = $config;
		$this->calendarInitialStateService = $calendarInitialStateService;
		$this->eventDispatcher = $eventDispatcher;
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
		$this->eventDispatcher->dispatchTyped(new BeforeAppointmentModalLoadedEvent());
		$this->eventDispatcher->dispatchTyped(new BeforeEventEditorLoadedEvent());
		return new TemplateResponse($this->appName, 'main');
	}
}
