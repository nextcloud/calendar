<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Controller;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCP\Calendar\ICalendarQuery;
use OCP\IRequest;
use OCP\IUser;
use PHPUnit\Framework\MockObject\MockObject;
use Psr\Log\LoggerInterface;

class AppointmentConfigControllerTest extends TestCase {
	/** @var IRequest|MockObject */
	private $request;

	/** @var AppointmentConfigService|MockObject */
	private $service;

	/** @var MockObject|LoggerInterface */
	private $logger;

	/** @var AppointmentConfigController */
	private $controller;

	/** @var IUser|MockObject */
	private $user;

	/** @var array */
	private $availability;

	protected function setUp(): void {
		parent::setUp();

		if (!interface_exists(ICalendarQuery::class)) {
			self::markTestIncomplete();
		}

		$this->request = $this->createMock(IRequest::class);
		$this->service = $this->createMock(AppointmentConfigService::class);
		$this->logger = $this->createMock(LoggerInterface::class);
		$this->controller = new AppointmentConfigController(
			$this->request,
			$this->service,
			$this->logger,
			'testuser'
		);

		$this->user = $this->createConfiguredMock(IUser::class, [
			'getUID' => 'testuser'
		]);
		$this->availability = [
			'timezoneId' => 'Europe/Berlin',
			'slots' => [
				'MO' => [],
				'TU' => [],
				'WE' => [],
				'TH' => [],
				'FR' => [],
				'SA' => [],
				'SU' => [],
			]
		];
	}

	public function testIndex(): void {
		$appointments = [new AppointmentConfig()];

		$this->service->expects(self::once())
			->method('getAllAppointmentConfigurations')
			->with($this->user->getUID())
			->willReturn($appointments);

		$this->controller->index();
	}

	public function testIndexException(): void {
		$this->service->expects(self::once())
			->method('getAllAppointmentConfigurations')
			->with($this->user->getUID())
			->willThrowException(new ServiceException());

		$this->controller->index();
	}

	public function testShow(): void {
		$appointment = new AppointmentConfig();
		$id = 1;

		$this->service->expects(self::once())
			->method('findByIdAndUser')
			->with($id, $this->user->getUID())
			->willReturn($appointment);
		$response = $this->controller->show($id);

		self::assertEquals(200, $response->getStatus());
	}

	public function testShowException(): void {
		$id = 1;

		$this->service->expects(self::once())
			->method('findByIdAndUser')
			->with($id, $this->user->getUID())
			->willThrowException(new ClientException());

		$response = $this->controller->show($id);

		self::assertEquals(400, $response->getStatus());
	}

	public function testCreateEmptyAvailability(): void {
		$appointment = new AppointmentConfig();
		$appointment->setName('Test');
		$appointment->setDescription('Test');
		$appointment->setLocation('Test');
		$appointment->setVisibility('PUBLIC');
		$appointment->setTargetCalendarUri('test');
		$appointment->setLength(5 * 60);
		$appointment->setIncrement(5 * 60);

		$this->service->expects(self::never())
			->method('create');

		$response = $this->controller->create(
			'Test',
			'Test',
			'Test',
			'PUBLIC',
			'test',
			[],
			5 * 60,
			5 * 60
		);

		self::assertEquals(422, $response->getStatus());
	}

	public function testCreate(): void {
		$appointment = new AppointmentConfig();
		$appointment->setName('Test');
		$appointment->setDescription('Test');
		$appointment->setLocation('Test');
		$appointment->setVisibility('PUBLIC');
		$appointment->setTargetCalendarUri('test');
		$appointment->setLength(5 * 60);
		$appointment->setAvailabilityAsArray($this->availability);
		$appointment->setIncrement(5 * 60);

		$this->service->expects(self::once())
			->method('create')
			->with('Test', 'Test', 'Test', 'PUBLIC', $this->user->getUID(), 'test', $this->availability, 5 * 60, 5 * 60, 0, 0, 0, null, null, null)
			->willReturn($appointment);

		$response = $this->controller->create(
			'Test',
			'Test',
			'Test',
			'PUBLIC',
			'test',
			$this->availability,
			5 * 60,
			5 * 60
		);

		self::assertEquals(200, $response->getStatus());
	}

	public function testCreateException(): void {
		$appointment = new AppointmentConfig();
		$appointment->setName('Test');
		$appointment->setDescription('Test');
		$appointment->setLocation('Test');
		$appointment->setVisibility('PUBLIC');
		$appointment->setTargetCalendarUri('test');
		$appointment->setAvailabilityAsArray($this->availability);
		$appointment->setLength(5 * 60);
		$appointment->setIncrement(5 * 60);

		$this->service->expects(self::once())
			->method('create')
			->with('Test', 'Test', 'Test', 'PUBLIC', $this->user->getUID(), 'test', $this->availability, 5 * 60, 5 * 60, 0, 0, 0, null, null, null)
			->willThrowException(new ServiceException());

		$response = $this->controller->create(
			'Test',
			'Test',
			'Test',
			'PUBLIC',
			'test',
			$this->availability,
			5 * 60,
			5 * 60
		);

		self::assertEquals(500, $response->getStatus());
	}

	public function testUpdate(): void {
		$appointment = new AppointmentConfig();
		$appointment->setId(1);
		$appointment->setName('Test');
		$appointment->setDescription('Test');
		$appointment->setLocation('Test');
		$appointment->setVisibility('PUBLIC');
		$appointment->setTargetCalendarUri('test');
		$appointment->setLength(5 * 60);
		$appointment->setIncrement(5 * 60);
		$appointment->setAvailabilityAsArray($this->availability);

		$this->service->expects(self::once())
			->method('findByIdAndUser')
			->with($appointment->getId(), $this->user->getUID())
			->willReturn($appointment);

		$this->service->expects(self::once())
			->method('update')
			->with($appointment)
			->willReturn($appointment);

		$response = $this->controller->update(
			1,
			'Test',
			'Test',
			'Test',
			'PUBLIC',
			'test',
			$this->availability,
			5 * 60,
			5 * 60
		);

		self::assertEquals(200, $response->getStatus());
	}

	public function testUpdateNotFound(): void {
		$appointment = new AppointmentConfig();
		$appointment->setId(1);
		$appointment->setName('Test');
		$appointment->setDescription('Test');
		$appointment->setLocation('Test');
		$appointment->setVisibility('PUBLIC');
		$appointment->setTargetCalendarUri('test');
		$appointment->setLength(5 * 60);
		$appointment->setIncrement(5 * 60);
		$appointment->setAvailabilityAsArray($this->availability);

		$this->service->expects(self::once())
			->method('findByIdAndUser')
			->willThrowException(new ClientException());

		$response = $this->controller->update(
			1,
			'Test',
			'Test',
			'Test',
			'PUBLIC',
			'test',
			$this->availability,
			5 * 60,
			5 * 60
		);

		self::assertEquals(404, $response->getStatus());
	}

	public function testUpdateDBException(): void {
		$appointment = new AppointmentConfig();
		$appointment->setId(1);
		$appointment->setName('Test');
		$appointment->setDescription('Test');
		$appointment->setLocation('Test');
		$appointment->setVisibility('PUBLIC');
		$appointment->setTargetCalendarUri('test');
		$appointment->setLength(5 * 60);
		$appointment->setIncrement(5 * 60);
		$appointment->setAvailabilityAsArray($this->availability);

		$this->service->expects(self::once())
			->method('update')
			->willThrowException(new ServiceException());

		$response = $this->controller->update(
			1,
			'Test',
			'Test',
			'Test',
			'PUBLIC',
			'test',
			$this->availability,
			5 * 60,
			5 * 60
		);

		self::assertEquals(500, $response->getStatus());
	}
}
