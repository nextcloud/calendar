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
use OCP\Calendar\Permissions;

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
		$europeBerlinF = __DIR__ . '/../data/EUROPE-BERLIN.ics';
		$europeBerlin = file_get_contents($europeBerlinF);

		$this->initValues = array(
			'backend' => 'local',
			'color' => 'rgba(255,255,255,1.0)',
			'cruds' => Permissions::READ,
			'components' => ObjectType::EVENT,
			'ctag' => 1,
			'description' => 'Some random description text',
			'displayname' => 'Random cal',
			'enabled' => false,
			'lastPropertiesUpdate' => 1234,
			'lastObjectUpdate' => 5678,
			'order' => 10,
			'ownerId' => 'user123',
			'timezone' => new Timezone($europeBerlin),
			'publicuri' => 'test-calendar',
			'privateuri' => 'another-test-calendar',
			'userId' => 'user456',
			'fileId' => 1,
		);

		$europeLondonF = __DIR__ . '/../data/EUROPE-BERLIN.ics';
		$europeLondon = file_get_contents($europeLondonF);

		$this->newValues = array(
			'backend' => 'caldav',
			'color' => 'rgba(0,0,0,0.8)',
			'cruds' => Permissions::READ + Permissions::DELETE,
			'components' => ObjectType::EVENT + ObjectType::TODO,
			'ctag' => 2,
			'description' => 'Another random description text',
			'displayname' => 'Another cal',
			'enabled' => true,
			'lastPropertiesUpdate' => 12341234,
			'lastObjectUpdate' => 56785678,
			'order' => 15,
			'ownerId' => 'user456',
			'timezone' => new Timezone($europeLondon),
			'publicuri' => 'test-calendar-2',
			'privateuri' => 'another-test-calendar-2',
			'userId' => 'user123',
			'fileId' => 2,
		);

		$this->calendar = new Calendar($this->initValues);
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


	public function testGetLastPropertiesUpdate() {
		$expected = $this->initValues['lastPropertiesUpdate'];
		$actual = $this->calendar->getLastPropertiesUpdate();

		$this->assertSame($expected, $actual);
	}


	public function testGetLastObjectUpdate() {
		$expected = $this->initValues['lastObjectUpdate'];
		$actual = $this->calendar->getLastObjectUpdate();

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
		$expected = $this->initValues['publicuri'];
		$actual = $this->calendar->getPublicUri();

		$this->assertSame($expected, $actual);
	}


	public function testGetPrivateUri() {
		$expected = $this->initValues['privateuri'];
		$actual = $this->calendar->getPrivateUri();

		$this->assertSame($expected, $actual);
	}


	public function testGetTimezone() {
		$expected = $this->initValues['timezone'];
		$actual = $this->calendar->getTimezone();

		$this->assertSame((string) $expected, (string) $actual);
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


	public function testSetLastPropertiesUpdate() {
		$expected = $this->newValues['lastPropertiesUpdate'];
		$this->calendar->setLastPropertiesUpdate($expected);
		$actual = $this->calendar->getLastPropertiesUpdate();

		$this->assertSame($expected, $actual);
	}


	public function testSetLastObjectUpdate() {
		$expected = $this->newValues['lastObjectUpdate'];
		$this->calendar->setLastObjectUpdate($expected);
		$actual = $this->calendar->getLastObjectUpdate();

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
		$expected = $this->newValues['publicuri'];
		$this->calendar->setPublicUri($expected);
		$actual = $this->calendar->getPublicUri();

		$this->assertSame($expected, $actual);
	}


	public function testSetPrivateUri() {
		$expected = $this->newValues['privateuri'];
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