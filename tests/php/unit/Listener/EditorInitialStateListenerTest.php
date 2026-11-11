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
use OCP\AppFramework\Http\Events\BeforeTemplateRenderedEvent;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IUserSession;
use PHPUnit\Framework\MockObject\MockObject;

class EditorInitialStateListenerTest extends TestCase {
	private IUserSession&MockObject $userSession;
	private CalendarInitialStateService&MockObject $calendarInitialStateService;
	private EventEditorIntegrationService&MockObject $eventEditorIntegrationService;
	private EditorInitialStateListener $listener;

	protected function setUp(): void {
		parent::setUp();

		$this->userSession = $this->createMock(IUserSession::class);
		$this->calendarInitialStateService = $this->createMock(CalendarInitialStateService::class);
		$this->eventEditorIntegrationService = $this->createMock(EventEditorIntegrationService::class);

		$this->listener = new EditorInitialStateListener(
			$this->userSession,
			$this->calendarInitialStateService,
			$this->eventEditorIntegrationService,
		);
	}

	public function testHandleDispatchesBeforeEventEditorLoadedEvent(): void {
		$this->userSession->method('isLoggedIn')
			->willReturn(true);
		$this->calendarInitialStateService->expects(self::once())
			->method('runForEditor');
		$this->eventEditorIntegrationService->expects(self::once())
			->method('dispatchBeforeLoadedEvent');

		$this->listener->handle(new BeforeTemplateRenderedEvent(true, new TemplateResponse('core', 'test')));
	}

	public function testHandleIgnoresLoggedOutUsers(): void {
		$this->userSession->method('isLoggedIn')
			->willReturn(false);
		$this->calendarInitialStateService->expects(self::never())
			->method('runForEditor');
		$this->eventEditorIntegrationService->expects(self::never())
			->method('dispatchBeforeLoadedEvent');

		$this->listener->handle(new BeforeTemplateRenderedEvent(false, new TemplateResponse('core', 'test')));
	}
}
