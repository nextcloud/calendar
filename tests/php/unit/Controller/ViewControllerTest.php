<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Controller;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Service\CalendarInitialStateService;
use OCA\Calendar\Service\EventEditorIntegrationService;
use OCP\IConfig;
use OCP\IRequest;
use PHPUnit\Framework\MockObject\MockObject;

class ViewControllerTest extends TestCase {
	/** @var string */
	private $appName;

	/** @var IRequest|MockObject */
	private $request;

	/** @var IConfig|MockObject */
	private $config;

	/** @var CalendarInitialStateService|MockObject */
	private $calendarInitialStateService;

	/** @var EventEditorIntegrationService|MockObject */
	private $eventEditorIntegrationService;

	/** @var ViewController */
	private $controller;

	protected function setUp(): void {
		$this->appName = 'calendar';
		$this->request = $this->createMock(IRequest::class);
		$this->config = $this->createMock(IConfig::class);
		$this->calendarInitialStateService = $this->createMock(CalendarInitialStateService::class);
		$this->eventEditorIntegrationService = $this->createMock(EventEditorIntegrationService::class);

		$this->controller = new ViewController(
			$this->appName,
			$this->request,
			$this->config,
			$this->calendarInitialStateService,
			$this->eventEditorIntegrationService,
		);
	}

	public function testIndexDispatchesBeforeEventEditorLoadedEvent(): void {
		$this->eventEditorIntegrationService->expects(self::once())
			->method('dispatchBeforeLoadedEvent');

		$this->controller->index();
	}

	public function testViewDispatchesBeforeEventEditorLoadedEvent(): void {
		$this->eventEditorIntegrationService->expects(self::once())
			->method('dispatchBeforeLoadedEvent');

		$this->controller->view('1');
	}
}
