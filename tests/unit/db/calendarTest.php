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

class CalendarTest extends \PHPUnit_Framework_TestCase {

	/**
	 * @var array
	 */
	private $initValues;


	/**
	 * @var array
	 */
	private $newValues;


	/**
	 * @var \OCA\Calendar\Db\Calendar
	 */
	private $calendar;


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

		$this->initValues = [
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

		$this->newValues = array(
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
		);

		$this->calendar = Calendar::fromParams($this->initValues);
	}


	/**
	 * Getters
	 */
	public function testGetBackend() {
		$expected = $this->initValues['backend'];
		$actual = $this->calendar->getBackend();

		$this->assertSame($expected, $actual);
	}


	public function testGetFileId() {
		$expected = $this->initValues['fileId'];
		$actual = $this->calendar->getFileId();

		$this->assertSame($expected, $actual);
	}


	public function testGetColor() {
		$expected = $this->initValues['color'];
		$actual = $this->calendar->getColor();

		$this->assertSame($expected, $actual);
	}


	public function testGetCruds() {
		$expected = $this->initValues['cruds'];
		$actual = $this->calendar->getCruds();

		$this->assertSame($expected, $actual);

	}


	public function testGetComponents() {
		$expected = $this->initValues['components'];
		$actual = $this->calendar->getComponents();

		$this->assertSame($expected, $actual);
	}


	public function testGetCtag() {

		$expected = $this->initValues['ctag'];
		$actual = $this->calendar->getCtag();

		$this->assertSame($expected, $actual);
	}


	public function testGetDescription() {
		$expected = $this->initValues['description'];
		$actual = $this->calendar->getDescription();

		$this->assertSame($expected, $actual);
	}


	public function testGetDisplayname() {
		$expected = $this->initValues['displayname'];
		$actual = $this->calendar->getDisplayname();

		$this->assertSame($expected, $actual);
	}


	public function testGetEnabled() {
		$expected = $this->initValues['enabled'];
		$actual = $this->calendar->getEnabled();

		$this->assertSame($expected, $actual);
	}


	public function testGetOrder() {
		$expected = $this->initValues['order'];
		$actual = $this->calendar->getOrder();

		$this->assertSame($expected, $actual);
	}


	public function testGetOwnerId() {
		$expected = $this->initValues['ownerId'];
		$actual = $this->calendar->getOwnerId();

		$this->assertSame($expected, $actual);
	}


	public function testGetPublicUri() {
		$expected = $this->initValues['publicUri'];
		$actual = $this->calendar->getPublicUri();

		$this->assertSame($expected, $actual);
	}


	public function testGetPrivateUri() {
		$expected = $this->initValues['privateUri'];
		$actual = $this->calendar->getPrivateUri();

		$this->assertSame($expected, $actual);
	}


	public function testGetTimezone() {
		$expected = $this->initValues['timezone'];
		$actual = $this->calendar->getTimezone();

		$this->assertSame($expected->getTzId(), $actual->getTzId());
	}


	public function testGetUserId() {
		$expected = $this->initValues['userId'];
		$actual = $this->calendar->getUserId();

		$this->assertSame($expected, $actual);
	}


	/**
	 * Setters
	 */
	public function testSetBackend() {
		$expected = $this->newValues['backend'];
		$this->calendar->setBackend($expected);
		$actual = $this->calendar->getBackend();

		$this->assertSame($expected, $actual);
	}


	public function testSetColor() {
		$expected = $this->newValues['color'];
		$this->calendar->setColor($expected);
		$actual = $this->calendar->getColor();

		$this->assertSame($expected, $actual);

		//HEX -> rgba
		$this->calendar->setColor('#708090');
		$actual = $this->calendar->getColor();

		$this->assertSame('rgba(112,128,144,1.0)', $actual);

		//rgb -> rgba
		$this->calendar->setColor('rgb(255,42,255)');
		$actual = $this->calendar->getColor();

		$this->assertSame('rgba(255,42,255,1.0)', $actual);
	}


	public function testSetCruds() {
		$expected = $this->newValues['cruds'];
		$this->calendar->setCruds($expected);
		$actual = $this->calendar->getCruds();

		$this->assertSame($expected, $actual);
	}


	public function testSetComponents() {
		$expected = $this->newValues['components'];
		$this->calendar->setComponents($expected);
		$actual = $this->calendar->getComponents();

		$this->assertSame($expected, $actual);
	}


	public function testSetCtag() {
		$expected = $this->newValues['ctag'];
		$this->calendar->setCtag($expected);
		$actual = $this->calendar->getCtag();

		$this->assertSame($expected, $actual);
	}


	public function testSetDescription() {
		$expected = $this->newValues['description'];
		$this->calendar->setDescription($expected);
		$actual = $this->calendar->getDescription();

		$this->assertSame($expected, $actual);
	}


	public function testSetDisplayname() {
		$expected = $this->newValues['displayname'];
		$this->calendar->setDisplayname($expected);
		$actual = $this->calendar->getDisplayname();

		$this->assertSame($expected, $actual);
	}


	public function testSetEnabled() {
		$expected = $this->newValues['enabled'];
		$this->calendar->setEnabled($expected);
		$actual = $this->calendar->getEnabled();

		$this->assertSame($expected, $actual);
	}


	public function testSetOrder() {
		$expected = $this->newValues['order'];
		$this->calendar->setOrder($expected);
		$actual = $this->calendar->getOrder();

		$this->assertSame($expected, $actual);
	}


	public function testSetOwnerId() {
		$expected = $this->newValues['ownerId'];
		$this->calendar->setOwnerId($expected);
		$actual = $this->calendar->getOwnerId();

		$this->assertSame($expected, $actual);
	}


	public function testSetTimezone() {
		$expected = $this->newValues['timezone'];
		$this->calendar->setTimezone($expected);
		$actual = $this->calendar->getTimezone();

		$this->assertSame($expected->getTzId(), $actual->getTzId());
	}


	public function testSetPublicUri() {
		$expected = $this->newValues['publicUri'];
		$this->calendar->setPublicUri($expected);
		$actual = $this->calendar->getPublicUri();

		$this->assertSame($expected, $actual);
	}


	public function testSetPrivateUri() {
		$expected = $this->newValues['privateUri'];
		$this->calendar->setPrivateUri($expected);
		$actual = $this->calendar->getPrivateUri();

		$this->assertSame($expected, $actual);
	}


	public function testSetUserId() {
		$expected = $this->newValues['userId'];
		$this->calendar->setUserId($expected);
		$actual = $this->calendar->getUserId();

		$this->assertSame($expected, $actual);
	}


	public function testSetFileId() {
		$expected = $this->newValues['fileId'];
		$this->calendar->setFileId($expected);
		$actual = $this->calendar->getFileId();

		$this->assertSame($expected, $actual);
	}


	public function testDoesAllow() {
		$this->calendar->setCruds(Permissions::CREATE);

		$this->assertTrue($this->calendar->doesAllow(Permissions::CREATE));
		$this->assertFalse($this->calendar->doesAllow(Permissions::READ));
		$this->assertFalse($this->calendar->doesAllow(Permissions::UPDATE));
		$this->assertFalse($this->calendar->doesAllow(Permissions::DELETE));
		$this->assertFalse($this->calendar->doesAllow(Permissions::SHARE));

		$this->calendar->setCruds(Permissions::READ);

		$this->assertFalse($this->calendar->doesAllow(Permissions::CREATE));
		$this->assertTrue($this->calendar->doesAllow(Permissions::READ));
		$this->assertFalse($this->calendar->doesAllow(Permissions::UPDATE));
		$this->assertFalse($this->calendar->doesAllow(Permissions::DELETE));
		$this->assertFalse($this->calendar->doesAllow(Permissions::SHARE));

		$this->calendar->setCruds(Permissions::UPDATE);

		$this->assertFalse($this->calendar->doesAllow(Permissions::CREATE));
		$this->assertFalse($this->calendar->doesAllow(Permissions::READ));
		$this->assertTrue($this->calendar->doesAllow(Permissions::UPDATE));
		$this->assertFalse($this->calendar->doesAllow(Permissions::DELETE));
		$this->assertFalse($this->calendar->doesAllow(Permissions::SHARE));

		$this->calendar->setCruds(Permissions::DELETE);

		$this->assertFalse($this->calendar->doesAllow(Permissions::CREATE));
		$this->assertFalse($this->calendar->doesAllow(Permissions::READ));
		$this->assertFalse($this->calendar->doesAllow(Permissions::UPDATE));
		$this->assertTrue($this->calendar->doesAllow(Permissions::DELETE));
		$this->assertFalse($this->calendar->doesAllow(Permissions::SHARE));

		$this->calendar->setCruds(Permissions::SHARE);

		$this->assertFalse($this->calendar->doesAllow(Permissions::CREATE));
		$this->assertFalse($this->calendar->doesAllow(Permissions::READ));
		$this->assertFalse($this->calendar->doesAllow(Permissions::UPDATE));
		$this->assertFalse($this->calendar->doesAllow(Permissions::DELETE));
		$this->assertTrue($this->calendar->doesAllow(Permissions::SHARE));

		$this->calendar->setCruds(Permissions::ALL);

		$this->assertTrue($this->calendar->doesAllow(Permissions::CREATE));
		$this->assertTrue($this->calendar->doesAllow(Permissions::READ));
		$this->assertTrue($this->calendar->doesAllow(Permissions::UPDATE));
		$this->assertTrue($this->calendar->doesAllow(Permissions::DELETE));
		$this->assertTrue($this->calendar->doesAllow(Permissions::SHARE));

		$this->calendar->setCruds(Permissions::ALL_CALENDAR);

		$this->assertTrue($this->calendar->doesAllow(Permissions::CREATE));
		$this->assertTrue($this->calendar->doesAllow(Permissions::READ));
		$this->assertTrue($this->calendar->doesAllow(Permissions::UPDATE));
		$this->assertTrue($this->calendar->doesAllow(Permissions::DELETE));
		$this->assertTrue($this->calendar->doesAllow(Permissions::SHARE));

		$this->calendar->setCruds(Permissions::ALL_OBJECT);

		$this->assertFalse($this->calendar->doesAllow(Permissions::CREATE));
		$this->assertTrue($this->calendar->doesAllow(Permissions::READ));
		$this->assertTrue($this->calendar->doesAllow(Permissions::UPDATE));
		$this->assertTrue($this->calendar->doesAllow(Permissions::DELETE));
		$this->assertTrue($this->calendar->doesAllow(Permissions::SHARE));
	}


	public function testDoesSupport() {
		$this->calendar->setComponents(ObjectType::EVENT);

		$this->assertTrue($this->calendar->doesSupport(ObjectType::EVENT));
		$this->assertFalse($this->calendar->doesSupport(ObjectType::JOURNAL));
		$this->assertFalse($this->calendar->doesSupport(ObjectType::TODO));

		$this->calendar->setComponents(ObjectType::JOURNAL);

		$this->assertFalse($this->calendar->doesSupport(ObjectType::EVENT));
		$this->assertTrue($this->calendar->doesSupport(ObjectType::JOURNAL));
		$this->assertFalse($this->calendar->doesSupport(ObjectType::TODO));

		$this->calendar->setComponents(ObjectType::TODO);

		$this->assertFalse($this->calendar->doesSupport(ObjectType::EVENT));
		$this->assertFalse($this->calendar->doesSupport(ObjectType::JOURNAL));
		$this->assertTrue($this->calendar->doesSupport(ObjectType::TODO));

		$this->calendar->setComponents(ObjectType::EVENT + ObjectType::JOURNAL);

		$this->assertTrue($this->calendar->doesSupport(ObjectType::EVENT));
		$this->assertTrue($this->calendar->doesSupport(ObjectType::JOURNAL));
		$this->assertFalse($this->calendar->doesSupport(ObjectType::TODO));

		$this->calendar->setComponents(ObjectType::JOURNAL + ObjectType::TODO);

		$this->assertFalse($this->calendar->doesSupport(ObjectType::EVENT));
		$this->assertTrue($this->calendar->doesSupport(ObjectType::JOURNAL));
		$this->assertTrue($this->calendar->doesSupport(ObjectType::TODO));

		$this->calendar->setComponents(ObjectType::EVENT + ObjectType::TODO);

		$this->assertTrue($this->calendar->doesSupport(ObjectType::EVENT));
		$this->assertFalse($this->calendar->doesSupport(ObjectType::JOURNAL));
		$this->assertTrue($this->calendar->doesSupport(ObjectType::TODO));

		$this->calendar->setComponents(ObjectType::EVENT + ObjectType::JOURNAL + ObjectType::TODO);

		$this->assertTrue($this->calendar->doesSupport(ObjectType::EVENT));
		$this->assertTrue($this->calendar->doesSupport(ObjectType::JOURNAL));
		$this->assertTrue($this->calendar->doesSupport(ObjectType::TODO));
	}


	public function testTouch() {
		$this->calendar->setCtag(41);
		$this->calendar->touch();

		$this->assertSame($this->calendar->getCtag(), 42);
	}
}