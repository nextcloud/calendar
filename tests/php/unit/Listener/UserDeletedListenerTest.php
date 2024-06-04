<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Tests\Unit\Listener;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Listener\UserDeletedListener;
use OCP\EventDispatcher\Event;
use OCP\IUser;
use OCP\User\Events\UserDeletedEvent;

class UserDeletedListenerTest extends TestCase {
	/** @var \ChristophWurst\Nextcloud\Testing\ServiceMockObject */
	private $serviceMock;

	/** @var UserDeletedListener */
	private $listener;

	protected function setUp(): void {
		parent::setUp();

		$this->serviceMock = $this->createServiceMock(UserDeletedListener::class);
		$this->listener = $this->serviceMock->getService();
	}

	public function testHandleUnrelated(): void {
		$event = new Event();
		$this->serviceMock->getParameter('appointmentConfigService')
			->expects(self::never())
			->method('deleteByUser');
		$this->serviceMock->getParameter('bookingService')
			->expects(self::never())
			->method('deleteByUser');

		$this->listener->handle($event);
	}

	public function testHandle(): void {
		$user = $this->createMock(IUser::class);
		$event = new UserDeletedEvent($user);
		$this->serviceMock->getParameter('appointmentConfigService')
			->expects(self::once())
			->method('deleteByUser')
			->with($user);
		$this->serviceMock->getParameter('bookingService')
			->expects(self::once())
			->method('deleteByUser')
			->with($user);

		$this->listener->handle($event);
	}
}
