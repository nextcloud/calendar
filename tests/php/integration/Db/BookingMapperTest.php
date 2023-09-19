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
use OC;
use OCA\Calendar\Db\Booking;
use OCA\Calendar\Db\BookingMapper;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\IDBConnection;

class BookingMapperTest extends TestCase {
	use DatabaseTransaction;

	/** @var IDBConnection */
	private $db;

	/** @var BookingMapper */
	private $mapper;

	protected function setUp(): void {
		parent::setUp();

		$this->db = OC::$server->get(IDBConnection::class);
		$this->time = $this->createConfiguredMock(ITimeFactory::class, [
			'getTime' => 1635721200
		]);
		$this->mapper = new BookingMapper(
			$this->db,
			$this->time
		);

		$qb = $this->db->getQueryBuilder();

		$delete = $qb->delete($this->mapper->getTableName());
		$delete->execute();
	}

	public function testFindByIdNoData() {
		$this->expectException(DoesNotExistException::class);
		$this->mapper->findByToken('token');
	}

	/**
	 * @depends testFindByIdNoData
	 */
	public function testFindByToken() {
		$booking = new Booking();
		$booking->setApptConfigId(1);
		$booking->setCreatedAt($this->time->getTime());
		$booking->setToken('oken');
		$booking->setDisplayName('Test');
		$booking->setStart(123);
		$booking->setEnd(123);
		$booking->setEmail('test@test.com');
		$booking->setTimezone('Europe/Berlin');

		$booking = $this->mapper->insert($booking);
		$token = $booking->getToken();
		$booking = $this->mapper->findByToken($token);

		$this->assertEquals('1', $booking->getApptConfigId());
		$this->assertEquals($this->time->getTime(), $booking->getCreatedAt());
		$this->assertEquals('oken', $booking->getToken());
		$this->assertEquals('Test', $booking->getDisplayName());
		$this->assertEquals(123, $booking->getStart());
		$this->assertEquals(123, $booking->getEnd());
		$this->assertEquals('test@test.com', $booking->getEmail());
		$this->assertEquals('Europe/Berlin', $booking->getTimezone());
	}

	public function testDeleteOutdated():void {
		$booking = new Booking();
		$booking->setApptConfigId(1);
		$booking->setCreatedAt(891485);
		$booking->setToken('okfdfssdsdfen');
		$booking->setDisplayName('Test');
		$booking->setStart(123);
		$booking->setEnd(123);
		$booking->setEmail('test@test.com');
		$booking->setTimezone('Europe/Berlin');
		$booking = $this->mapper->insert($booking);
		$token = $booking->getToken();
		$booking = $this->mapper->findByToken($token);

		$row = $this->mapper->deleteOutdated(86400);

		$this->assertEquals(1, $row);

		$this->expectException(DoesNotExistException::class);
		$this->mapper->findByToken($token);
	}
}
