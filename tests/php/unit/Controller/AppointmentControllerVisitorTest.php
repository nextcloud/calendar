<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @copyright 2021 Anna Larch <anna.larch@gmx.net>
 *
 * @author Anna Larch <anna.larch@gmx.net>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
namespace OCA\Calendar\Controller;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OC\AppFramework\Services\InitialState;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCP\AppFramework\Services\IInitialState;
use OCP\Calendar\ICalendarQuery;
use OCP\Contacts\IManager;
use OCP\IRequest;
use OCP\IUser;
use OCP\IUserManager;
use PHPUnit\Framework\MockObject\MockObject;

class AppointmentControllerVisitorTest extends TestCase {
	/** @var string */
	protected $appName;

	/** @var IRequest|MockObject */
	protected $request;

	/** @var IManager|MockObject */
	protected $manager;

	/** @var InitialState|MockObject */
	protected $initialState;

	/** @var IUser|MockObject  */
	protected $user;

	/** @var AppointmentConfigService|MockObject */
	protected $service;

	/** @var AppointmentController */
	protected $controller;

	/** @var IUserManager|MockObject */
	private $userManager;

	/** @var null */
	private $userId;

	protected function setUp():void {
		parent::setUp();

		if (!interface_exists(ICalendarQuery::class)) {
			self::markTestIncomplete();
		}

		$this->request = $this->createMock(IRequest::class);
		$this->userManager = $this->createMock(IUserManager::class);
		$this->service = $this->createMock(AppointmentConfigService::class);
		$this->initialState = $this->createMock(IInitialState::class);
		$this->userId = 'testuser';
		$this->controller = new AppointmentController(
			$this->request,
			$this->userManager,
			$this->service,
			$this->initialState,
			$this->userId
		);
	}

	public function testIndex(): void {
		$appointments = [new AppointmentConfig()];

		$this->userManager->expects($this->exactly(2))
			->method('get')
			->willReturn($this->createConfiguredMock(IUser::class, [
				'getUID' => 'testuser'
			]));
		$this->initialState->expects($this->exactly(2))
			->method('provideInitialState');
		$this->service->expects($this->once())
			->method('getAllAppointmentConfigurations')
			->with($this->userManager->get('testuser')->getUID())
			->willReturn($appointments);

		$this->controller->index('testuser');
	}

	public function testIndexUserNotFound(): void {
		$this->userManager->expects($this->once())
			->method('get')
			->with('user')
			->willReturn(null);
		$this->initialState->expects($this->never())
			->method('provideInitialState');
		$this->service->expects($this->never())
			->method('getAllAppointmentConfigurations');

		$this->controller->index('user');
	}

	public function testShowWithUserId(): void {
		$appointment = new AppointmentConfig();
		$appointment->setUserId('testuser');
		$this->user = 'testing';

		$this->service->expects($this->once())
			->method('findByToken')
			->willReturn($appointment);
		$this->userManager->expects($this->exactly(2))
			->method('get')
			->willReturn($this->createConfiguredMock(IUser::class, [
				'getUID' => 'testuser'
			]));
		$this->initialState->expects($this->exactly(3))
			->method('provideInitialState');

		$this->controller->show('sdklfhkld');
	}

	public function testShowConfigNotFound(): void {
		$token = 'sdklfhkldsfldshf';

		$this->service->expects($this->once())
			->method('findByToken')
			->with($token)
			->willThrowException(new ClientException('', 0, null, 404));
		$this->initialState->expects($this->never())
			->method('provideInitialState');
		$this->service->expects($this->never())
			->method('getAllAppointmentConfigurations');

		$this->controller->show($token);
	}
}
