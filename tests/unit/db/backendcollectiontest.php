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

class BackendCollectionTest extends \PHPUnit_Framework_TestCase {

	/**
	 * @var \OCA\Calendar\Db\BackendCollection
	 */
	private $backendCollection;


	/**
	 * @var array
	 */
	private $backends = array();


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

		$this->backends[2] = new Backend(array(
			'backend' => 'webcal789',
			'classname' => 'WebCalClass',
			'arguments' => array(),
			'enabled' => true,
		));

		$this->backends[3] = new Backend(array(
			'backend' => 'sharing012',
			'classname' => 'SharingClass',
			'arguments' => array(),
			'enabled' => false,
		));

		$this->backendCollection = new BackendCollection($this->backends);
	}


	public function testEnabled() {
		$enabledBackends = $this->backendCollection->enabled();

		$actual = $enabledBackends->getObjects();
		$expected = array(
			$this->backends[0],
			$this->backends[2]
		);

		$this->assertSame($actual, $expected);
	}


	public function testDisabled() {
		$disabledBackends = $this->backendCollection->disabled();

		$actual = $disabledBackends->getObjects();
		$expected = array(
			$this->backends[1],
			$this->backends[3]
		);

		$this->assertSame($actual, $expected);
	}


	public function testBySubscriptionType() {

	}


	public function testFind() {
		$this->assertSame($this->backends[0], $this->backendCollection->find('database123'));
		$this->assertSame($this->backends[1], $this->backendCollection->find('caldav456'));
		$this->assertSame($this->backends[2], $this->backendCollection->find('webcal789'));
		$this->assertSame($this->backends[3], $this->backendCollection->find('sharing012'));
	}


	public function testIsEnabled() {
		$this->assertTrue($this->backendCollection->isEnabled('database123'));
		$this->assertTrue($this->backendCollection->isEnabled('webcal789'));

		$this->assertFalse($this->backendCollection->isEnabled('caldav456'));
		$this->assertFalse($this->backendCollection->isEnabled('sharing012'));
	}
}