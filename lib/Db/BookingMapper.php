<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Db;

use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\QBMapper;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\DB\Exception as DbException;
use OCP\DB\QueryBuilder\IQueryBuilder;
use OCP\IDBConnection;

/**
 * @template-extends QBMapper<Booking>
 */
class BookingMapper extends QBMapper {
	/** @var ITimeFactory */
	private $time;

	public function __construct(IDBConnection $db, ITimeFactory $time) {
		parent::__construct($db, 'calendar_appt_bookings');
		$this->time = $time;
	}

	/**
	 * @param string $token
	 * @return Booking
	 * @throws DoesNotExistException
	 */
	public function findByToken(string $token) : Booking {
		$qb = $this->db->getQueryBuilder();
		$qb->select('*')
			->from($this->getTableName())
			->where($qb->expr()->eq('token', $qb->createNamedParameter($token, IQueryBuilder::PARAM_STR), IQueryBuilder::PARAM_STR));
		return $this->findEntity($qb);
	}

	public function deleteByUserId(string $uid) {
		$subQuery = $this->db->getQueryBuilder();
		$delete = $this->db->getQueryBuilder();
		$subQuery->select('id')
			->from('calendar_appt_configs')
			->where($delete->expr()->eq('user_id', $delete->createNamedParameter($uid, IQueryBuilder::PARAM_STR), IQueryBuilder::PARAM_STR));
		$delete->delete($this->getTableName())
			->where(
				$delete->expr()->in(
					'appt_config_id',
					$delete->createFunction($subQuery->getSQL()),
					IQueryBuilder::PARAM_INT_ARRAY
				)
			);
		return $delete->execute();
	}

	/**
	 * @param int $validFor is subtracted from time() and then compared against 'created_at'.
	 * @throws DbException
	 */
	public function deleteOutdated(int $validFor) : int {
		$limit = $this->time->getTime() - $validFor;
		$qb = $this->db->getQueryBuilder();
		$qb->delete($this->getTableName())
			->where($qb->expr()->lt('created_at', $qb->createNamedParameter($limit, IQueryBuilder::PARAM_INT), IQueryBuilder::PARAM_INT));
		return $qb->executeStatement();
	}
}
