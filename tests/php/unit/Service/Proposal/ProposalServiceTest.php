<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Service\Proposal;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OC\Calendar\Manager;
use OCA\Calendar\Db\ProposalDateEntry;
use OCA\Calendar\Db\ProposalDateMapper;
use OCA\Calendar\Db\ProposalDetailsEntry;
use OCA\Calendar\Db\ProposalMapper;
use OCA\Calendar\Db\ProposalParticipantEntry;
use OCA\Calendar\Db\ProposalParticipantMapper;
use OCA\Calendar\Db\ProposalVoteEntry;
use OCA\Calendar\Db\ProposalVoteMapper;
use OCA\Calendar\Objects\Proposal\ProposalDateObject;
use OCA\Calendar\Objects\Proposal\ProposalDateVote;
use OCA\Calendar\Objects\Proposal\ProposalObject;
use OCA\Calendar\Objects\Proposal\ProposalParticipantAttendance;
use OCA\Calendar\Objects\Proposal\ProposalParticipantObject;
use OCA\Calendar\Objects\Proposal\ProposalParticipantRealm;
use OCA\Calendar\Objects\Proposal\ProposalParticipantStatus;
use OCA\Calendar\Objects\Proposal\ProposalResponseDateCollection;
use OCA\Calendar\Objects\Proposal\ProposalResponseObject;
use OCA\Calendar\Objects\Proposal\ProposalVoteCollection;
use OCA\Calendar\Objects\Proposal\ProposalVoteObject;
use OCP\Calendar\IManager;
use OCP\IAppConfig;
use OCP\IL10N;
use OCP\IURLGenerator;
use OCP\IUser;
use OCP\IUserManager;
use OCP\Mail\IMailer;
use OCP\Mail\Provider\IManager as IMailManager;
use PHPUnit\Framework\MockObject\MockObject;
use Psr\Log\LoggerInterface;

class ProposalServiceTest extends TestCase {

	protected IAppConfig|MockObject $appConfig;
	protected LoggerInterface|MockObject $logger;
	protected ProposalMapper|MockObject $proposalMapper;
	protected ProposalParticipantMapper|MockObject $proposalParticipantMapper;
	protected ProposalDateMapper|MockObject $proposalDateMapper;
	protected ProposalVoteMapper|MockObject $proposalVoteMapper;
	protected IL10N|MockObject $l10n;
	protected IURLGenerator|MockObject $urlGenerator;
	protected IUserManager|MockObject $userManager;
	protected IMailer|MockObject $systemMailManager;
	protected IMailManager|MockObject $userMailManager;
	protected IManager|MockObject $calendarManager;
	protected ProposalService $service;
	protected IUser|MockObject $user;

	protected function setUp(): void {
		parent::setUp();

		$this->appConfig = $this->createMock(IAppConfig::class);
		$this->logger = $this->createMock(LoggerInterface::class);
		$this->proposalMapper = $this->createMock(ProposalMapper::class);
		$this->proposalParticipantMapper = $this->createMock(ProposalParticipantMapper::class);
		$this->proposalDateMapper = $this->createMock(ProposalDateMapper::class);
		$this->proposalVoteMapper = $this->createMock(ProposalVoteMapper::class);
		$this->l10n = $this->createMock(IL10N::class);
		$this->urlGenerator = $this->createMock(IURLGenerator::class);
		$this->userManager = $this->createMock(IUserManager::class);
		$this->systemMailManager = $this->createMock(IMailer::class);
		$this->userMailManager = $this->createMock(IMailManager::class);
		$this->calendarManager = $this->createMock(Manager::class);
		$this->user = $this->createMock(IUser::class);

		$this->user->method('getUID')->willReturn('testuser');
		$this->user->method('getEMailAddress')->willReturn('test@example.com');
		$this->user->method('getDisplayName')->willReturn('Test User');

		$this->service = new ProposalService(
			$this->appConfig,
			$this->logger,
			$this->proposalMapper,
			$this->proposalParticipantMapper,
			$this->proposalDateMapper,
			$this->proposalVoteMapper,
			$this->l10n,
			$this->urlGenerator,
			$this->userManager,
			$this->systemMailManager,
			$this->userMailManager,
			$this->calendarManager
		);
	}

	public function testListProposalsSuccess(): void {
		$proposalEntries = [
			$this->createProposalEntry(1, 'Test Proposal 1'),
			$this->createProposalEntry(2, 'Test Proposal 2'),
		];

		$this->proposalMapper->expects($this->once())
			->method('fetchByUserId')
			->with('testuser')
			->willReturn($proposalEntries);

		$this->proposalParticipantMapper->expects($this->once())
			->method('fetchByUserId')
			->with('testuser')
			->willReturn([]);

		$this->proposalDateMapper->expects($this->once())
			->method('fetchByUserId')
			->with('testuser')
			->willReturn([]);

		$this->proposalVoteMapper->expects($this->once())
			->method('fetchByUserId')
			->with('testuser')
			->willReturn([]);

		$result = $this->service->listProposals($this->user);

		$this->assertIsArray($result);
		$this->assertCount(2, $result);
		$this->assertContainsOnlyInstancesOf(ProposalObject::class, $result);
	}

	public function testListProposalsEmpty(): void {
		$this->proposalMapper->expects($this->once())
			->method('fetchByUserId')
			->with('testuser')
			->willReturn([]);

		$this->proposalParticipantMapper->expects($this->once())
			->method('fetchByUserId')
			->with('testuser')
			->willReturn([]);

		$this->proposalDateMapper->expects($this->once())
			->method('fetchByUserId')
			->with('testuser')
			->willReturn([]);

		$this->proposalVoteMapper->expects($this->once())
			->method('fetchByUserId')
			->with('testuser')
			->willReturn([]);

		$result = $this->service->listProposals($this->user);

		$this->assertIsArray($result);
		$this->assertEmpty($result);
	}

	public function testFetchProposalSuccess(): void {
		$proposalEntry = $this->createProposalEntry(1, 'Test Proposal');

		$this->proposalMapper->expects($this->once())
			->method('fetchById')
			->with('testuser', 1)
			->willReturn($proposalEntry);

		$this->proposalParticipantMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		$this->proposalDateMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		$this->proposalVoteMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		$result = $this->service->fetchProposal($this->user, 1);

		$this->assertInstanceOf(ProposalObject::class, $result);
	}

	public function testFetchProposalNotFound(): void {
		$this->proposalMapper->expects($this->once())
			->method('fetchById')
			->with('testuser', 999)
			->willReturn(null);

		$this->proposalParticipantMapper->expects($this->never())
			->method('fetchByProposalId');

		$result = $this->service->fetchProposal($this->user, 999);

		$this->assertNull($result);
	}

	public function testFetchByTokenSuccess(): void {
		$participantEntry = $this->createParticipantEntry(1, 1, 'test@example.com', 'token123');
		$proposalEntry = $this->createProposalEntry(1, 'Test Proposal');

		$this->proposalParticipantMapper->expects($this->once())
			->method('fetchByToken')
			->with('token123')
			->willReturn($participantEntry);

		$this->userManager->expects($this->once())
			->method('get')
			->with('testuser')
			->willReturn($this->user);

		$this->proposalMapper->expects($this->once())
			->method('fetchById')
			->with('testuser', 1)
			->willReturn($proposalEntry);

		$this->proposalParticipantMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		$this->proposalDateMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		$this->proposalVoteMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		$result = $this->service->fetchByToken('token123');

		$this->assertInstanceOf(ProposalObject::class, $result);
	}

	public function testFetchByTokenNotFound(): void {
		$this->proposalParticipantMapper->expects($this->once())
			->method('fetchByToken')
			->with('invalid_token')
			->willReturn(null);

		$this->userManager->expects($this->never())
			->method('get');

		$result = $this->service->fetchByToken('invalid_token');

		$this->assertNull($result);
	}

	public function testCreateProposalSuccess(): void {
		$proposal = $this->createProposal(null, 'New Proposal'); // New proposal with null ID

		$proposalEntry = $this->createProposalEntry(1, 'New Proposal');

		$this->proposalMapper->expects($this->once())
			->method('insert')
			->willReturn($proposalEntry);

		// Mock the fetch for returning created proposal
		$this->proposalMapper->expects($this->once())
			->method('fetchById')
			->with('testuser', 1)
			->willReturn($proposalEntry);

		$this->proposalParticipantMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		$this->proposalDateMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		$this->proposalVoteMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		// Mock calendar manager for syncCalendarBlockers
		$calendar = $this->createMock(\OCP\Calendar\ICreateFromString::class);
		$calendar->expects($this->any())->method('isDeleted')->willReturn(false);
		$calendar->expects($this->any())->method('getUri')->willReturn('test-calendar-uri');
		$calendar->expects($this->any())->method('search')->willReturn([]);
		$this->calendarManager->expects($this->any())->method('getPrimaryCalendar')->willReturn($calendar);
		$this->calendarManager->expects($this->any())->method('getCalendarsForPrincipal')->willReturn([$calendar]);

		$result = $this->service->createProposal($this->user, $proposal);

		$this->assertInstanceOf(ProposalObject::class, $result);
	}

	public function testCreateProposalWithExistingId(): void {
		$proposal = $this->createProposal(1, 'Existing Proposal'); // Existing proposal

		$this->expectException(\InvalidArgumentException::class);
		$this->expectExceptionMessage('Proposal identifier must be null for a new proposal');

		$this->service->createProposal($this->user, $proposal);
	}

	public function testModifyProposalSuccess(): void {
		$proposal = $this->createProposal(1, 'Modified Proposal');

		$currentProposalEntry = $this->createProposalEntry(1, 'Current Proposal');
		$mutatedProposalEntry = $this->createProposalEntry(1, 'Modified Proposal');

		// Mock the current proposal fetch
		$this->proposalMapper->expects($this->exactly(2))
			->method('fetchById')
			->with('testuser', 1)
			->willReturnOnConsecutiveCalls($currentProposalEntry, $mutatedProposalEntry);

		$this->proposalParticipantMapper->expects($this->exactly(2))
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		$this->proposalDateMapper->expects($this->exactly(2))
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		$this->proposalVoteMapper->expects($this->exactly(2))
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		$this->proposalMapper->expects($this->once())
			->method('update');

		// Mock calendar manager for syncCalendarBlockers
		$calendar = $this->createMock(\OCP\Calendar\ICreateFromString::class);
		$calendar->expects($this->any())->method('isDeleted')->willReturn(false);
		$calendar->expects($this->any())->method('getUri')->willReturn('test-calendar-uri');
		$calendar->expects($this->any())->method('search')->willReturn([]);
		$this->calendarManager->expects($this->any())->method('getPrimaryCalendar')->willReturn($calendar);
		$this->calendarManager->expects($this->any())->method('getCalendarsForPrincipal')->willReturn([$calendar]);

		$result = $this->service->modifyProposal($this->user, $proposal);

		$this->assertInstanceOf(ProposalObject::class, $result);
	}

	public function testModifyProposalWithNullId(): void {
		$proposal = $this->createProposal(null, 'Proposal Without ID');

		$this->expectException(\InvalidArgumentException::class);
		$this->expectExceptionMessage('Proposal identifier cannot be null for modification');

		$this->service->modifyProposal($this->user, $proposal);
	}

	public function testModifyProposalNotFound(): void {
		$proposal = $this->createProposal(999, 'Non-existent Proposal');

		$this->proposalMapper->expects($this->once())
			->method('fetchById')
			->with('testuser', 999)
			->willReturn(null);

		$this->expectException(\InvalidArgumentException::class);
		$this->expectExceptionMessage('Proposal not found for identifier: 999');

		$this->service->modifyProposal($this->user, $proposal);
	}

	public function testDestroyProposalSuccess(): void {
		$proposalEntry = $this->createProposalEntry(1, 'Test Proposal');

		$this->proposalMapper->expects($this->once())
			->method('fetchById')
			->with('testuser', 1)
			->willReturn($proposalEntry);

		$this->proposalParticipantMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		$this->proposalDateMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		$this->proposalVoteMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		// Expect deletion calls
		$this->proposalVoteMapper->expects($this->once())
			->method('deleteByProposalId')
			->with('testuser', 1);

		$this->proposalParticipantMapper->expects($this->once())
			->method('deleteByProposalId')
			->with('testuser', 1);

		$this->proposalDateMapper->expects($this->once())
			->method('deleteByProposalId')
			->with('testuser', 1);

		$this->proposalMapper->expects($this->once())
			->method('deleteById')
			->with('testuser', 1);

		// Mock calendar manager for syncCalendarBlockers
		$calendar = $this->createMock(\OCP\Calendar\ICreateFromString::class);
		$calendar->expects($this->any())->method('isDeleted')->willReturn(false);
		$calendar->expects($this->any())->method('getUri')->willReturn('test-calendar-uri');
		$calendar->expects($this->any())->method('search')->willReturn([]);
		$this->calendarManager->expects($this->any())->method('getPrimaryCalendar')->willReturn($calendar);
		$this->calendarManager->expects($this->any())->method('getCalendarsForPrincipal')->willReturn([$calendar]);

		$this->service->destroyProposal($this->user, 1);
	}

	public function testDestroyProposalNotFound(): void {
		$this->proposalMapper->expects($this->once())
			->method('fetchById')
			->with('testuser', 999)
			->willReturn(null);

		$this->expectException(\InvalidArgumentException::class);
		$this->expectExceptionMessage('Proposal not found');

		$this->service->destroyProposal($this->user, 999);
	}

	public function testDeleteProposalsByUser(): void {
		$this->proposalVoteMapper->expects($this->once())
			->method('deleteByUserId')
			->with('testuser');

		$this->proposalParticipantMapper->expects($this->once())
			->method('deleteByUserId')
			->with('testuser');

		$this->proposalDateMapper->expects($this->once())
			->method('deleteByUserId')
			->with('testuser');

		$this->proposalMapper->expects($this->once())
			->method('deleteByUserId')
			->with('testuser');

		$this->service->deleteProposalsByUser('testuser');
	}

	public function testStoreResponseSuccess(): void {
		$response = $this->createProposalResponse('token123');
		$participantEntry = $this->createParticipantEntry(1, 1, 'test@example.com', 'token123');
		$proposalEntry = $this->createProposalEntry(1, 'Test Proposal');

		$this->proposalParticipantMapper->expects($this->once())
			->method('fetchByToken')
			->with('token123')
			->willReturn($participantEntry);

		$this->proposalMapper->expects($this->once())
			->method('fetchById')
			->with('testuser', 1)
			->willReturn($proposalEntry);

		$this->proposalDateMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		$this->proposalVoteMapper->expects($this->once())
			->method('deleteByParticipantId')
			->with('testuser', 1);

		$this->proposalParticipantMapper->expects($this->once())
			->method('update')
			->with($participantEntry);

		$this->service->storeResponse($response);
	}

	public function testStoreResponseInvalidToken(): void {
		$response = $this->createProposalResponse('invalid_token');

		$this->proposalParticipantMapper->expects($this->once())
			->method('fetchByToken')
			->with('invalid_token')
			->willReturn(null);

		$this->expectException(\InvalidArgumentException::class);
		$this->expectExceptionMessage('Participant not found for token: invalid_token');

		$this->service->storeResponse($response);
	}

	public function testConvertProposalSuccess(): void {
		// mock objects
		// proposal entry
		$proposalEntry = $this->createProposalEntry(1, 'Convert Proposal');
		$proposalEntry->setDuration(60);
		$proposalEntry->setUuid('uuid-123');
		// date entry
		$dateEntry = new ProposalDateEntry();
		$dateEntry->setId(10);
		$dateEntry->setPid(1);
		$dateEntry->setUid('testuser');
		$dateEntry->setDate((new \DateTimeImmutable('+1 day'))->getTimestamp());
		// participant entry
		$participantEntry = new ProposalParticipantEntry();
		$participantEntry->setId(20);
		$participantEntry->setPid(1);
		$participantEntry->setUid('testuser');
		$participantEntry->setName('Alice');
		$participantEntry->setAddress('alice@example.com');
		$participantEntry->setAttendance('R');
		$participantEntry->setStatus('P');
		$participantEntry->setRealm('I');
		$participantEntry->setToken('tok20');
		// vote entry
		$voteEntry = new ProposalVoteEntry();
		$voteEntry->setId(30);
		$voteEntry->setUid('testuser');
		$voteEntry->setPid(1);
		$voteEntry->setParticipantId(20);
		$voteEntry->setDateId(10);
		$voteEntry->setVote('Y');

		// mock methods
		// user
		$this->user->method('getEMailAddress')->willReturn('organizer@example.com');
		$this->user->method('getDisplayName')->willReturn('Organizer');
		// mappers
		$this->proposalMapper->expects($this->once())
			->method('fetchById')
			->with('testuser', 1)
			->willReturn($proposalEntry);
		$this->proposalParticipantMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([$participantEntry]);
		$this->proposalDateMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([$dateEntry]);
		$this->proposalVoteMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([$voteEntry]);
		// calendar manager
		$calendar = $this->createMock(\OCP\Calendar\ICalendar::class);
		if (interface_exists(\OCP\Calendar\ICreateFromString::class)) {
			$calendar = $this->createMock(\OCP\Calendar\ICreateFromString::class);
			$calendar->method('isDeleted')->willReturn(false);
			$calendar->expects($this->once())
				->method('createFromString')
				->with($this->callback(fn ($name) => str_ends_with($name, '.ics')),
					$this->callback(fn ($data) => str_contains($data, 'SUMMARY:Convert Proposal')));
		}
		$this->calendarManager->method('getPrimaryCalendar')->with('testuser')->willReturn($calendar);

		// expectations
		$this->proposalVoteMapper->expects($this->once())
			->method('deleteByProposalId')
			->with('testuser', 1);
		$this->proposalParticipantMapper->expects($this->once())
			->method('deleteByProposalId')
			->with('testuser', 1);
		$this->proposalDateMapper->expects($this->once())
			->method('deleteByProposalId')
			->with('testuser', 1);
		$this->proposalMapper->expects($this->once())
			->method('deleteById')
			->with('testuser', 1);

		// test and assertions
		$this->service->convertProposal($this->user, 1, 10, ['attendancePreset' => true]);
		$this->addToAssertionCount(1); // If we reached this point, the test is successfully completed
	}

	public function testConvertProposalDateNotFound(): void {
		// mock objects
		// proposal entry
		$proposalEntry = $this->createProposalEntry(1, 'Convert Proposal');

		// mock methods
		// mappers
		$this->proposalMapper->expects($this->once())
			->method('fetchById')
			->with('testuser', 1)
			->willReturn($proposalEntry);
		$this->proposalParticipantMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);
		$this->proposalDateMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);
		$this->proposalVoteMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		// test and assertions
		$this->expectException(\InvalidArgumentException::class);
		$this->expectExceptionMessage('Date not found for proposal');
		$this->service->convertProposal($this->user, 1, 999);
	}

	public function testConvertProposalCalendarNotFound(): void {
		// mock objects
		// proposal entry
		$proposalEntry = $this->createProposalEntry(1, 'Convert Proposal');
		$proposalEntry->setDuration(30);
		// date entry
		$dateEntry = new \OCA\Calendar\Db\ProposalDateEntry();
		$dateEntry->setId(10);
		$dateEntry->setPid(1);
		$dateEntry->setUid('testuser');
		$dateEntry->setDate((new \DateTimeImmutable('+1 day'))->getTimestamp());

		// mock methods
		// mappers
		$this->proposalMapper->expects($this->once())
			->method('fetchById')
			->with('testuser', 1)
			->willReturn($proposalEntry);
		$this->proposalParticipantMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);
		$this->proposalDateMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([$dateEntry]);
		$this->proposalVoteMapper->expects($this->once())
			->method('fetchByProposalId')
			->with('testuser', 1)
			->willReturn([]);

		// mock methods
		// calendar manager
		$this->calendarManager->expects($this->once())
			->method('getPrimaryCalendar')
			->with('testuser')
			->willReturn(null);
		$this->calendarManager->expects($this->once())
			->method('getCalendarsForPrincipal')
			->with('principals/users/testuser')
			->willReturn([]);

		// test and assertions
		$this->expectException(\RuntimeException::class);
		$this->expectExceptionMessage('Could not find a useable calendar');
		$this->service->convertProposal($this->user, 1, 10);
	}

	public function testConvertProposalAttendeeAttendanceMapping(): void {
		// mock objects
		// date object
		$dateObj = new ProposalDateObject();
		$dateObj->setId(10);
		$dateObj->setDate(new \DateTimeImmutable('+1 day'));
		// participant object
		$participantObj = new ProposalParticipantObject();
		$participantObj->setId(20);
		$participantObj->setName('Alice');
		$participantObj->setAddress('alice@example.com');
		$participantObj->setAttendance(ProposalParticipantAttendance::Required);
		$participantObj->setStatus(ProposalParticipantStatus::Pending);
		$participantObj->setRealm(ProposalParticipantRealm::Internal);
		// votes collection
		$votes = new ProposalVoteCollection();
		$voteYes = new ProposalVoteObject();
		$voteYes->setDateId(10);
		$voteYes->setParticipantId(20);
		$voteYes->setVote(ProposalDateVote::Yes);
		$votes->append($voteYes);

		// test and assertions
		// Test mapping with YES vote
		$this->assertSame('ACCEPTED', $this->service->convertProposalAttendeeAttendance($dateObj, $participantObj, $votes));
		// test mapping with NO vote
		$voteYes->setVote(ProposalDateVote::No);
		$this->assertSame('DECLINED', $this->service->convertProposalAttendeeAttendance($dateObj, $participantObj, $votes));
		// test mapping with MAYBE vote
		$voteYes->setVote(ProposalDateVote::Maybe);
		$this->assertSame('TENTATIVE', $this->service->convertProposalAttendeeAttendance($dateObj, $participantObj, $votes));
		// test mapping with no vote
		$votes = new ProposalVoteCollection();
		$this->assertSame('NEEDS-ACTION', $this->service->convertProposalAttendeeAttendance($dateObj, $participantObj, $votes));
	}

	private function createProposalEntry(int $id, string $title): ProposalDetailsEntry {
		$entry = new ProposalDetailsEntry();
		$entry->setId($id);
		$entry->setTitle($title);
		$entry->setUid('testuser');
		return $entry;
	}

	private function createParticipantEntry(int $id, int $pid, string $address, string $token): ProposalParticipantEntry {
		$entry = new ProposalParticipantEntry();
		$entry->setId($id);
		$entry->setPid($pid);
		$entry->setAddress($address);
		$entry->setToken($token);
		$entry->setUid('testuser');
		return $entry;
	}

	private function createProposal(?int $id = null, ?string $title = 'Test Proposal'): ProposalObject {
		$proposal = new ProposalObject();
		$proposal->setId($id);
		$proposal->setTitle($title);
		$proposal->setUid('testuser');
		$proposal->setDescription('Test Description');
		$proposal->setLocation('Test Location');
		$proposal->setDuration(3600); // 1 hour
		return $proposal;
	}

	private function createProposalResponse(string $token = 'token123'): ProposalResponseObject {
		$response = new ProposalResponseObject();
		$response->setToken($token);
		$response->setDates(new ProposalResponseDateCollection());
		return $response;
	}
}
