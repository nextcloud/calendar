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

use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Service\AppointmentConfigService;
use OCP\Contacts\IManager;
use OCP\IInitialStateService;
use OCP\IRequest;
use ChristophWurst\Nextcloud\Testing\TestCase;
use OCP\IUser;
use PHPUnit\Framework\MockObject\MockObject;

class AppointmentsControllerTest extends TestCase {

	/** @var string */
	protected $appName;

	/** @var IRequest|MockObject */
	protected $request;

	/** @var IManager|MockObject */
	protected $manager;

	/** @var IInitialStateService|MockObject */
	protected $initialState;

	/** @var IUser|MockObject  */
	protected $user;

	/** @var AppointmentConfigService|MockObject */
	protected $service;

	/** @var AppointmentConfigController */
	protected $controller;

	protected function setUp():void {
		parent::setUp();

		$this->appName = 'calendar';
		$this->request = $this->createMock(IRequest::class);
		$this->manager = $this->createMock(IManager::class);
		$this->user = $this->createConfiguredMock(IUser::class, [
			'getUID' => 'testuser'
		]);
		$this->initialState = $this->createMock(IInitialStateService::class);
		$this->service = $this->createMock(AppointmentConfigService::class);
		$this->controller = new AppointmentConfigController(
			$this->appName,
			$this->request,
			$this->initialState,
			$this->user,
			$this->service
		);
	}

//	public function testIndex(): void {
//		$appointments = [new AppointmentConfig()];
//		$this->service->expects($this->once())
//			->method('getAllAppointmentConfigurations')
//			->with($this->user->getUID())
//			->willReturn($appointments);
//
//		$this->initialState->expects($this->once())
//			->method('provideInitialState')
//			->with(
//				$this->appName,
//				'appointments',
//				$appointments
//			);
//
//		$this->controller->index('user');
//	}
//
//	public function testIndexException(): void {
//		$this->service->expects($this->once())
//			->method('getAllAppointmentConfigurations')
//			->with($this->user->getUID())
//			->willThrowException(new ServiceException());
//
//		$this->initialState->expects($this->once())
//			->method('provideInitialState')
//			->with(
//				$this->appName,
//				'appointments',
//				[]
//			);
//
//		$this->controller->index('user');
//	}
//
//	public function testCreate():void {
//		$data = [];
//		$appointment = new AppointmentConfig([]);
//		$this->service->expects($this->once())
//			->method('create')
//			->with($data)
//			->willReturn($appointment);
//
//		$response = $this->controller->create($data);
//
//		$this->assertEquals(
//			[
//				'status' => 'success',
//				'data' => $appointment
//			], $response->getData());
//		$this->assertEquals(200, $response->getStatus());
//	}
//
//	public function testCreateException():void {
//		$data = [];
//		$this->service->expects($this->once())
//			->method('create')
//			->with($data)
//			->willThrowException(new ServiceException());
//
//		$response = $this->controller->create($data);
//
//		$this->assertEquals(500, $response->getStatus());
//	}
//
//	public function testShow():void {
//		$id = 1;
//		$appointment = new AppointmentConfig();
//		$this->service->expects($this->once())
//			->method('findById')
//			->with(1)
//			->willReturn($appointment);
//
//		$response = $this->controller->show($id);
//
//		$this->assertEquals(
//			[
//				'status' => 'success',
//				'data' => $appointment
//			], $response->getData());
//		$this->assertEquals(200, $response->getStatus());
//	}
//
//	public function testShowException():void {
//		$id = 1;
//		$this->service->expects($this->once())
//			->method('findById')
//			->with(1)
//			->willThrowException(new ServiceException());
//
//		$response = $this->controller->show($id);
//
//		$this->assertEquals(500, $response->getStatus());
//	}
//
//	public function testUpdate():void {
//		$data = [];
//		$appointment = new AppointmentConfig();
//		$this->service->expects($this->once())
//			->method('update')
//			->with($data)
//			->willReturn($appointment);
//
//		$response = $this->controller->update([]);
//
//		$this->assertEquals(
//			[
//				'status' => 'success',
//				'data' => $appointment
//			], $response->getData());
//		$this->assertEquals(200, $response->getStatus());
//	}
//
//	public function testUpdateException():void {
//		$data = [];
//		$this->service->expects($this->once())
//			->method('update')
//			->with($data)
//			->willThrowException(new ServiceException());
//
//		$response = $this->controller->update($data);
//
//		$this->assertEquals(500, $response->getStatus());
//	}
//
//	public function testDelete():void {
//		$id = 1;
//
//		$this->service->expects($this->once())
//			->method('delete')
//			->with(1);
//
//		$response = $this->controller->delete($id);
//
//		$this->assertEquals(
//			[
//				'status' => 'success',
//				'data' => null
//			], $response->getData());
//		$this->assertEquals(200, $response->getStatus());
//	}
//
//	public function testDeleteException():void {
//		$id = 1;
//		$this->service->expects($this->once())
//			->method('delete')
//			->with(1)
//			->willThrowException(new ServiceException());
//
//		$response = $this->controller->delete($id);
//
//		$this->assertEquals(403, $response->getStatus());
//	}
}
