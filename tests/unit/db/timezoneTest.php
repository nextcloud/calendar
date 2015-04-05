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

class TimezoneTest extends \PHPUnit_Framework_TestCase {

	/**
	 * @var string
	 */
	private $berlinData;


	/**
	 * @var string
	 */
	private $londonData;


	/**
	 * Initialize the timezone object we are going to test
	 */
	protected function setup() {
		$berlinFile = __DIR__ . '/../data/EUROPE-BERLIN.ics';
		$this->berlinData = file_get_contents($berlinFile);

		$londonFile = __DIR__ . '/../data/EUROPE-LONDON.ics';
		$this->londonData = file_get_contents($londonFile);
	}


	public function testSetVobject() {
		$berlin = Timezone::fromData($this->berlinData);
		$london = Timezone::fromData($this->londonData);

		$londonVobject = $london->getVObject();

		$this->assertSame('Europe/Berlin', $berlin->getVObject()->{'VTIMEZONE'}->{'TZID'}->getValue());

		$berlin->setVObject($londonVobject);

		$this->assertSame('Europe/London', $berlin->getVObject()->{'VTIMEZONE'}->{'TZID'}->getValue());
	}


	public function testGetVobject() {
		$berlin = Timezone::fromData($this->berlinData);
		$vobject = $berlin->getVObject();

		//TODO - remove OCA\Calendar prefix once we have latest vobject in 3rdparty
		$this->assertInstanceOf('Sabre\VObject\Component\VCalendar', $vobject);
		$this->assertSame('Europe/Berlin', $vobject->{'VTIMEZONE'}->{'TZID'}->getValue());
	}


	public function testGetTzId() {
		$berlin = Timezone::fromData($this->berlinData);
		$this->assertSame('Europe/Berlin', $berlin->getTzId());

		$london = Timezone::fromData($this->londonData);
		$this->assertSame('Europe/London', $london->getTzId());
	}
}