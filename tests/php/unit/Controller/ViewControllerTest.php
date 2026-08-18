<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Controller;

use OCP\EventDispatcher\Event;
use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Events\BeforeAppointmentModalLoadedEvent;
use OCA\Calendar\Events\BeforeEventEditorLoadedEvent;
use OCA\Calendar\Service\CalendarInitialStateService;
use OCP\EventDispatcher\IEventDispatcher;
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

	/** @var IEventDispatcher|MockObject */
	private $eventDispatcher;

	/** @var ViewController */
	private $controller;

	protected function setUp(): void {
		$this->appName = 'calendar';
		$this->request = $this->createMock(IRequest::class);
		$this->config = $this->createMock(IConfig::class);
		$this->calendarInitialStateService = $this->createMock(CalendarInitialStateService::class);
		$this->eventDispatcher = $this->createMock(IEventDispatcher::class);

		$this->controller = new ViewController(
			$this->appName,
			$this->request,
			$this->config,
			$this->calendarInitialStateService,
			$this->eventDispatcher,
		);
	}

	public function testIndexDispatchesBeforeEditorLoadedEvents(): void {
		$dispatchedEvents = [];
		$this->eventDispatcher->expects(self::exactly(2))
			->method('dispatchTyped')
			->willReturnCallback(function ($event) use (&$dispatchedEvents) {
            	$dispatchedEvents[] = $event;
    		});


		$this->controller->index();

		$expectedEvents = [
				new BeforeAppointmentModalLoadedEvent(),
				new BeforeEventEditorLoadedEvent(),
			];
		self::assertEquals($expectedEvents, $dispatchedEvents);
	}
}
