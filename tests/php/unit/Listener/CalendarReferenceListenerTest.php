<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Listener;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Service\CalendarInitialStateService;
use OCA\Calendar\Service\EventEditorIntegrationService;
use OCP\Collaboration\Reference\RenderReferenceEvent;
use OCP\EventDispatcher\Event;
use PHPUnit\Framework\MockObject\MockObject;

class CalendarReferenceListenerTest extends TestCase {
	private CalendarInitialStateService&MockObject $calendarInitialStateService;
	private EventEditorIntegrationService&MockObject $eventEditorIntegrationService;
	private CalendarReferenceListener $listener;

	protected function setUp(): void {
		parent::setUp();

		$this->calendarInitialStateService = $this->createMock(CalendarInitialStateService::class);
		$this->eventEditorIntegrationService = $this->createMock(EventEditorIntegrationService::class);

		$this->listener = new CalendarReferenceListener(
			$this->calendarInitialStateService,
			$this->eventEditorIntegrationService,
		);
	}

	public function testHandleDispatchesBeforeEventEditorLoadedEvent(): void {
		$this->calendarInitialStateService->expects(self::once())
			->method('run');
		$this->eventEditorIntegrationService->expects(self::once())
			->method('dispatchBeforeLoadedEvent');

		$this->listener->handle(new RenderReferenceEvent());
	}

	public function testHandleIgnoresOtherEvents(): void {
		$this->calendarInitialStateService->expects(self::never())
			->method('run');
		$this->eventEditorIntegrationService->expects(self::never())
			->method('dispatchBeforeLoadedEvent');

		$this->listener->handle(new Event());
	}
}
