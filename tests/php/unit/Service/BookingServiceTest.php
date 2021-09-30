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
namespace OCA\Calendar\Service;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\DB\Exception;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\AppointmentConfigMapper;
use OCA\Calendar\Exception\ServiceException;
use OCP\IConfig;
use OCP\IUser;
use OCP\IUserSession;
use PHPUnit\Framework\MockObject\MockObject;

class AppointmentServiceTest extends TestCase {

	/** @var AppointmentConfigMapper|MockObject  */
	private $mapper;
	/** @var AppointmentConfigService */
	private $service;

	protected function setUp(): void {
		parent::setUp();
		$this->mapper = $this->createMock(AppointmentConfigMapper::class);
		$this->service = new AppointmentConfigService(
			$this->mapper
		);
	}

//	public function testGetAllConfigurations(){
//		$user = 'testuser';
//
//		$this->mapper->expects($this->once())
//			->method('findAllForUser')
//			->with($user)
//			->willReturn([new AppointmentConfig()]);
//
//		$this->service->getAllAppointmentConfigurations($user);
//	}
//
//	public function testGetAllConfigurationsException(){
//		$user = 'testuser';
//
//		$this->mapper->expects($this->once())
//			->method('findAllForUser')
//			->with($user)
//			->willThrowException(new Exception());
//
//		$this->expectException(ServiceException::class);
//		$this->service->getAllAppointmentConfigurations($user);
//	}
//
//	public function testDelete(): void {
//		$id = 1;
//
//		$this->mapper->expects($this->once())
//			->method('deleteById')
//			->with($id);
//
//		$this->service->delete($id);
//	}
//
//	public function testDeleteException(): void {
//		$id = 1;
//
//		$this->mapper->expects($this->once())
//			->method('deleteById')
//			->with($id)
//			->willThrowException(new Exception());
//
//		$this->expectException(ServiceException::class);
//		$this->service->delete($id);
//	}
//
//	public function testUpdate(): void {
//		$data = [];
//
//		$this->mapper->expects($this->once())
//			->method('updateFromData')
//			->with($data)
//			->willReturn(new AppointmentConfig());
//
//		$this->service->update($data);
//	}
//
//	public function testUpdateException(): void {
//		$data = [];
//
//		$this->mapper->expects($this->once())
//			->method('updateFromData')
//			->with($data)
//			->willThrowException(new Exception());
//
//		$this->expectException(ServiceException::class);
//		$this->service->update($data);
//	}
//
//	public function testFindById(): void {
//		$id = 1;
//
//		$this->mapper->expects($this->once())
//			->method('findById')
//			->with($id)
//			->willReturn(new AppointmentConfig());
//
//		$this->service->findById($id);
//	}
//
//	public function testFindByIdException(): void {
//		$id = 1;
//
//		$this->mapper->expects($this->once())
//			->method('findById')
//			->with($id)
//			->willThrowException(new Exception());
//
//		$this->expectException(ServiceException::class);
//		$this->service->findById($id);
//	}
//
//	public function testFindByIdDoesNotExistException(): void {
//		$id = 1;
//
//		$this->mapper->expects($this->once())
//			->method('findById')
//			->with($id)
//			->willThrowException(new DoesNotExistException(''));
//
//		$this->expectException(ServiceException::class);
//		$this->service->findById($id);
//	}
//
//	public function testFindByIdMultipleObjectsReturnedException(): void {
//		$id = 1;
//
//		$this->mapper->expects($this->once())
//			->method('findById')
//			->with($id)
//			->willThrowException(new MultipleObjectsReturnedException(''));
//
//		$this->expectException(ServiceException::class);
//		$this->service->findById($id);
//	}
//
//	public function testCreate(): void {
//		$data = [];
//
//		$this->mapper->expects($this->once())
//			->method('insertFromData')
//			->with($data)
//			->willReturn(new AppointmentConfig());
//
//		$this->service->create($data);
//	}
//
//	public function testCreateException(): void {
//		$data = [];
//
//		$this->mapper->expects($this->once())
//			->method('insertFromData')
//			->with($data)
//			->willThrowException(new Exception());
//
//		$this->expectException(ServiceException::class);
//		$this->service->create($data);
//	}
//
//	public function testIsNotInFuture() : void {
//		$id = 1;
//		$startDate = strtotime('-1 day');
//		$endDate = time();
//
//		$this->mapper->expects($this->never())
//			->method('findById');
//
//		$this->expectException(ServiceException::class);
//		$this->service->getSlots($id, $startDate, $endDate, '');
//	}
//
//	public function testIdDoesNotExist():void {
//		$id = 1;
//		$appointment = new AppointmentConfig();
//		$appointment->setLength(0);
//		$appointment->setIncrement(0);
//
//		// use one day in the future
//		$startDate = strtotime('+1 day');
//		$endDate = strtotime('+31 hours');
//
//		$this->mapper->expects($this->once())
//			->method('findById')
//			->with($id)
//			->willThrowException(new ServiceException());
//
//		$this->expectException(ServiceException::class);
//		$this->service->getSlots($id, $startDate, $endDate, '');
//	}
//
//	public function testGetSlotsNoLength():void {
//		$id = 1;
//		$appointment = new AppointmentConfig();
//		$appointment->setLength(0);
//		$appointment->setIncrement(0);
//
//		$startDate = strtotime('+1 day');
//		$endDate = strtotime('+31 hours');// 7 hour timespan
//
//		$this->mapper->expects($this->once())
//			->method('findById')
//			->with($id)
//			->willReturn($appointment);
//
//		$this->expectException(ServiceException::class);
//		$this->service->getSlots($id, $startDate, $endDate, '');
//	}

//	public function testGetSlots():void {
//		$appointment = new AppointmentConfig();
//		/** every 15 minutes */
//		$appointment->setIncrement(15);
//		/** 60 minutes long */
//		$appointment->setLength(60);
//
//		$startDate = strtotime('+1 day');
//		$endDate = strtotime('+31 hours');// 7 hour timespan
//
//
//	}

}
