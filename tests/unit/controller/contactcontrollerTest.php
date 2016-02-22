<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
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
namespace OCA\Calendar\Controller;

class ContactControllerTest extends \PHPUnit_Framework_TestCase {

	private $appName;
	private $request;
	private $contacts;

	private $controller;

	public function setUp() {
		$this->appName = 'calendar';
		$this->request = $this->getMockBuilder('\OCP\IRequest')
			->disableOriginalConstructor()
			->getMock();
		$this->contacts = $this->getMockBuilder('OCP\Contacts\IManager')
			->disableOriginalConstructor()
			->getMock();

		$this->controller = new ContactController($this->appName,
			$this->request, $this->contacts);
	}

	public function testSearchLocation() {
		$expected = [
			[
				'label' => "33 42nd Street\nRandom Town\nSome State\nUnited States",
				'name' => 'Person 1',
			],
			[
				'label' => "5 Random Ave\n12782 Some big city\nYet another state\nUnited States",
				'name' => 'Person 1',
			],
			[
				'label' => "ABC Street 2\n01337 Village\nGermany",
				'name' => '',
			],
		];

		$apiResponse = [
			[
				'FN' => 'Person 1',
				'ADR' => [
						'33 42nd Street;Random Town;Some State;;United States',
						';;5 Random Ave;12782 Some big city;Yet another state;United States',
				],
			],
			[
				'FN' => 'Person 2',
			],
			[
				'ADR' => [
					'ABC Street 2;01337 Village;;Germany',
				],
			],
		];

		$this->contacts->expects($this->once())
			->method('search')
			->with($this->equalTo('Person'), $this->equalTo(['FN', 'ADR']))
			->will($this->returnValue($apiResponse));

		$actual = $this->controller->searchLocation('Person');

		$this->assertEquals($expected, $actual->getData());

	}

	public function testSearchAttendee() {
		$expected = [
			[
				'name' => 'Person 1',
				'email' => '1@2.org',
			],
			[
				'name' => 'Person 1',
				'email' => '3@4.com',
			],
			[
				'name' => '',
				'email' => '5@6.net',
			],
		];

		$apiResponse = [
			[
				'FN' => 'Person 1',
				'EMAIL' => [
					'1@2.org',
					'3@4.com',
				],
			],
			[
				'FN' => 'Person 2',
			],
			[
				'EMAIL' => [
					'5@6.net',
				],
			],
		];

		$this->contacts->expects($this->once())
			->method('search')
			->with($this->equalTo('Person'), $this->equalTo(['FN', 'EMAIL']))
			->will($this->returnValue($apiResponse));

		$actual = $this->controller->searchAttendee('Person');

		$this->assertEquals($expected, $actual->getData());
	}
}
