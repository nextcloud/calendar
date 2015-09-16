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
	private $backends = [];


	/**
	 * Initialize the calendar object we are going to test
	 */
	protected function setup() {
		$this->markTestSkipped('must be revisited.');
		return;

		$this->backends[0] = $this->getMock('\OCA\Calendar\Db\Backend');
		$this->backends[0]->expects($this->any())
			->method('getId')
			->will($this->returnValue('database123'));

		$calendarAPIs[0] = $this->getMock('\OCA\Calendar\ICalendarAPI');
		$calendarAPIs[0]->expects($this->any())
			->method('listAll')
			->will($this->returnValue(['abc', 'def']));

		$this->backends[0]->expects($this->any())
			->method('getCalendarAPI')
			->will($this->returnValue($calendarAPIs[0]));

		$this->backends[1] = $this->getMock('OCA\Calendar\Db\Backend');
		$this->backends[1]->expects($this->any())
			->method('getId')
			->will($this->returnValue('caldav456'));

		$calendarAPIs[1] = $this->getMock('\OCA\Calendar\ICalendarAPI');
		$calendarAPIs[1]->expects($this->any())
			->method('listAll')
			->will($this->returnValue(['ghi', 'jkl']));

		$this->backends[1]->expects($this->any())
			->method('getCalendarAPI')
			->will($this->returnValue($calendarAPIs[1]));

		$this->backends[2] = $this->getMock('OCA\Calendar\Db\Backend');
		$this->backends[2]->expects($this->any())
			->method('getId')
			->will($this->returnValue('webcal789'));

		$calendarAPIs[2] = $this->getMock('\OCA\Calendar\ICalendarAPI');
		$calendarAPIs[2]->expects($this->any())
			->method('listAll')
			->will($this->returnValue(['mno', 'pqr']));

		$this->backends[2]->expects($this->any())->method('getCalendarAPI')->will($this->returnValue($calendarAPIs[2]));

		$this->backends[3] = $this->getMock('OCA\Calendar\Db\Backend');
		$this->backends[3]->expects($this->any())->method('getId')->will($this->returnValue('sharing012'));

		$calendarAPIs[3] = $this->getMock('\OCA\Calendar\ICalendarAPI');
		$calendarAPIs[3]->expects($this->any())->method('listAll')->will($this->returnValue(['stu', 'vwx']));

		$this->backends[3]->expects($this->any())->method('getCalendarAPI')->will($this->returnValue($calendarAPIs[3]));

		$this->backendCollection = new BackendCollection(null, null, null, null);
	}


	public function testFind() {
		$this->assertSame($this->backends[0], $this->backendCollection->find('database123'));
		$this->assertSame($this->backends[1], $this->backendCollection->find('caldav456'));
		$this->assertSame($this->backends[2], $this->backendCollection->find('webcal789'));
		$this->assertSame($this->backends[3], $this->backendCollection->find('sharing012'));
	}


	public function testBySubscriptionType() {

	}
}