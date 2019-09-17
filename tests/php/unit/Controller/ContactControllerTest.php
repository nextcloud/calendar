<?php
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2019 Georg Ehrke <oc.list@georgehrke.com>
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

use OCP\AppFramework\Http\JSONResponse;
use OCP\Contacts\IManager;
use OCP\IRequest;
use Test\TestCase;

class ContactControllerTest extends TestCase {

	/** @var string */
	protected $appName;

	/** @var IRequest|\PHPUnit_Framework_MockObject_MockObject */
	protected $request;

	/** @var IManager|\PHPUnit_Framework_MockObject_MockObject */
	protected $manager;

	/** @var ContactController */
	protected $controller;

	protected function setUp():void {
		parent::setUp();

		$this->appName = 'calendar';
		$this->request = $this->createMock(IRequest::class);
		$this->manager = $this->createMock(IManager::class);
		$this->controller = new ContactController($this->appName,
			$this->request, $this->manager);
	}

	public function testSearchLocationDisabled():void {
		$this->manager->expects($this->once())
			->method('isEnabled')
			->with()
			->willReturn(false);

		$this->manager->expects($this->never())
			->method('search');

		$response = $this->controller->searchLocation('search 123');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$this->assertEquals([], $response->getData());
		$this->assertEquals(200, $response->getStatus());
	}

	public function testSearchLocation():void {
		$this->manager->expects($this->at(0))
			->method('isEnabled')
			->with()
			->willReturn(true);

		$this->manager->expects($this->at(1))
			->method('search')
			->with('search 123', ['FN', 'ADR'])
			->willReturn([
				[
					'FN' => 'Person 1',
					'ADR' => [
							'33 42nd Street;Random Town;Some State;;United States',
							';;5 Random Ave;12782 Some big city;Yet another state;United States',
					],
					'EMAIL' => [
						'foo1@example.com',
						'foo2@example.com',
					],
					'LANG' => [
						'de',
						'en'
					],
					'TZ' => [
						'Europe/Berlin',
						'UTC'
					],
					'PHOTO' => 'VALUE=uri:http://foo.bar'
				],
				[
					'FN' => 'Person 2',
					'EMAIL' => 'foo3@example.com',
				],
				[
					'ADR' => [
						'ABC Street 2;01337 Village;;Germany',
					],
					'LANG' => 'en_us',
					'TZ' => 'Australia/Adelaide',
					'PHOTO' => 'VALUE:BINARY:4242424242'
				],
				[
					'isLocalSystemBook' => true,
					'FN' => 'Person 3',
					'ADR' => [
						'ABC Street 2;01337 Village;;Germany',
					],
					'LANG' => 'en_us',
					'TZ' => 'Australia/Adelaide',
					'PHOTO' => 'VALUE:BINARY:4242424242'
				],
			]);

		$response = $this->controller->searchLocation('search 123');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$this->assertEquals([
			[
				'name' => 'Person 1',
				'addresses' => [
					"33 42nd Street\nRandom Town\nSome State\nUnited States",
					"5 Random Ave\n12782 Some big city\nYet another state\nUnited States",
				],
				'photo' => 'http://foo.bar',
			], [
				'name' => '',
				'addresses' => [
					"ABC Street 2\n01337 Village\nGermany",
				],
				'photo' => null,
			]
		], $response->getData());
		$this->assertEquals(200, $response->getStatus());
	}

	public function testSearchAttendeeDisabled():void {
		$this->manager->expects($this->once())
			->method('isEnabled')
			->with()
			->willReturn(false);

		$this->manager->expects($this->never())
			->method('search');

		$response = $this->controller->searchAttendee('search 123');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$this->assertEquals([], $response->getData());
		$this->assertEquals(200, $response->getStatus());
	}

	public function testSearchAttendee():void {
		$this->manager->expects($this->at(0))
			->method('isEnabled')
			->with()
			->willReturn(true);

		$this->manager->expects($this->at(1))
			->method('search')
			->with('search 123', ['FN', 'EMAIL'])
			->willReturn([
				[
					'FN' => 'Person 1',
					'ADR' => [
						'33 42nd Street;Random Town;Some State;;United States',
						';;5 Random Ave;12782 Some big city;Yet another state;United States',
					],
					'EMAIL' => [
						'foo1@example.com',
						'foo2@example.com',
					],
					'LANG' => [
						'de',
						'en'
					],
					'TZ' => [
						'Europe/Berlin',
						'UTC'
					],
					'PHOTO' => 'VALUE=uri:http://foo.bar'
				],
				[
					'FN' => 'Person 2',
					'EMAIL' => 'foo3@example.com',
				],
				[
					'ADR' => [
						'ABC Street 2;01337 Village;;Germany',
					],
					'LANG' => 'en_us',
					'TZ' => 'Australia/Adelaide',
					'PHOTO' => 'VALUE:BINARY:4242424242'
				],
				[
					'isLocalSystemBook' => true,
					'FN' => 'Person 3',
					'ADR' => [
						'ABC Street 2;01337 Village;;Germany',
					],
					'LANG' => 'en_us',
					'TZ' => 'Australia/Adelaide',
					'PHOTO' => 'VALUE:BINARY:4242424242'
				],
			]);

		$response = $this->controller->searchAttendee('search 123');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$this->assertEquals([
			[
				'name' => 'Person 1',
				'emails' => [
					'foo1@example.com',
					'foo2@example.com',
				],
				'lang' => 'de',
				'tzid' => 'Europe/Berlin',
				'photo' => 'http://foo.bar',
			], [
				'name' => 'Person 2',
				'emails' => [
					'foo3@example.com'
				],
				'lang' => null,
				'tzid' => null,
				'photo' => null,
			]
		], $response->getData());
		$this->assertEquals(200, $response->getStatus());
	}

	public function testSearchPhotoDisabled():void {
		$this->manager->expects($this->once())
			->method('isEnabled')
			->with()
			->willReturn(false);

		$this->manager->expects($this->never())
			->method('search');

		$response = $this->controller->searchAttendee('search 123');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$this->assertEquals([], $response->getData());
		$this->assertEquals(200, $response->getStatus());
	}

	public function testSearchPhoto():void {
		$this->manager->expects($this->at(0))
			->method('isEnabled')
			->with()
			->willReturn(true);

		$this->manager->expects($this->at(1))
			->method('search')
			->with('foo3@example.com', ['EMAIL'])
			->willReturn([
				[
					'FN' => 'Person 1',
					'ADR' => [
						'33 42nd Street;Random Town;Some State;;United States',
						';;5 Random Ave;12782 Some big city;Yet another state;United States',
					],
					'EMAIL' => [
						'foo1@example.com',
						'foo2@example.com',
					],
					'LANG' => [
						'de',
						'en'
					],
					'TZ' => [
						'Europe/Berlin',
						'UTC'
					],
					'PHOTO' => 'VALUE=uri:http://foo123.bar'
				],
				[
					'FN' => 'Person 2',
					'EMAIL' => 'foo3@example.com',
					'PHOTO' => 'VALUE=uri:http://foo.bar'
				],
				[
					'ADR' => [
						'ABC Street 2;01337 Village;;Germany',
					],
					'LANG' => 'en_us',
					'TZ' => 'Australia/Adelaide',
					'PHOTO' => 'VALUE:BINARY:4242424242'
				],
				[
					'isLocalSystemBook' => true,
					'FN' => 'Person 3',
					'ADR' => [
						'ABC Street 2;01337 Village;;Germany',
					],
					'LANG' => 'en_us',
					'TZ' => 'Australia/Adelaide',
					'PHOTO' => 'VALUE=uri:http://foo456.bar'
				],
			]);

		$response = $this->controller->searchPhoto('foo3@example.com');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$this->assertEquals([
			'name' => 'Person 2',
			'photo' => 'http://foo.bar',
		], $response->getData());
		$this->assertEquals(200, $response->getStatus());
	}
}
