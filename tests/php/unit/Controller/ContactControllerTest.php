<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Controller;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Service\ContactsService;
use OCP\App\IAppManager;
use OCP\AppFramework\Http\JSONResponse;
use OCP\Contacts\IManager;
use OCP\IAppConfig;
use OCP\IConfig;
use OCP\IGroupManager;
use OCP\IRequest;
use OCP\IUser;
use OCP\IUserManager;
use PHPUnit\Framework\MockObject\MockObject;
use Psr\Log\LoggerInterface;
use Psr\Log\NullLogger;

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
	private ContactsService|MockObject $service;
	private IAppConfig|MockObject $appConfig;
	private IConfig|MockObject $config;
	private IGroupManager|MockObject $groupManager;

	/** @var ContactController */
	protected $controller;

	private LoggerInterface&MockObject $logger;

	protected function setUp():void {
		parent::setUp();

		$this->appName = 'calendar';
		$this->request = $this->createMock(IRequest::class);
		$this->manager = $this->createMock(IManager::class);
		$this->appManager = $this->createMock(IAppManager::class);
		$this->userManager = $this->createMock(IUserManager::class);
		$this->service = $this->createMock(ContactsService::class);
		$this->appConfig = $this->createMock(IAppConfig::class);
		$this->config = $this->createMock(IConfig::class);
		$this->groupManager = $this->createMock(IGroupManager::class);
		$this->logger = $this->createMock(NullLogger::class);
		$this->controller = new ContactController($this->appName,
			$this->request,
			$this->manager,
			$this->appManager,
			$this->userManager,
			$this->service,
			$this->appConfig,
			$this->config,
			$this->groupManager,
			$this->logger,
			'test-user',
		);
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
		$user1 = [
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
		];
		$user2 = [
			'FN' => 'Person 2',
			'EMAIL' => 'foo3@example.com',
		];
		$user3 = [
			'ADR' => [
				'ABC Street 2;01337 Village;;Germany',
			],
			'LANG' => 'en_us',
			'TZ' => 'Australia/Adelaide',
			'PHOTO' => 'VALUE:BINARY:4242424242'
		];
		$user4 = [
			'isLocalSystemBook' => true,
			'FN' => 'Person 3',
			'ADR' => [
				'ABC Street 2;01337 Village;;Germany',
			],
			'LANG' => 'en_us',
			'TZ' => 'Australia/Adelaide',
			'PHOTO' => 'VALUE:BINARY:4242424242'
		];

		$this->manager->expects(self::once())
			->method('isEnabled')
			->willReturn(true);
		$this->service
			->method('isSystemBook')
			->willReturnMap([
				[$user1, false],
				[$user2, false],
				[$user3, false],
				[$user4, true],
			]);
		$this->service
			->method('getNameFromContact')
			->willReturnMap([
				[$user1, 'Person 1'],
				[$user3, ''],
			]);
		$this->service->method('getPhotoUri')
			->willReturnMap([
				[$user1, 'http://foo.bar'],
				[$user3, null]
			]);
		$this->service->method('getAddress')
			->willReturnMap([
				[$user1, [
					"33 42nd Street\nRandom Town\nSome State\nUnited States",
					"5 Random Ave\n12782 Some big city\nYet another state\nUnited States",
				]],
				[$user3, [
					"ABC Street 2\n01337 Village\nGermany",
				]],
			]);
		$this->manager->expects(self::once())
			->method('search')
			->with('search 123', ['FN', 'ADR'], ['enumeration' => false])
			->willReturn([
				$user1,
				$user2,
				$user3,
				$user4,
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

	public function testGetGroupMembersNoResults() {
		$this->manager->expects(self::once())
			->method('isEnabled')
			->willReturn(true);

		$groupname = 'groupname';
		$this->manager->expects(self::once())
			->method('search')
			->with($groupname, ['CATEGORIES'])
			->willReturn([]);

		$this->controller->getContactGroupMembers($groupname);
	}

	public function testGetGroupMembers() {
		$this->manager->expects(self::once())
			->method('isEnabled')
			->willReturn(true);
		$this->service->expects(self::once())
			->method('hasEmail')
			->willReturn(true);
		$this->service->expects(self::once())
			->method('getNameFromContact')
			->willReturn('Person 1');
		$this->service->expects(self::once())
			->method('getLanguageId')
			->willReturn('en_us');
		$this->service->expects(self::once())
			->method('getTimezoneId')
			->willReturn('Australia/Adelaide');
		$this->service->expects(self::once())
			->method('getEmail')
			->willReturn(['foo1@example.com']);

		$groupname = 'group';
		$this->manager->expects(self::once())
			->method('search')
			->with($groupname, ['CATEGORIES'])
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
					'PHOTO' => 'VALUE=uri:http://foo.bar',
					'CATEGORIES' => 'groupname,group',
				],
				[
					'FN' => 'Person 2',
					'EMAIL' => 'foo3@example.com',
					'CATEGORIES' => 'groups,asecondgroup',
				],
				[
					'ADR' => [
						'ABC Street 2;01337 Village;;Germany',
					],
					'LANG' => 'en_us',
					'TZ' => 'Australia/Adelaide',
					'PHOTO' => 'VALUE:BINARY:4242424242',
					'CATEGORIES' => 'agroupthatswrong,asecondgroup',
				],
				[
					'isLocalSystemBook' => true,
					'FN' => 'Person 3',
					'ADR' => [
						'ABC Street 2;01337 Village;;Germany',
					],
					'EMAIL' => 'foo4@example.com',
					'LANG' => 'en_us',
					'TZ' => 'Australia/Adelaide',
					'PHOTO' => 'VALUE:BINARY:4242424242',
					'CATEGORIES' => 'groupppppp',
				],
			]);

		$groupmembers = $this->controller->getContactGroupMembers($groupname);
		$this->assertCount(1, $groupmembers->getData());
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
		$user1 = [
			'FN' => 'Person 1',
			'EMAIL' => ['foo1@example.com', 'foo2@example.com'],
			'LANG' => 'de',
			'TZ' => 'Europe/Berlin',
			'PHOTO' => 'VALUE=uri:http://foo.bar'
		];
		$systemUser = [
			'UID' => 'system-user',
			'isLocalSystemBook' => true,
			'FN' => 'System User',
			'EMAIL' => ['system@example.com'],
			'LANG' => 'en',
			'TZ' => 'UTC',
		];

		$this->manager->expects(self::once())
			->method('isEnabled')
			->willReturn(true);

		$this->appConfig->expects(self::once())
			->method('getValueBool')
			->with('dav', 'caldav_external_attendees_disabled', false)
			->willReturn(false);

		// Enumeration enabled, no group restrictions
		$this->config->expects(self::exactly(6))
			->method('getAppValue')
			->willReturnMap([
				['core', 'shareapi_only_share_with_group_members', 'no', 'no'],
				['core', 'shareapi_allow_share_dialog_user_enumeration', 'no', 'yes'],
				['core', 'shareapi_restrict_user_enumeration_to_group', 'no', 'no'],
				['core', 'shareapi_restrict_user_enumeration_full_match', 'yes', 'yes'],
				['core', 'shareapi_restrict_user_enumeration_full_match_userid', 'yes', 'yes'],
				['core', 'shareapi_restrict_user_enumeration_full_match_email', 'yes', 'yes'],
			]);

		$this->service
			->method('hasEmail')
			->willReturn(true);
		$this->service
			->method('isSystemBook')
			->willReturnMap([
				[$user1, false],
				[$systemUser, true],
			]);
		$this->service
			->method('getNameFromContact')
			->willReturnMap([
				[$user1, 'Person 1'],
				[$systemUser, 'System User'],
			]);
		$this->service
			->method('getLanguageId')
			->willReturnMap([
				[$user1, 'de'],
				[$systemUser, 'en'],
			]);
		$this->service
			->method('getTimezoneId')
			->willReturnMap([
				[$user1, 'Europe/Berlin'],
				[$systemUser, 'UTC'],
			]);
		$this->service
			->method('getEmail')
			->willReturnMap([
				[$user1, ['foo1@example.com', 'foo2@example.com']],
				[$systemUser, ['system@example.com']],
			]);
		$this->service->method('getPhotoUri')
			->willReturnMap([
				[$user1, 'http://foo.bar'],
				[$systemUser, null],
			]);

		$this->manager->expects(self::exactly(2))
			->method('search')
			->willReturnMap([
				['search', ['UID', 'FN', 'EMAIL'], ['enumeration' => true, 'fullmatch' => true], [$user1, $systemUser]],
				['search', ['CATEGORIES'], [], []]
			]);

		$response = $this->controller->searchAttendee('search');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$data = $response->getData();
		$this->assertCount(2, $data);
		$this->assertEquals('Person 1', $data[0]['name']);
		$this->assertEquals('System User', $data[1]['name']);
		$this->assertEquals(200, $response->getStatus());
	}

	public function testSearchAttendeeExternalAttendeesDisabled():void {
		$user1 = [
			'FN' => 'Person 1',
			'EMAIL' => [
				'foo1@example.com',
				'foo2@example.com',
			],
			'LANG' => 'de',
			'TZ' => 'Europe/Berlin',
			'PHOTO' => 'VALUE=uri:http://foo.bar'
		];
		$user2 = [
			'FN' => 'Person 2',
			'EMAIL' => 'foo3@example.com',
		];
		$user3 = [
			'UID' => 'system-user',
			'isLocalSystemBook' => true,
			'FN' => 'System User',
			'EMAIL' => 'system@example.com',
			'LANG' => 'en',
			'TZ' => 'UTC',
		];

		$this->manager->expects(self::once())
			->method('isEnabled')
			->willReturn(true);

		$this->appConfig->expects(self::once())
			->method('getValueBool')
			->with('dav', 'caldav_external_attendees_disabled', false)
			->willReturn(true);

		$this->config->expects(self::exactly(6))
			->method('getAppValue')
			->willReturnMap([
				['core', 'shareapi_only_share_with_group_members', 'no', 'no'],
				['core', 'shareapi_allow_share_dialog_user_enumeration', 'no', 'yes'],
				['core', 'shareapi_restrict_user_enumeration_to_group', 'no', 'no'],
				['core', 'shareapi_restrict_user_enumeration_full_match', 'yes', 'yes'],
				['core', 'shareapi_restrict_user_enumeration_full_match_userid', 'yes', 'yes'],
				['core', 'shareapi_restrict_user_enumeration_full_match_email', 'yes', 'yes'],
			]);

		$this->service
			->method('hasEmail')
			->willReturnMap([
				[$user1, true],
				[$user2, true],
				[$user3, true],
			]);
		$this->service
			->method('isSystemBook')
			->willReturnMap([
				[$user1, false],
				[$user2, false],
				[$user3, true],
			]);
		$this->service
			->method('getNameFromContact')
			->willReturnMap([
				[$user3, 'System User'],
			]);
		$this->service->expects(self::once())
			->method('getLanguageId')
			->with($user3)
			->willReturn('en');
		$this->service->expects(self::once())
			->method('getTimezoneId')
			->with($user3)
			->willReturn('UTC');
		$this->service->expects(self::once())
			->method('getEmail')
			->with($user3)
			->willReturn(['system@example.com']);
		$this->service->expects(self::once())
			->method('getPhotoUri')
			->with($user3)
			->willReturn(null);

		$this->manager->expects(self::once())
			->method('search')
			->with('search 123', ['UID', 'FN', 'EMAIL'], ['enumeration' => true, 'fullmatch' => true])
			->willReturn([$user1, $user2, $user3]);

		$response = $this->controller->searchAttendee('search 123');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$this->assertEquals([
			[
				'name' => 'System User',
				'emails' => ['system@example.com'],
				'lang' => 'en',
				'tzid' => 'UTC',
				'photo' => null,
				'type' => 'individual'
			]
		], $response->getData());
		$this->assertEquals(200, $response->getStatus());
	}

	public function testSearchAttendeeShareWithGroupOnlyExcludesConfiguredGroups(): void {
		$externalContact = [
			'FN' => 'External Person',
			'EMAIL' => ['external@example.com'],
			'LANG' => 'de',
			'TZ' => 'Europe/Berlin',
		];
		$allowedSystemUser = [
			'UID' => 'allowed-system-user',
			'isLocalSystemBook' => true,
			'FN' => 'Allowed System User',
			'EMAIL' => ['allowed@example.com'],
			'LANG' => 'en',
			'TZ' => 'UTC',
		];
		$excludedSystemUser = [
			'UID' => 'excluded-system-user',
			'isLocalSystemBook' => true,
			'FN' => 'Excluded System User',
			'EMAIL' => ['excluded@example.com'],
			'LANG' => 'en',
			'TZ' => 'UTC',
		];
		$user = $this->createMock(IUser::class);

		$this->manager->expects(self::once())
			->method('isEnabled')
			->willReturn(true);

		$this->appConfig->expects(self::once())
			->method('getValueBool')
			->with('dav', 'caldav_external_attendees_disabled', false)
			->willReturn(false);

		$this->config->expects(self::exactly(7))
			->method('getAppValue')
			->willReturnMap([
				['core', 'shareapi_only_share_with_group_members', 'no', 'yes'],
				['core', 'shareapi_only_share_with_group_members_exclude_group_list', '[]', '["excluded-group"]'],
				['core', 'shareapi_allow_share_dialog_user_enumeration', 'no', 'yes'],
				['core', 'shareapi_restrict_user_enumeration_to_group', 'no', 'no'],
				['core', 'shareapi_restrict_user_enumeration_full_match', 'yes', 'yes'],
				['core', 'shareapi_restrict_user_enumeration_full_match_userid', 'yes', 'yes'],
				['core', 'shareapi_restrict_user_enumeration_full_match_email', 'yes', 'yes'],
			]);

		$this->userManager->expects(self::once())
			->method('get')
			->with('test-user')
			->willReturn($user);

		$this->groupManager->expects(self::once())
			->method('getUserGroupIds')
			->with($user)
			->willReturn(['allowed-group', 'excluded-group']);

		$this->groupManager->expects(self::never())
			->method('isInGroup')
		;

		$this->service->method('hasEmail')->willReturn(true);
		$this->service->method('isSystemBook')
			->willReturnMap([
				[$externalContact, false],
				[$allowedSystemUser, true],
				[$excludedSystemUser, true],
			]);
		$this->service->method('getNameFromContact')
			->willReturnMap([
				[$externalContact, 'External Person'],
				[$allowedSystemUser, 'Allowed System User'],
				[$excludedSystemUser, 'Excluded System User'],
			]);
		$this->service->method('getLanguageId')
			->willReturnMap([
				[$externalContact, 'de'],
				[$allowedSystemUser, 'en'],
				[$excludedSystemUser, 'en'],
			]);
		$this->service->method('getTimezoneId')
			->willReturnMap([
				[$externalContact, 'Europe/Berlin'],
				[$allowedSystemUser, 'UTC'],
				[$excludedSystemUser, 'UTC'],
			]);
		$this->service->method('getEmail')
			->willReturnMap([
				[$externalContact, ['external@example.com']],
				[$allowedSystemUser, ['allowed@example.com']],
				[$excludedSystemUser, ['excluded@example.com']],
			]);
		$this->service->method('getPhotoUri')->willReturn(null);

		$this->manager->expects(self::exactly(2))
			->method('search')
			->willReturnMap([
				['search', ['UID', 'FN', 'EMAIL'], ['enumeration' => true, 'fullmatch' => true], [$externalContact, $allowedSystemUser, $excludedSystemUser]],
				['search', ['CATEGORIES'], [], []],
			]);

		$response = $this->controller->searchAttendee('search');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$this->assertEquals([
			[
				'name' => 'External Person',
				'emails' => ['external@example.com'],
				'lang' => 'de',
				'tzid' => 'Europe/Berlin',
				'photo' => null,
				'type' => 'individual',
			],
			[
				'name' => 'Allowed System User',
				'emails' => ['allowed@example.com'],
				'lang' => 'en',
				'tzid' => 'UTC',
				'photo' => null,
				'type' => 'individual',
			],
			[
				'name' => 'Excluded System User',
				'emails' => ['excluded@example.com'],
				'lang' => 'en',
				'tzid' => 'UTC',
				'photo' => null,
				'type' => 'individual',
			],
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
		$user1 = [
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
		];
		$user2 = [
			'FN' => 'Person 2',
			'EMAIL' => 'foo3@example.com',
			'PHOTO' => 'VALUE=uri:http://foo.bar'
		];
		$user3 = [
			'ADR' => [
				'ABC Street 2;01337 Village;;Germany',
			],
			'LANG' => 'en_us',
			'TZ' => 'Australia/Adelaide',
			'PHOTO' => 'VALUE:BINARY:4242424242'
		];
		$user4 = [
			'isLocalSystemBook' => true,
			'FN' => 'Person 3',
			'ADR' => [
				'ABC Street 2;01337 Village;;Germany',
			],
			'EMAIL' => 'foo5@example.com',
			'LANG' => 'en_us',
			'TZ' => 'Australia/Adelaide',
			'PHOTO' => 'VALUE=uri:http://foo456.bar'
		];

		$this->manager->expects(self::once())
			->method('isEnabled')
			->willReturn(true);
		$this->service->method('hasEmail')->willReturnMap([
			[$user1, true],
			[$user2, true],
			[$user3, false],
			[$user3, true],
		]);
		$this->service->method('isSystemBook');
		$this->service->method('getEmail')
			->willReturnMap([
				[$user1, [
					'foo1@example.com',
					'foo2@example.com',
				]
				],
				[$user2, ['foo3@example.com']],
				[$user3, ['foo5@example.com']],
			]);
		$this->service->method('getNameFromContact')->willReturn('Person 2');
		$this->service->method('getPhotoUri')->willReturn('http://foo.bar');
		$this->manager->expects(self::once())
			->method('search')
			->with('foo3@example.com', ['EMAIL'])
			->willReturn([
				$user1,
				$user2,
				$user3,
				$user4,
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
