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

use OCA\Calendar\ObjectType;

class CalendarCollectionTest extends \PHPUnit_Framework_TestCase {

	/**
	 * @var array
	 */
	private $backends = array();


	/**
	 * @var \OCA\Calendar\Db\BackendCollection
	 */
	private $calendarCollection;


	/**
	 * @var array
	 */
	private $calendars = array();


	/**
	 * Initialize the calendar object we are going to test
	 */
	protected function setup() {
		$backendMocks = [];
		$backendMocks[0] = $this->getMock('\OCA\Calendar\IBackend');
		$backendMocks[0]->expects($this->any())
			->method('getId')
			->will($this->returnValue('database123'));
		$backendMocks[1] = $this->getMock('\OCA\Calendar\IBackend');
		$backendMocks[1]->expects($this->any())
			->method('getId')
			->will($this->returnValue('caldav456'));

		$timezoneMocks = [];
		$timezoneMocks[0] = $this->getMock('\OCA\Calendar\ITimezone');
		$timezoneMocks[0]->expects($this->any())
			->method('getTzId')
			->will($this->returnValue('Europe/Berlin'));
		$timezoneMocks[0]->expects($this->any())
			->method('isValid')
			->will($this->returnValue(true));

		$timezoneMocks[1] = $this->getMock('\OCA\Calendar\ITimezone');
		$timezoneMocks[1]->expects($this->any())
			->method('getTzId')
			->will($this->returnValue('Europe/London'));
		$timezoneMocks[1]->expects($this->any())
			->method('isValid')
			->will($this->returnValue(true));

		$this->calendars = [];
		$this->calendars[] = [
			'backend' => $backendMocks[0],
			'color' => 'rgba(255,255,255,1.0)',
			'cruds' => Permissions::READ,
			'components' => ObjectType::EVENT,
			'ctag' => 1,
			'description' => 'Some random description text',
			'displayname' => 'Random cal',
			'enabled' => false,
			'order' => 10,
			'ownerId' => 'user123',
			'timezone' => $timezoneMocks[0],
			'publicUri' => 'test-calendar',
			'privateUri' => 'another-test-calendar',
			'userId' => 'user456',
			'fileId' => 1,
		];

		$this->calendars[] = [
			'backend' => $backendMocks[1],
			'color' => 'rgba(0,0,0,0.8)',
			'cruds' => Permissions::READ + Permissions::DELETE,
			'components' => ObjectType::EVENT + ObjectType::TODO,
			'ctag' => 2,
			'description' => 'Another random description text',
			'displayname' => 'Another cal',
			'enabled' => true,
			'order' => 15,
			'ownerId' => 'user456',
			'timezone' => $timezoneMocks[1],
			'publicUri' => 'test-calendar-2',
			'privateUri' => 'another-test-calendar-2',
			'userId' => 'user123',
			'fileId' => 2,
		];

		$this->calendarCollection = CalendarCollection::fromArray($this->calendars);
	}


	public function testEnabled() {

	}


	public function testDisabled() {

	}


	public function testOwnedBy() {

	}


	public function testComponents() {

	}


	public function testPermissions() {

	}


	public function testFilterByBackends() {

	}
}