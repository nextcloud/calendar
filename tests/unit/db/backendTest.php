<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
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
namespace OCA\Calendar\Db;

use OCA\Calendar\IBackend;

class BackendTest extends \PHPUnit_Framework_TestCase {

	/**
	 * @var array
	 */
	private $initValues;


	/**
	 * @var array
	 */
	private $newValues;


	/**
	 * @var \OCA\Calendar\Db\Backend
	 */
	private $backend;


	/**
	 * Initialize the backend object we are going to test
	 */
	protected function setup() {
		$this->initValues = [
			'id' => 'backend123',
			'backendAPI' => function() {
				return $this->getMock('\OCA\Calendar\IBackendAPI');
			},
			'calendarAPI' => function() {
				return $this->getMock('OCA\Calendar\ICalendarAPI');
			},
			'objectAPI' => function() {
				return $this->getMock('OCA\Calendar\IObjectAPI');
			},
			'objectCache' => function() {
				return $this->getMock('OCA\Calendar\Db\ObjectMapper');
			}
		];

		$this->newValues = [
			'id' => 'backend456',
		];

		$this->backend = Backend::fromParams($this->initValues);
	}


	public function testGetId() {
		$expected = $this->initValues['id'];
		$actual = $this->backend->getId();

		$this->assertSame($expected, $actual);
	}


	public function testGetBackendAPI() {
		$expected = $this->initValues['backendAPI'];
		$actual = $this->backend->getBackendAPI();

		$this->assertSame($expected, $actual);
	}


	public function testGetCalendarAPI() {
		$expected = $this->initValues['calendarAPI'];
		$actual = $this->backend->getCalendarAPI();

		$this->assertSame($expected, $actual);
	}


	public function testGetObjectAPI() {
		$expected = $this->initValues['objectAPI']();
		//TODO - how to test that a method passes an argument to the constructor of the object that's returned?
		$actual = $this->backend->getObjectAPI($this->getMock('\OCA\Calendar\ICalendar'));

		$this->assertSame($expected, $actual);
	}


	public function testGetObjectCache() {
		$expected = $this->initValues['objectCache']();
		$actual = $this->backend->getObjectCache($this->getMock('\OCA\Calendar\ICalendar'));

		$this->assertSame($expected, $actual);
	}


	public function testSetId() {

	}


	public function testSetBackendAPI() {

	}


	public function testSetCalendarAPI() {

	}


	public function testSetObjectAPI() {

	}


	public function testSetObjectCache() {

	}


	public function testToString() {
		$expected = $this->initValues['id'];
		$this->backend->setId($expected);

		$this->assertSame($expected, (string) $this->backend);
	}
}