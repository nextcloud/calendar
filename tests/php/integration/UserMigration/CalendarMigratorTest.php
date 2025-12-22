<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Tests\Integration\UserMigration;

use ChristophWurst\Nextcloud\Testing\DatabaseTransaction;
use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\AppointmentConfigMapper;
use OCA\Calendar\Db\ProposalDateEntry;
use OCA\Calendar\Db\ProposalDateMapper;
use OCA\Calendar\Db\ProposalDetailsEntry;
use OCA\Calendar\Db\ProposalMapper;
use OCA\Calendar\Db\ProposalParticipantEntry;
use OCA\Calendar\Db\ProposalParticipantMapper;
use OCA\Calendar\Db\ProposalVoteEntry;
use OCA\Calendar\Db\ProposalVoteMapper;
use OCA\Calendar\UserMigration\Migrator;
use OCP\IUserManager;
use OCP\UserMigration\IExportDestination;
use OCP\UserMigration\IImportSource;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Uid\Uuid;

class CalendarMigratorTest extends TestCase {
	use DatabaseTransaction;

	private IUserManager $userManager;
	private Migrator $migrator;
	private AppointmentConfigMapper $appointmentConfigMapper;
	private ProposalMapper $proposalMapper;
	private ProposalDateMapper $proposalDateMapper;
	private ProposalParticipantMapper $proposalParticipantMapper;
	private ProposalVoteMapper $proposalVoteMapper;
	private OutputInterface $output;

	protected function setUp(): void {
		parent::setUp();

		$this->userManager = \OC::$server->get(IUserManager::class);
		$this->migrator = \OC::$server->get(Migrator::class);
		$this->appointmentConfigMapper = \OC::$server->get(AppointmentConfigMapper::class);
		$this->proposalMapper = \OC::$server->get(ProposalMapper::class);
		$this->proposalDateMapper = \OC::$server->get(ProposalDateMapper::class);
		$this->proposalParticipantMapper = \OC::$server->get(ProposalParticipantMapper::class);
		$this->proposalVoteMapper = \OC::$server->get(ProposalVoteMapper::class);
		$this->output = $this->createMock(OutputInterface::class);
	}

	public function testExportImportAppointmentConfigs(): void {
		$userId = 'test_user_' . time();
		$user = $this->userManager->createUser($userId, 'topsecretpassword');

		try {
			// Create test appointment config
			$config = new AppointmentConfig();
			$config->setToken('original-token-123');
			$config->setName('Test Appointment');
			$config->setDescription('Test Description');
			$config->setLocation('Test Location');
			$config->setVisibility(AppointmentConfig::VISIBILITY_PUBLIC);
			$config->setUserId($userId);
			$config->setTargetCalendarUri('personal');
			$config->setCalendarFreebusyUris(json_encode(['calendar1', 'calendar2']));
			$config->setAvailability(json_encode(['monday' => ['09:00-17:00']]));
			$config->setStart(null);
			$config->setEnd(null);
			$config->setLength(30);
			$config->setIncrement(15);
			$config->setPreparationDuration(5);
			$config->setFollowupDuration(10);
			$config->setTimeBeforeNextSlot(0);
			$config->setDailyMax(5);
			$config->setFutureLimit(60);
			$config->setCreateTalkRoom(true);

			$savedConfig = $this->appointmentConfigMapper->insert($config);

			// Export
			$exportDestination = $this->createMock(IExportDestination::class);
			$exportedData = [];
			$exportDestination->expects($this->atLeastOnce())
				->method('addFileContents')
				->willReturnCallback(function (string $path, string $content) use (&$exportedData) {
					$exportedData[$path] = $content;
				});

			$this->migrator->export($user, $exportDestination, $this->output);

			// Verify export
			$this->assertArrayHasKey('calendar/appointment_configs.json', $exportedData);
			$exportedConfigs = json_decode($exportedData['calendar/appointment_configs.json'], true);
			$this->assertCount(1, $exportedConfigs);
			$this->assertEquals('Test Appointment', $exportedConfigs[0]['name']);
			$this->assertEquals('Test Description', $exportedConfigs[0]['description']);
			$this->assertEquals('Test Location', $exportedConfigs[0]['location']);

			// Clean up for import test
			$this->appointmentConfigMapper->delete($savedConfig);

			// Import
			$importSource = $this->createMock(IImportSource::class);
			$importSource->expects($this->once())
				->method('getMigratorVersion')
				->willReturn(1);
			$importSource->expects($this->any())
				->method('getFileContents')
				->willReturnCallback(function (string $path) use ($exportedData) {
					if (!isset($exportedData[$path])) {
						throw new \Exception('File not found');
					}
					return $exportedData[$path];
				});

			$this->migrator->import($user, $importSource, $this->output);

			// Verify import
			$importedConfigs = $this->appointmentConfigMapper->findAllForUser($userId);
			$this->assertCount(1, $importedConfigs);

			$importedConfig = $importedConfigs[0];
			$this->assertEquals('Test Appointment', $importedConfig->getName());
			$this->assertEquals('Test Description', $importedConfig->getDescription());
			$this->assertEquals('Test Location', $importedConfig->getLocation());
			$this->assertEquals(AppointmentConfig::VISIBILITY_PUBLIC, $importedConfig->getVisibility());
			$this->assertEquals('personal', $importedConfig->getTargetCalendarUri());
			$this->assertEquals(30, $importedConfig->getLength());
			$this->assertEquals(15, $importedConfig->getIncrement());
			$this->assertEquals(5, $importedConfig->getPreparationDuration());
			$this->assertEquals(10, $importedConfig->getFollowupDuration());
			$this->assertEquals(5, $importedConfig->getDailyMax());
			$this->assertEquals(60, $importedConfig->getFutureLimit());
			$this->assertTrue($importedConfig->getCreateTalkRoom());
			// Token should be regenerated
			$this->assertNotEquals('original-token-123', $importedConfig->getToken());

		} finally {
			$user->delete();
		}
	}

	public function testExportImportProposals(): void {
		$userId = 'test_user_proposal_' . time();
		$user = $this->userManager->createUser($userId, 'topsecretpassword');

		try {
			// Create test proposal
			$proposal = new ProposalDetailsEntry();
			$proposal->setUid($userId);
			$proposal->setUuid(Uuid::v4()->toRfc4122());
			$proposal->setTitle('Team Meeting Proposal');
			$proposal->setDescription('Discuss Q1 planning');
			$proposal->setLocation('Conference Room A');
			$proposal->setDuration(3600);
			$proposal = $this->proposalMapper->insert($proposal);

			// Add dates
			$date1 = new ProposalDateEntry();
			$date1->setUid($userId);
			$date1->setPid($proposal->getId());
			$date1->setDate(1735689600); // 2025-01-01 00:00:00
			$date1 = $this->proposalDateMapper->insert($date1);

			$date2 = new ProposalDateEntry();
			$date2->setUid($userId);
			$date2->setPid($proposal->getId());
			$date2->setDate(1735776000); // 2025-01-02 00:00:00
			$date2 = $this->proposalDateMapper->insert($date2);

			// Add participants
			$participant1 = new ProposalParticipantEntry();
			$participant1->setUid($userId);
			$participant1->setPid($proposal->getId());
			$participant1->setName('Alice');
			$participant1->setAddress('alice@example.com');
			$participant1->setAttendance('0');
			$participant1->setStatus('0');
			$participant1->setRealm('email');
			$participant1->setToken(md5('alice-token'));
			$participant1 = $this->proposalParticipantMapper->insert($participant1);

			$participant2 = new ProposalParticipantEntry();
			$participant2->setUid($userId);
			$participant2->setPid($proposal->getId());
			$participant2->setName('Bob');
			$participant2->setAddress('bob@example.com');
			$participant2->setAttendance('0');
			$participant2->setStatus('0');
			$participant2->setRealm('email');
			$participant2->setToken(md5('bob-token'));
			$participant2 = $this->proposalParticipantMapper->insert($participant2);

			// Add votes
			$vote1 = new ProposalVoteEntry();
			$vote1->setUid($userId);
			$vote1->setPid($proposal->getId());
			$vote1->setParticipantId($participant1->getId());
			$vote1->setDateId($date1->getId());
			$vote1->setVote('1'); // yes
			$this->proposalVoteMapper->insert($vote1);

			$vote2 = new ProposalVoteEntry();
			$vote2->setUid($userId);
			$vote2->setPid($proposal->getId());
			$vote2->setParticipantId($participant1->getId());
			$vote2->setDateId($date2->getId());
			$vote2->setVote('0'); // no
			$this->proposalVoteMapper->insert($vote2);

			$vote3 = new ProposalVoteEntry();
			$vote3->setUid($userId);
			$vote3->setPid($proposal->getId());
			$vote3->setParticipantId($participant2->getId());
			$vote3->setDateId($date1->getId());
			$vote3->setVote('1'); // yes
			$this->proposalVoteMapper->insert($vote3);

			// Export
			$exportDestination = $this->createMock(IExportDestination::class);
			$exportedData = [];
			$exportDestination->expects($this->atLeastOnce())
				->method('addFileContents')
				->willReturnCallback(function (string $path, string $content) use (&$exportedData) {
					$exportedData[$path] = $content;
				});

			$this->migrator->export($user, $exportDestination, $this->output);

			// Verify export
			$this->assertArrayHasKey('calendar/proposals.json', $exportedData);
			$exportedProposals = json_decode($exportedData['calendar/proposals.json'], true);
			$this->assertCount(1, $exportedProposals);

			$exportedProposal = $exportedProposals[0];
			$this->assertEquals('Team Meeting Proposal', $exportedProposal['title']);
			$this->assertEquals('Discuss Q1 planning', $exportedProposal['description']);
			$this->assertEquals('Conference Room A', $exportedProposal['location']);
			$this->assertEquals(3600, $exportedProposal['duration']);
			$this->assertCount(2, $exportedProposal['dates']);
			$this->assertCount(2, $exportedProposal['participants']);
			$this->assertCount(3, $exportedProposal['votes']);

			// Clean up for import test
			$this->proposalVoteMapper->deleteByProposalId($userId, $proposal->getId());
			$this->proposalParticipantMapper->deleteByProposalId($userId, $proposal->getId());
			$this->proposalDateMapper->deleteByProposalId($userId, $proposal->getId());
			$this->proposalMapper->delete($proposal);

			// Import
			$importSource = $this->createMock(IImportSource::class);
			$importSource->expects($this->once())
				->method('getMigratorVersion')
				->willReturn(1);
			$importSource->expects($this->any())
				->method('getFileContents')
				->willReturnCallback(function (string $path) use ($exportedData) {
					if (!isset($exportedData[$path])) {
						throw new \Exception('File not found');
					}
					return $exportedData[$path];
				});

			$this->migrator->import($user, $importSource, $this->output);

			// Verify import
			$importedProposals = $this->proposalMapper->fetchByUserId($userId);
			$this->assertCount(1, $importedProposals);

			$importedProposal = $importedProposals[0];
			$this->assertEquals('Team Meeting Proposal', $importedProposal->getTitle());
			$this->assertEquals('Discuss Q1 planning', $importedProposal->getDescription());
			$this->assertEquals('Conference Room A', $importedProposal->getLocation());
			$this->assertEquals(3600, $importedProposal->getDuration());

			// Verify dates
			$importedDates = $this->proposalDateMapper->fetchByUserId($userId);
			$this->assertCount(2, $importedDates);
			$dateValues = array_map(fn ($d) => $d->getDate(), $importedDates);
			$this->assertContains(1735689600, $dateValues);
			$this->assertContains(1735776000, $dateValues);

			// Verify participants
			$importedParticipants = $this->proposalParticipantMapper->fetchByUserId($userId);
			$this->assertCount(2, $importedParticipants);
			$participantNames = array_map(fn ($p) => $p->getName(), $importedParticipants);
			$this->assertContains('Alice', $participantNames);
			$this->assertContains('Bob', $participantNames);

			// Verify votes
			$importedVotes = $this->proposalVoteMapper->fetchByUserId($userId);
			$this->assertCount(3, $importedVotes);

			// Verify vote relationships are preserved
			foreach ($importedVotes as $vote) {
				$this->assertEquals($importedProposal->getId(), $vote->getPid());
				$this->assertContains($vote->getParticipantId(), array_map(fn ($p) => $p->getId(), $importedParticipants));
				$this->assertContains($vote->getDateId(), array_map(fn ($d) => $d->getId(), $importedDates));
			}

		} finally {
			$user->delete();
		}
	}

	public function testExportImportEmptyData(): void {
		$userId = 'test_user_empty_' . time();
		$user = $this->userManager->createUser($userId, 'topsecretpassword');

		try {
			// Export with no data
			$exportDestination = $this->createMock(IExportDestination::class);
			$exportedData = [];
			$exportDestination->expects($this->atLeastOnce())
				->method('addFileContents')
				->willReturnCallback(function (string $path, string $content) use (&$exportedData) {
					$exportedData[$path] = $content;
				});

			$this->migrator->export($user, $exportDestination, $this->output);

			// Should have version but no appointment_configs or proposals files
			$this->assertArrayHasKey('calendar/version.json', $exportedData);
			$this->assertArrayNotHasKey('calendar/appointment_configs.json', $exportedData);
			$this->assertArrayNotHasKey('calendar/proposals.json', $exportedData);

			// Import should handle missing files gracefully
			$importSource = $this->createMock(IImportSource::class);
			$importSource->expects($this->once())
				->method('getMigratorVersion')
				->willReturn(1);
			$importSource->expects($this->any())
				->method('getFileContents')
				->willReturnCallback(function (string $path) use ($exportedData) {
					if (!isset($exportedData[$path])) {
						throw new \Exception('File not found');
					}
					return $exportedData[$path];
				});

			// Should not throw
			$this->migrator->import($user, $importSource, $this->output);

			// Verify no data was imported
			$configs = $this->appointmentConfigMapper->findAllForUser($userId);
			$this->assertEmpty($configs);

			$proposals = $this->proposalMapper->fetchByUserId($userId);
			$this->assertEmpty($proposals);

		} finally {
			$user->delete();
		}
	}

	public function testEstimateExportSize(): void {
		$userId = 'test_user_estimate_' . time();
		$user = $this->userManager->createUser($userId, 'topsecretpassword');

		try {
			// Initially should be 0
			$size = $this->migrator->getEstimatedExportSize($user);
			$this->assertEquals(0, $size);

			// Add appointment config
			$config = new AppointmentConfig();
			$config->setToken('token-' . time());
			$config->setName('Test');
			$config->setUserId($userId);
			$config->setTargetCalendarUri('personal');
			$config->setVisibility(AppointmentConfig::VISIBILITY_PRIVATE);
			$config->setLength(30);
			$config->setIncrement(15);
			$this->appointmentConfigMapper->insert($config);

			// Size should increase
			$sizeWithConfig = $this->migrator->getEstimatedExportSize($user);
			$this->assertGreaterThan(0, $sizeWithConfig);

			// Add proposal
			$proposal = new ProposalDetailsEntry();
			$proposal->setUid($userId);
			$proposal->setUuid(Uuid::v4()->toRfc4122());
			$proposal->setTitle('Test Proposal');
			$proposal->setDuration(3600);
			$proposal = $this->proposalMapper->insert($proposal);

			// Size should increase more
			$sizeWithProposal = $this->migrator->getEstimatedExportSize($user);
			$this->assertGreaterThan($sizeWithConfig, $sizeWithProposal);

		} finally {
			$user->delete();
		}
	}
}
