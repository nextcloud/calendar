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

use OCP\Calendar\ObjectType;

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
		$this->backends[0] = new Backend(array(
			'backend' => 'database123',
			'classname' => 'DatabaseClass',
			'arguments' => array(),
			'enabled' => true,
		));

		$this->backends[1] = new Backend(array(
			'backend' => 'caldav456',
			'classname' => 'CalDAVClass',
			'arguments' => array(),
			'enabled' => false,
		));


		$this->calendars[0] = new Calendar(array(
			'userId' => 'jack',
			'ownerId' => 'johnnie',
			'publicuri' => 'calendar1',
			'backend' => $this->backends[0],
			'color' => 'rgba(255,255,255,1.0)',
			'cruds' => Permissions::ALL,
			'components' => ObjectType::EVENT+ObjectType::TODO,
			'ctag' => 1,
			'description' => 'Some random description text',
			'displayname' => 'Random cal',
			'enabled' => false,
			'lastPropertiesUpdate' => 1234,
			'lastObjectUpdate' => 5678,
			'order' => 10,
			'timezone' => new Timezone($europeBerlin),
			'privateuri' => 'another-test-calendar',
		));

		$this->calendars[1] = new Calendar(array(

		));

		$this->calendars[2] = new Calendar(array(

		));

		$this->calendars[3] = new Calendar(array(

		));

		$this->calendarCollection = new CalendarCollection($this->calendars);
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