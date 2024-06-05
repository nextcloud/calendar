<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Tests\Integration\Db;

use ChristophWurst\Nextcloud\Testing\DatabaseTransaction;
use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\AppointmentConfigMapper;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\IDBConnection;

class AppointmentConfigMapperTest extends TestCase {
	use DatabaseTransaction;

	/** @var IDBConnection */
	private $db;

	/** @var AppointmentConfigMapper */
	private $mapper;

	protected function setUp(): void {
		parent::setUp();

		$this->db = \OC::$server->getDatabaseConnection();
		$this->mapper = new AppointmentConfigMapper(
			$this->db
		);

		$qb = $this->db->getQueryBuilder();

		$delete = $qb->delete($this->mapper->getTableName());
		$delete->execute();
	}

	public function testFindByIdNoData() {
		$this->expectException(DoesNotExistException::class);
		$this->mapper->findByIdForUser(1, 'test');
	}

	/**
	 * @depends testFindByIdNoData
	 */
	public function testFindById() {
		$appointment = new AppointmentConfig();
		$appointment->setToken('okens');
		$appointment->setName('Test 2');
		$appointment->setDescription('Test Description');
		$appointment->setIncrement(15 * 60);
		$appointment->setLength(60 * 60);
		$appointment->setTargetCalendarUri('testuri');
		$appointment->setVisibility(AppointmentConfig::VISIBILITY_PUBLIC);
		$appointment->setUserId('testuser');

		$appointment = $this->mapper->insert($appointment);
		$id = $appointment->getId();
		$appointment = $this->mapper->findById($id);


		$this->assertEquals('okens', $appointment->getToken());
		$this->assertEquals('Test 2', $appointment->getName());
		$this->assertEquals('Test Description', $appointment->getDescription());
		$this->assertEquals(15 * 60, $appointment->getIncrement());
		$this->assertEquals(60 * 60, $appointment->getLength());
		$this->assertEquals('testuri', $appointment->getTargetCalendarUri());
		$this->assertEquals(AppointmentConfig::VISIBILITY_PUBLIC, $appointment->getVisibility());
		$this->assertEquals('testuser', $appointment->getUserId());
	}

	/**
	 * @depends testFindByIdNoData
	 */
	public function testFindByToken() {
		$appointment = new AppointmentConfig();
		$appointment->setToken('okensdsadsas');
		$appointment->setName('Test 2');
		$appointment->setDescription('Test Description');
		$appointment->setIncrement(15 * 60);
		$appointment->setLength(60 * 60);
		$appointment->setTargetCalendarUri('testuri');
		$appointment->setVisibility(AppointmentConfig::VISIBILITY_PUBLIC);
		$appointment->setUserId('testuser');

		$appointment = $this->mapper->insert($appointment);
		$token = $appointment->getToken();
		$appointment = $this->mapper->findByToken($token);


		$this->assertEquals('okensdsadsas', $appointment->getToken());
		$this->assertEquals('Test 2', $appointment->getName());
		$this->assertEquals('Test Description', $appointment->getDescription());
		$this->assertEquals(15 * 60, $appointment->getIncrement());
		$this->assertEquals(60 * 60, $appointment->getLength());
		$this->assertEquals('testuri', $appointment->getTargetCalendarUri());
		$this->assertEquals(AppointmentConfig::VISIBILITY_PUBLIC, $appointment->getVisibility());
		$this->assertEquals('testuser', $appointment->getUserId());
	}

	public function testFindAllForUser():void {
		$appointment = new AppointmentConfig();
		$appointment->setToken('frokns');
		$appointment->setName('Test 3');
		$appointment->setDescription('Test Description');
		$appointment->setIncrement(15 * 60);
		$appointment->setLength(60 * 60);
		$appointment->setTargetCalendarUri('testuri');
		$appointment->setVisibility(AppointmentConfig::VISIBILITY_PUBLIC);
		$appointment->setUserId('testuser');

		$this->mapper->insert($appointment);
		$appointments = $this->mapper->findAllForUser('testuser');

		$this->assertNotEmpty($appointments);

		foreach ($appointments as $appointment) {
			$this->assertEquals('testuser', $appointment->getUserId());
		}
	}

	public function testDeleteById():void {
		$appointment = new AppointmentConfig();
		$appointment->setToken('frokns');
		$appointment->setName('Test 2');
		$appointment->setDescription('Test Description');
		$appointment->setIncrement(15 * 60);
		$appointment->setLength(60 * 60);
		$appointment->setTargetCalendarUri('testuri');
		$appointment->setVisibility(AppointmentConfig::VISIBILITY_PUBLIC);
		$appointment->setUserId('testuser');

		$appointment = $this->mapper->insert($appointment);

		$row = $this->mapper->deleteById($appointment->getId(), $appointment->getUserId());

		$this->assertEquals(1, $row);

		$this->expectException(DoesNotExistException::class);
		$this->mapper->findById($appointment->getId());
	}
}
