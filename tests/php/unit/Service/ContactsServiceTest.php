<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2014 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Service;

use ChristophWurst\Nextcloud\Testing\TestCase;

class ContactsServiceTest extends TestCase {
	private ContactsService $service;

	public function setUp(): void {
		$this->service = new ContactsService();
	}

	public function testGetEmail(): void {
		$contact = ['EMAIL' => 'test@test.com'];
		$this->assertEquals(['test@test.com'], $this->service->getEmail($contact));
	}

	public function testIsSystemBook(): void {
		$contact = ['isLocalSystemBook' => true];
		$this->assertTrue($this->service->isSystemBook($contact));
	}

	public function testIsNotSystemBook(): void {
		$contact = ['isLocalSystemBook' => false];
		$this->assertFalse($this->service->isSystemBook($contact));
	}

	public function testNotSetSystemBook(): void {
		$this->assertFalse($this->service->isSystemBook([]));
	}

	public function testHasEmail(): void {
		$contact = ['EMAIL' => 'test@test.com'];
		$this->assertTrue($this->service->hasEmail($contact));
	}

	public function testHasNoEmail(): void {
		$this->assertFalse($this->service->hasEmail([]));
	}

	public function testGetPhotoUri(): void {
		$contact = ['PHOTO' => 'VALUE=uri:http://test'];
		$this->assertEquals('http://test', $this->service->getPhotoUri($contact));
	}

	public function testGetPhotoInvalidUri(): void {
		$contact = ['PHOTO' => 'VALUE=uri:thisisnotit'];
		$this->assertNull($this->service->getPhotoUri($contact));
	}

	public function testGetPhotoUriNoPhoto(): void {
		$this->assertNull($this->service->getPhotoUri([]));
	}

	public function testFilterGroupsWithCount(): void {
		$contact = [
			['CATEGORIES' => 'The Proclaimers,I\'m gonna be,When I go out,I would walk 500 Miles,I would walk 500 more'],
			['CATEGORIES' => 'The Proclaimers,When I\'m lonely,I would walk 500 Miles,I would walk 500 more'],
		];

		$searchterm = 'walk';

		$expected = [
			'I would walk 500 Miles' => 2,
			'I would walk 500 more' => 2,
		];

		$this->assertEqualsCanonicalizing($expected, $this->service->filterGroupsWithCount($contact, $searchterm));
	}

	public function testGetTimezoneId(): void {
		$contact = ['TZ' => ['UTC']];
		$this->assertEquals('UTC', $this->service->getTimezoneId($contact));
	}

	public function testGetLanguageId(): void {
		$contact = ['LANG' => ['de_de']];
		$this->assertEquals('de_de', $this->service->getLanguageId($contact));
	}

	public function testGetNameFromContact(): void {
		$contact = ['FN' => 'test'];
		$this->assertEquals('test', $this->service->getNameFromContact($contact));
	}

	public function testGetNameFromContactNoName(): void {
		$this->assertEquals('', $this->service->getNameFromContact([]));
	}
}
