<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Migration;

use Closure;
use OCA\Calendar\AppInfo\Application;
use OCP\IAppConfig;
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

	public function __construct(
		private IAppConfig $appConfig,
		private IConfig $config,
		private IDBConnection $connection,
	) {
	}

	#[\Override]
	public function postSchemaChange(IOutput $output, Closure $schemaClosure, array $options): void {
		$this->migrateAppDefault();
		$this->migrateUserPreferences($output);
	}

	private function migrateAppDefault(): void {
		if (!$this->appConfig->hasKey(Application::APP_ID, 'defaultReminder')) {
			return;
		}

		$value = $this->appConfig->getValueString(Application::APP_ID, 'defaultReminder', 'none');

		if (!$this->appConfig->hasKey(Application::APP_ID, 'defaultReminderPartDay')) {
			$this->appConfig->setValueString(Application::APP_ID, 'defaultReminderPartDay', $value);
		}
		if (!$this->appConfig->hasKey(Application::APP_ID, 'defaultReminderFullDay')) {
			$this->appConfig->setValueString(Application::APP_ID, 'defaultReminderFullDay', $value);
		}

		$this->appConfig->deleteKey(Application::APP_ID, 'defaultReminder');
	}

	private function migrateUserPreferences(IOutput $output): void {
		$qb = $this->connection->getQueryBuilder();
		$qb->select('userid', 'configvalue')
			->from('preferences')
			->where($qb->expr()->eq('appid', $qb->createNamedParameter(Application::APP_ID)))
			->andWhere($qb->expr()->eq('configkey', $qb->createNamedParameter('defaultReminder')));

		$result = $qb->executeQuery();

		$migrated = 0;
		while ($row = $result->fetch()) {
			$userId = (string)$row['userid'];
			$value = (string)$row['configvalue'];
			$userKeys = $this->config->getUserKeys($userId, Application::APP_ID);

			if (!in_array('defaultReminderPartDay', $userKeys, true)) {
				$this->config->setUserValue($userId, Application::APP_ID, 'defaultReminderPartDay', $value);
			}
			if (!in_array('defaultReminderFullDay', $userKeys, true)) {
				$this->config->setUserValue($userId, Application::APP_ID, 'defaultReminderFullDay', $value);
			}

			$this->config->deleteUserValue($userId, Application::APP_ID, 'defaultReminder');
			$migrated++;
		}
		$result->closeCursor();

		if ($migrated > 0) {
			$output->info("Migrated the legacy defaultReminder setting for $migrated users");
		}
	}
}
