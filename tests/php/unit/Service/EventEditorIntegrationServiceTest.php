<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Service;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Events\BeforeEventEditorLoadedEvent;
use OCP\EventDispatcher\IEventDispatcher;
use PHPUnit\Framework\MockObject\MockObject;

class EventEditorIntegrationServiceTest extends TestCase {
	private IEventDispatcher&MockObject $eventDispatcher;
	private EventEditorIntegrationService $service;

	protected function setUp(): void {
		parent::setUp();

		$this->eventDispatcher = $this->createMock(IEventDispatcher::class);

		$this->service = new EventEditorIntegrationService($this->eventDispatcher);
	}

	public function testDispatchBeforeLoadedEvent(): void {
		$this->eventDispatcher->expects(self::once())
			->method('dispatchTyped')
			->with(new BeforeEventEditorLoadedEvent());

		$this->service->dispatchBeforeLoadedEvent();
	}

	public function testDispatchBeforeLoadedEventOnlyOnce(): void {
		$this->eventDispatcher->expects(self::once())
			->method('dispatchTyped');

		$this->service->dispatchBeforeLoadedEvent();
		$this->service->dispatchBeforeLoadedEvent();
	}
}
