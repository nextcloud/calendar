<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\UserMigration;

use OCA\Calendar\AppInfo\Application;
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
use OCP\App\IAppManager;
use OCP\IL10N;
use OCP\IUser;
use OCP\UserMigration\IExportDestination;
use OCP\UserMigration\IImportSource;
use OCP\UserMigration\IMigrator;
use OCP\UserMigration\ISizeEstimationMigrator;
use OCP\UserMigration\TMigratorBasicVersionHandling;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Uid\Uuid;
use Throwable;

class Migrator implements IMigrator, ISizeEstimationMigrator {

	use TMigratorBasicVersionHandling;

	private const PATH_ROOT = 'calendar/';
	private const PATH_VERSION = self::PATH_ROOT . 'version.json';
	private const PATH_APPOINTMENT_CONFIGS = self::PATH_ROOT . 'appointment_configs.json';
	private const PATH_PROPOSALS = self::PATH_ROOT . 'proposals.json';

	public function __construct(
		private IL10N $l10n,
		private IAppManager $appManager,
		private AppointmentConfigMapper $appointmentConfigMapper,
		private ProposalMapper $proposalMapper,
		private ProposalDateMapper $proposalDateMapper,
		private ProposalParticipantMapper $proposalParticipantMapper,
		private ProposalVoteMapper $proposalVoteMapper,
	) {
	}

	/**
	 * {@inheritDoc}
	 */
	#[\Override]
	public function getId(): string {
		return 'calendar-app';
	}

	/**
	 * {@inheritDoc}
	 */
	#[\Override]
	public function getDisplayName(): string {
		return $this->l10n->t('Calendar App');
	}

	/**
	 * {@inheritDoc}
	 */
	#[\Override]
	public function getDescription(): string {
		return $this->l10n->t('Calendars App settings including proposals and appointments schedule configurations.');
	}

	/**
	 * {@inheritDoc}
	 */
	#[\Override]
	public function getEstimatedExportSize(IUser $user): int|float {
		$size = 0;

		// Estimate size for appointment configs (approximately 1KB each)
		$appointmentConfigs = $this->appointmentConfigMapper->findAllForUser($user->getUID());
		$size += count($appointmentConfigs) * 1;

		// Estimate size for proposals (approximately 2KB each with dates, participants, votes)
		$proposals = $this->proposalMapper->fetchByUserId($user->getUID());
		$size += count($proposals) * 2;

		return ceil($size);
	}

	/**
	 * {@inheritDoc}
	 */
	#[\Override]
	public function export(IUser $user, IExportDestination $exportDestination, OutputInterface $output): void {
		$output->writeln('Exporting calendar app data…');
		$this->exportVersion($exportDestination, $output);
		$this->exportAppointmentConfigs($user, $exportDestination, $output);
		$this->exportProposals($user, $exportDestination, $output);
	}

	/**
	 * Export version information
	 */
	private function exportVersion(IExportDestination $exportDestination, OutputInterface $output): void {
		try {
			$versionData = [
				'appVersion' => $this->appManager->getAppVersion(Application::APP_ID),
			];
			$exportDestination->addFileContents(self::PATH_VERSION, json_encode($versionData, JSON_THROW_ON_ERROR));
		} catch (Throwable $e) {
			throw new MigrationException('Could not export version information', 0, $e);
		}
	}

	/**
	 * Export appointment configurations for a user
	 */
	private function exportAppointmentConfigs(IUser $user, IExportDestination $exportDestination, OutputInterface $output): void {
		$output->writeln('Exporting calendar app appointment configurations to ' . self::PATH_APPOINTMENT_CONFIGS . '…');

		try {
			$appointmentConfigs = $this->appointmentConfigMapper->findAllForUser($user->getUID());

			if (empty($appointmentConfigs)) {
				$output->writeln('No appointment configurations to export…');
				return;
			}

			$exportData = array_map(fn (AppointmentConfig $config) => $config->jsonSerialize(), $appointmentConfigs);
			$exportDestination->addFileContents(self::PATH_APPOINTMENT_CONFIGS, json_encode($exportData, JSON_THROW_ON_ERROR));

			$output->writeln('Exported ' . count($appointmentConfigs) . ' appointment configuration(s)…');
		} catch (Throwable $e) {
			throw new MigrationException('Could not export appointment configurations', 0, $e);
		}
	}

	/**
	 * Export proposals for a user
	 */
	private function exportProposals(IUser $user, IExportDestination $exportDestination, OutputInterface $output): void {
		$output->writeln('Exporting calendar app proposals to ' . self::PATH_PROPOSALS . '…');

		try {
			$userId = $user->getUID();
			$proposals = $this->proposalMapper->fetchByUserId($userId);

			if (empty($proposals)) {
				$output->writeln('No proposals to export…');
				return;
			}

			$dates = $this->proposalDateMapper->fetchByUserId($userId);
			$participants = $this->proposalParticipantMapper->fetchByUserId($userId);
			$votes = $this->proposalVoteMapper->fetchByUserId($userId);

			// Organize data by proposal ID
			$datesByProposal = [];
			foreach ($dates as $date) {
				$datesByProposal[$date->getPid()][] = [
					'id' => $date->getId(),
					'date' => $date->getDate(),
				];
			}

			$participantsByProposal = [];
			foreach ($participants as $participant) {
				$participantsByProposal[$participant->getPid()][] = [
					'id' => $participant->getId(),
					'name' => $participant->getName(),
					'address' => $participant->getAddress(),
					'attendance' => $participant->getAttendance(),
					'status' => $participant->getStatus(),
					'realm' => $participant->getRealm(),
					'token' => $participant->getToken(),
				];
			}

			$votesByProposal = [];
			foreach ($votes as $vote) {
				$votesByProposal[$vote->getPid()][] = [
					'participantId' => $vote->getParticipantId(),
					'dateId' => $vote->getDateId(),
					'vote' => $vote->getVote(),
				];
			}

			$proposalsData = [];
			foreach ($proposals as $proposal) {
				$proposalId = $proposal->getId();
				$proposalsData[] = [
					'uuid' => $proposal->getUuid(),
					'title' => $proposal->getTitle(),
					'description' => $proposal->getDescription(),
					'location' => $proposal->getLocation(),
					'duration' => $proposal->getDuration(),
					'dates' => $datesByProposal[$proposalId] ?? [],
					'participants' => $participantsByProposal[$proposalId] ?? [],
					'votes' => $votesByProposal[$proposalId] ?? [],
				];
			}

			$exportDestination->addFileContents(self::PATH_PROPOSALS, json_encode($proposalsData, JSON_THROW_ON_ERROR));

			$output->writeln('Exported ' . count($proposals) . ' proposal(s)…');
		} catch (Throwable $e) {
			throw new MigrationException('Could not export proposals', 0, $e);
		}
	}

	/**
	 * {@inheritDoc}
	 *
	 * @throws MigrationException
	 */
	#[\Override]
	public function import(IUser $user, IImportSource $importSource, OutputInterface $output): void {
		$output->writeln('Importing calendar app data…');
		if ($importSource->getMigratorVersion($this->getId()) === null) {
			$output->writeln('No version for ' . static::class . ', skipping import…');
			return;
		}

		$this->importAppointmentConfigs($user, $importSource, $output);
		$this->importProposals($user, $importSource, $output);
	}

	/**
	 * Import appointment configurations for a user
	 */
	private function importAppointmentConfigs(IUser $user, IImportSource $importSource, OutputInterface $output): void {
		$output->writeln('Importing calendar app appointment configurations from ' . self::PATH_APPOINTMENT_CONFIGS . '…');

		try {
			$fileContents = $importSource->getFileContents(self::PATH_APPOINTMENT_CONFIGS);
		} catch (Throwable $e) {
			$output->writeln('No appointment configurations to import…');
			return;
		}

		try {
			/** @var array<int, array<string, mixed>> $data */
			$data = json_decode($fileContents, true, 512, JSON_THROW_ON_ERROR);

			$importCount = 0;
			foreach ($data as $configData) {
				$config = new AppointmentConfig();
				$config->setToken(bin2hex(random_bytes(16))); // Generate new token
				$config->setName($configData['name'] ?? '');
				$config->setDescription($configData['description'] ?? null);
				$config->setLocation($configData['location'] ?? null);
				$config->setVisibility($configData['visibility'] ?? AppointmentConfig::VISIBILITY_PRIVATE);
				$config->setUserId($user->getUID());
				$config->setTargetCalendarUri($configData['targetCalendarUri'] ?? '');
				$config->setCalendarFreebusyUris(
					isset($configData['calendarFreeBusyUris'])
						? json_encode($configData['calendarFreeBusyUris']) ?: null
						: null
				);
				$config->setAvailability(
					isset($configData['availability'])
						? json_encode($configData['availability']) ?: null
						: null
				);
				$config->setStart($configData['start'] ?? null);
				$config->setEnd($configData['end'] ?? null);
				$config->setLength($configData['length'] ?? 0);
				$config->setIncrement($configData['increment'] ?? 0);
				$config->setPreparationDuration($configData['preparationDuration'] ?? 0);
				$config->setFollowupDuration($configData['followupDuration'] ?? 0);
				$config->setTimeBeforeNextSlot($configData['timeBeforeNextSlot'] ?? 0);
				$config->setDailyMax($configData['dailyMax'] ?? null);
				$config->setFutureLimit($configData['futureLimit'] ?? null);
				$config->setCreateTalkRoom($configData['createTalkRoom'] ?? false);

				$this->appointmentConfigMapper->insert($config);
				$importCount++;
			}

			$output->writeln('Imported ' . $importCount . ' appointment configuration(s)…');
		} catch (Throwable $e) {
			throw new MigrationException('Could not import appointment configurations', 0, $e);
		}
	}

	/**
	 * Import proposals for a user
	 */
	private function importProposals(IUser $user, IImportSource $importSource, OutputInterface $output): void {
		$output->writeln('Importing calendar app proposals from ' . self::PATH_PROPOSALS . '…');

		try {
			$fileContents = $importSource->getFileContents(self::PATH_PROPOSALS);
		} catch (Throwable $e) {
			$output->writeln('No proposals to import…');
			return;
		}

		try {
			/** @var array<int, array<string, mixed>> $data */
			$data = json_decode($fileContents, true, 512, JSON_THROW_ON_ERROR);
			$userId = $user->getUID();

			$importCount = 0;
			foreach ($data as $proposalData) {
				// Import proposal entry
				$proposal = new ProposalDetailsEntry();
				$proposal->setUid($userId);
				$proposal->setUuid($proposalData['uuid'] ?? Uuid::v4()->toRfc4122());
				$proposal->setTitle($proposalData['title'] ?? null);
				$proposal->setDescription($proposalData['description'] ?? null);
				$proposal->setLocation($proposalData['location'] ?? null);
				$proposal->setDuration($proposalData['duration'] ?? 0);

				$proposal = $this->proposalMapper->insert($proposal);
				$newProposalId = $proposal->getId();

				// Map old IDs to new IDs for dates and participants
				$dateIdMap = [];
				$participantIdMap = [];

				// Import date entries
				foreach ($proposalData['dates'] ?? [] as $dateData) {
					$date = new ProposalDateEntry();
					$date->setUid($userId);
					$date->setPid($newProposalId);
					$date->setDate($dateData['date']);

					$date = $this->proposalDateMapper->insert($date);
					$dateIdMap[$dateData['id']] = $date->getId();
				}

				// Import participant entries
				foreach ($proposalData['participants'] ?? [] as $participantData) {
					$participant = new ProposalParticipantEntry();
					$participant->setUid($userId);
					$participant->setPid($newProposalId);
					$participant->setName($participantData['name']);
					$participant->setAddress($participantData['address']);
					$participant->setAttendance($participantData['attendance']);
					$participant->setStatus($participantData['status']);
					$participant->setRealm($participantData['realm']);
					$participant->setToken(md5(random_bytes(32))); // Generate new token

					$participant = $this->proposalParticipantMapper->insert($participant);
					$participantIdMap[$participantData['id']] = $participant->getId();
				}

				// Import vote entries with mapped IDs
				foreach ($proposalData['votes'] ?? [] as $voteData) {
					// Only import votes if both the participant and date exist in our maps
					$oldParticipantId = $voteData['participantId'];
					$oldDateId = $voteData['dateId'];

					if (!isset($participantIdMap[$oldParticipantId]) || !isset($dateIdMap[$oldDateId])) {
						continue;
					}

					$vote = new ProposalVoteEntry();
					$vote->setUid($userId);
					$vote->setPid($newProposalId);
					$vote->setParticipantId($participantIdMap[$oldParticipantId]);
					$vote->setDateId($dateIdMap[$oldDateId]);
					$vote->setVote($voteData['vote']);

					$this->proposalVoteMapper->insert($vote);
				}

				$importCount++;
			}

			$output->writeln('Imported ' . $importCount . ' proposal(s)…');
		} catch (Throwable $e) {
			throw new MigrationException('Could not import proposals', 0, $e);
		}
	}

}
