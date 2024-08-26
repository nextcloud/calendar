<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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

	/** @var IUser|MockObject */
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
