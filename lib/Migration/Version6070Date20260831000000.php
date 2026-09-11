<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Migration;

use Closure;
use OCA\Calendar\AppInfo\Application;
use OCP\DB\QueryBuilder\IQueryBuilder;
use OCP\IConfig;
use OCP\IDBConnection;
use OCP\Migration\IOutput;
use OCP\Migration\SimpleMigrationStep;

/**
 * Migrates the legacy "defaultReminder" setting into the new
 * "defaultReminderPartDay" and "defaultReminderFullDay" settings
 * and removes the legacy setting afterward.
 */
class Version6070Date20260831000000 extends SimpleMigrationStep {
	private const CHUNK_SIZE = 1000;

	public function __construct(
		private IConfig $config,
		private IDBConnection $connection,
	) {
	}

	#[\Override]
	public function postSchemaChange(IOutput $output, Closure $schemaClosure, array $options): void {
		$migrated = 0;
		$rows = $this->retrieveLegacyReminders();

		while (count($rows) > 0) {
			$values = [];
			foreach ($rows as $row) {
				$values[(string)$row['userid']] = (string)$row['configvalue'];
			}
			$userIds = array_keys($values);

			$existing = $this->retrieveSplitReminders($userIds);

			foreach ($values as $userId => $value) {
				if (!isset($existing[$userId]['defaultReminderPartDay'])) {
					$this->config->setUserValue($userId, Application::APP_ID, 'defaultReminderPartDay', $value);
				}
				if (!isset($existing[$userId]['defaultReminderFullDay'])) {
					$this->config->setUserValue($userId, Application::APP_ID, 'defaultReminderFullDay', $value);
				}
				$migrated++;
			}

			// Removing the migrated batch guarantees the next iteration of the same
			// unpaginated query returns a fresh set of rows, so the loop terminates.
			$deleteQuery = $this->connection->getQueryBuilder();
			$deleteQuery->delete('preferences')
				->where($deleteQuery->expr()->eq('appid', $deleteQuery->createNamedParameter(Application::APP_ID)))
				->andWhere($deleteQuery->expr()->eq('configkey', $deleteQuery->createNamedParameter('defaultReminder')))
				->andWhere($deleteQuery->expr()->in('userid', $deleteQuery->createNamedParameter($userIds, IQueryBuilder::PARAM_STR_ARRAY)));
			$deleted = $deleteQuery->executeStatement();

			// Guard against an infinite loop if the delete ever fails to remove
			// the batch the select just returned.
			if ($deleted === 0) {
				$output->warning('Failed to remove migrated legacy defaultReminder preferences, aborting');
				break;
			}

			$rows = $this->retrieveLegacyReminders();
		}

		if ($migrated > 0) {
			$output->info("Migrated the legacy defaultReminder setting for $migrated users");
		}
	}

	/**
	 * @return array<int, array{userid: string, configvalue: string}>
	 */
	private function retrieveLegacyReminders(): array {
		$selectQuery = $this->connection->getQueryBuilder();
		$selectQuery->select('userid', 'configvalue')
			->from('preferences')
			->where($selectQuery->expr()->eq('appid', $selectQuery->createNamedParameter(Application::APP_ID)))
			->andWhere($selectQuery->expr()->eq('configkey', $selectQuery->createNamedParameter('defaultReminder')))
			->setMaxResults(self::CHUNK_SIZE);

		$result = $selectQuery->executeQuery();
		$rows = $result->fetchAllAssociative();
		$result->closeCursor();

		return array_map(
			static fn (array $row): array => [
				'userid' => (string)$row['userid'],
				'configvalue' => (string)$row['configvalue'],
			],
			$rows,
		);
	}

	/**
	 * @param string[] $userIds
	 * @return array<string, array<string, true>> userid => configkey => true
	 */
	private function retrieveSplitReminders(array $userIds): array {
		$qb = $this->connection->getQueryBuilder();
		$qb->select('userid', 'configkey')
			->from('preferences')
			->where($qb->expr()->eq('appid', $qb->createNamedParameter(Application::APP_ID)))
			->andWhere($qb->expr()->in('configkey', $qb->createNamedParameter(
				['defaultReminderPartDay', 'defaultReminderFullDay'],
				IQueryBuilder::PARAM_STR_ARRAY,
			)))
			->andWhere($qb->expr()->in('userid', $qb->createNamedParameter($userIds, IQueryBuilder::PARAM_STR_ARRAY)));

		$result = $qb->executeQuery();
		$existing = [];
		while ($row = $result->fetchAssociative()) {
			$existing[(string)$row['userid']][(string)$row['configkey']] = true;
		}
		$result->closeCursor();

		return $existing;
	}
}
