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
namespace OCA\Calendar\Backend\Contact;

class BackendTest extends \PHPUnit_Framework_TestCase {

	/**
	 * @var \OCA\Calendar\Backend\Contact\Backend
	 */
	public $backend;

	public function setup() {
		$contactManager = $this->getMock('\OCP\Contacts\IManager');
		$this->backend = new Backend($contactManager);
	}


	/**
	 * @dataProvider canBeEnabledProvider
	 */
	public function testCanBeEnabled($boolean) {
		$contacts = $this->getMock('\OCP\Contacts\IManager');
		$contacts->expects($this->any())
			->method('isEnabled')
			->will($this->returnValue($boolean));

		$backend = new Backend($contacts);
		$this->assertSame($boolean, $backend->canBeEnabled());
	}


	public function canBeEnabledProvider() {
		return [
			[true],
			[false],
		];
	}


	public function testGetSubscriptionTypes() {
		$this->assertEmpty($this->backend->getSubscriptionTypes());
	}


	/**
	 * @expectedException \OCA\Calendar\Backend\SubscriptionInvalidException
	 */
	public function testValidateSubscription() {
		$subscription = $this->getMock('\OCP\Calendar\ISubscription');
		$this->backend->validateSubscription($subscription);
	}


	public function testGetAvailablePrefixes() {
		$this->assertEmpty($this->backend->getAvailablePrefixes());
	}


	public function testCanStoreColor() {
		$this->assertFalse($this->backend->canStoreColor());
	}


	public function testCanStoreComponents() {
		$this->assertFalse($this->backend->canStoreComponents());
	}


	public function testCanStoreDescription() {
		$this->assertFalse($this->backend->canStoreDescription());
	}


	public function testCanStoreDisplayname() {
		$this->assertFalse($this->backend->canStoreDisplayname());
	}


	public function testCanStoreEnabled() {
		$this->assertFalse($this->backend->canStoreEnabled());
	}


	public function testCanStoreOrder() {
		$this->assertFalse($this->backend->canStoreOrder());
	}
}