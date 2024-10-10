<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Controller;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCP\App\IAppManager;
use OCP\AppFramework\Http\JSONResponse;
use OCP\Contacts\IManager;
use OCP\IRequest;
use OCP\IUserManager;
use PHPUnit\Framework\MockObject\MockObject;

class ContactControllerTest extends TestCase {
	/** @var string */
	protected $appName;

	/** @var IRequest|MockObject */
	protected $request;

	/** @var IManager|MockObject */
	protected $manager;

	/** @var IAppManager|MockObject */
	private $appManager;

	/** @var IUserManager|MockObject */
	private $userManager;

	/** @var ContactController */
	protected $controller;

	protected function setUp():void {
		parent::setUp();

		$this->appName = 'calendar';
		$this->request = $this->createMock(IRequest::class);
		$this->manager = $this->createMock(IManager::class);
		$this->appManager = $this->createMock(IAppManager::class);
		$this->userManager = $this->createMock(IUserManager::class);
		$this->controller = new ContactController($this->appName,
			$this->request, $this->manager, $this->appManager, $this->userManager);
	}

	public function testSearchLocationDisabled():void {
		$this->manager->expects(self::once())
			->method('isEnabled')
			->willReturn(false);

		$this->manager->expects(self::never())
			->method('search');

		$response = $this->controller->searchLocation('search 123');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$this->assertEquals([], $response->getData());
		$this->assertEquals(200, $response->getStatus());
	}

	public function testSearchLocation():void {
		$this->manager->expects(self::once())
			->method('isEnabled')
			->willReturn(true);

		$this->manager->expects(self::exactly(2))
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

	public function testGetGroupMembers() {
		$this->manager->expects(self::once())
			->method('isEnabled')
			->willReturn(true);

		$groupname = 'groupname';
		$this->manager->expects(self::once())
			->method('search')
			->with($groupname, ['CATEGORIES'], ['strict_search' => true])
			->willReturn([]);

		$this->controller->getContactGroupMembers($groupname);

	}

	public function testSearchAttendeeDisabled():void {
		$this->manager->expects(self::once())
			->method('isEnabled')
			->willReturn(false);

		$this->manager->expects(self::never())
			->method('search');

		$response = $this->controller->searchAttendee('search 123');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$this->assertEquals([], $response->getData());
		$this->assertEquals(200, $response->getStatus());
	}

	public function testSearchAttendee():void {
		$this->manager->expects(self::once())
			->method('isEnabled')
			->willReturn(true);

		$this->manager->expects(self::once())
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
		$this->manager->expects(self::once())
			->method('isEnabled')
			->willReturn(false);

		$this->manager->expects(self::never())
			->method('search');

		$response = $this->controller->searchAttendee('search 123');

		$this->assertEquals([], $response->getData());
		$this->assertEquals(200, $response->getStatus());
	}

	public function testSearchPhoto():void {
		$this->manager->expects(self::once())
			->method('isEnabled')
			->willReturn(true);

		$this->manager->expects(self::once())
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
