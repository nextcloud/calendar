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
	 * Initialize the calendar object we are going to test
	 */
	protected function setup() {
		$api = $this->getMock('OCP\Calendar\IBackendAPI');

		$this->initValues = array(
			'backend' => 'database123',
			'classname' => 'DatabaseClass',
			'arguments' => array(
				'testArgument' => 'testValue',
			),
			'enabled' => true,
			'api' => null,
		);

		$this->newValues = array(
			'backend' => 'caldav456',
			'classname' => 'CalDAVClass',
			'arguments' => array(
				'testArgumentForCalDAV' => 'testValueForCalDAV',
			),
			'enabled' => false,
			'api' => $api,
		);

		$this->backend = new Backend($this->initValues);
	}


	/**
	 * Getters
	 */
	public function testGetBackend() {
		$expected = $this->initValues['backend'];
		$actual = $this->backend->getBackend();

		$this->assertSame($expected, $actual);
	}


	public function testGetClassname() {
		$expected = $this->initValues['classname'];
		$actual = $this->backend->getClassname();

		$this->assertSame($expected, $actual);
	}


	public function testGetArguments() {
		$expected = $this->initValues['arguments'];
		$actual = $this->backend->getArguments();

		$this->assertSame($expected, $actual);
	}


	public function testGetEnabled() {
		$expected = $this->initValues['enabled'];
		$actual = $this->backend->getEnabled();

		$this->assertSame($expected, $actual);

	}


	public function testGetAPI() {
		$expected = $this->initValues['api'];
		$actual = $this->backend->getAPI();

		$this->assertSame($expected, $actual);
	}


	/**
	 * Setters
	 */
	public function testSetBackend() {
		$expected = $this->newValues['backend'];
		$this->backend->setBackend($expected);
		$actual = $this->backend->getBackend();

		$this->assertSame($expected, $actual);
	}


	public function testSetClassname() {
		$expected = $this->newValues['classname'];
		$this->backend->setClassname($expected);
		$actual = $this->backend->getClassname();

		$this->assertSame($expected, $actual);
	}


	public function testSetArguments() {
		$expected = $this->newValues['arguments'];
		$this->backend->setArguments($expected);
		$actual = $this->backend->getArguments();

		$this->assertSame($expected, $actual);
	}


	public function testSetEnabled() {
		$expected = $this->newValues['enabled'];
		$this->backend->setEnabled($expected);
		$actual = $this->backend->getEnabled();

		$this->assertSame($expected, $actual);
	}


	public function testDisable() {
		$this->backend->setEnabled(true);
		$this->backend->disable();

		$this->assertFalse($this->backend->getEnabled());
	}


	public function testEnable() {
		$this->backend->setEnabled(false);
		$this->backend->enable();

		$this->assertTrue($this->backend->getEnabled());
	}


	public function testRegisterAPI() {
		$expected = $this->newValues['api'];
		$this->backend->registerAPI($expected);
		$actual = $this->backend->getAPI();

		$this->assertSame($expected, $actual);
	}


	public function testToString() {
		$expected = $this->initValues['backend'];
		$this->backend->setBackend($expected);

		$this->assertSame($expected, (string) $this->backend);
	}
}