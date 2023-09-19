<?php

declare(strict_types=1);

/*
 * @copyright 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
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
