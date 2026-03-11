<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Db;

use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\QBMapper;
use OCP\DB\QueryBuilder\IQueryBuilder;
use OCP\IDBConnection;

/**
 * @template-extends QBMapper<ShareAlarmSetting>
 */
class ShareAlarmSettingMapper extends QBMapper {

	public function __construct(IDBConnection $db) {
		parent::__construct($db, 'calendar_share_alarms');
	}

	/**
	 * Find the alarm suppression setting for a specific calendar and sharee
	 *
	 * @param int $calendarId The internal calendar ID
	 * @param string $principalUri The sharee's principal URI
	 * @return ShareAlarmSetting
	 * @throws DoesNotExistException When no setting exists
	 */
	public function findByCalendarAndPrincipal(int $calendarId, string $principalUri): ShareAlarmSetting {
		$qb = $this->db->getQueryBuilder();
		$qb->select('*')
			->from($this->getTableName())
			->where($qb->expr()->eq('calendar_id', $qb->createNamedParameter($calendarId, IQueryBuilder::PARAM_INT)))
			->andWhere($qb->expr()->eq('principal_uri', $qb->createNamedParameter($principalUri)));
		return $this->findEntity($qb);
	}

	/**
	 * Check whether alarms should be suppressed for a given calendar and sharee
	 *
	 * @param int $calendarId The internal calendar ID
	 * @param string $principalUri The sharee's principal URI
	 * @return bool True if alarms should be suppressed
	 */
	public function isSuppressed(int $calendarId, string $principalUri): bool {
		try {
			$setting = $this->findByCalendarAndPrincipal($calendarId, $principalUri);
			return $setting->getSuppressAlarms();
		} catch (DoesNotExistException) {
			return false;
		}
	}

	/**
	 * Find all alarm settings for a given calendar
	 *
	 * @param int $calendarId The internal calendar ID
	 * @return ShareAlarmSetting[]
	 */
	public function findAllByCalendarId(int $calendarId): array {
		$qb = $this->db->getQueryBuilder();
		$qb->select('*')
			->from($this->getTableName())
			->where($qb->expr()->eq('calendar_id', $qb->createNamedParameter($calendarId, IQueryBuilder::PARAM_INT)));
		return $this->findEntities($qb);
	}

	/**
	 * Delete all alarm settings for a calendar
	 *
	 * @param int $calendarId The internal calendar ID
	 */
	public function deleteByCalendarId(int $calendarId): void {
		$qb = $this->db->getQueryBuilder();
		$qb->delete($this->getTableName())
			->where($qb->expr()->eq('calendar_id', $qb->createNamedParameter($calendarId, IQueryBuilder::PARAM_INT)));
		$qb->executeStatement();
	}

	/**
	 * Delete alarm setting for a specific share
	 *
	 * @param int $calendarId The internal calendar ID
	 * @param string $principalUri The sharee's principal URI
	 */
	public function deleteByCalendarAndPrincipal(int $calendarId, string $principalUri): void {
		$qb = $this->db->getQueryBuilder();
		$qb->delete($this->getTableName())
			->where($qb->expr()->eq('calendar_id', $qb->createNamedParameter($calendarId, IQueryBuilder::PARAM_INT)))
			->andWhere($qb->expr()->eq('principal_uri', $qb->createNamedParameter($principalUri)));
		$qb->executeStatement();
	}
}
