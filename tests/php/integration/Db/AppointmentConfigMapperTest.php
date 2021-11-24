<?php

declare(strict_types=1);

/**
 * @copyright 2019 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2019 Christoph Wurst <christoph@winzerhof-wurst.at>
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

		$this->assertObjectHasAttribute('token', $appointment);
		$this->assertEquals('okens', $appointment->getToken());
		$this->assertObjectHasAttribute('name', $appointment);
		$this->assertEquals('Test 2', $appointment->getName());
		$this->assertObjectHasAttribute('description', $appointment);
		$this->assertEquals('Test Description', $appointment->getDescription());
		$this->assertObjectHasAttribute('increment', $appointment);
		$this->assertEquals(15 * 60, $appointment->getIncrement());
		$this->assertObjectHasAttribute('length', $appointment);
		$this->assertEquals(60 * 60, $appointment->getLength());
		$this->assertObjectHasAttribute('targetCalendarUri', $appointment);
		$this->assertEquals('testuri', $appointment->getTargetCalendarUri());
		$this->assertObjectHasAttribute('visibility', $appointment);
		$this->assertEquals(AppointmentConfig::VISIBILITY_PUBLIC, $appointment->getVisibility());
		$this->assertObjectHasAttribute('userId', $appointment);
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

		$this->assertObjectHasAttribute('token', $appointment);
		$this->assertEquals('okensdsadsas', $appointment->getToken());
		$this->assertObjectHasAttribute('name', $appointment);
		$this->assertEquals('Test 2', $appointment->getName());
		$this->assertObjectHasAttribute('description', $appointment);
		$this->assertEquals('Test Description', $appointment->getDescription());
		$this->assertObjectHasAttribute('increment', $appointment);
		$this->assertEquals(15 * 60, $appointment->getIncrement());
		$this->assertObjectHasAttribute('length', $appointment);
		$this->assertEquals(60 * 60, $appointment->getLength());
		$this->assertObjectHasAttribute('targetCalendarUri', $appointment);
		$this->assertEquals('testuri', $appointment->getTargetCalendarUri());
		$this->assertObjectHasAttribute('visibility', $appointment);
		$this->assertEquals(AppointmentConfig::VISIBILITY_PUBLIC, $appointment->getVisibility());
		$this->assertObjectHasAttribute('userId', $appointment);
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
			$this->assertObjectHasAttribute('userId', $appointment);
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
