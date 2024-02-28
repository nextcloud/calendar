<?php

declare(strict_types=1);

/**
 * @copyright 2021 Anna Larch <anna.larch@gmx.net>
 *
 * @author Anna Larch <anna.larch@gmx.net>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

namespace OCA\Calendar\Db;

use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\AppFramework\Db\QBMapper;
use OCP\DB\Exception as DbException;
use OCP\DB\QueryBuilder\IQueryBuilder;
use OCP\IDBConnection;

/**
 * @template-extends QBMapper<AppointmentConfig>
 */
class AppointmentConfigMapper extends QBMapper {
	public function __construct(IDBConnection $db) {
		parent::__construct($db, 'calendar_appt_configs');
	}

	/**
	 * @param int $id
	 * @param string $userId
	 * @return AppointmentConfig
	 * @throws DoesNotExistException
	 */
	public function findByIdForUser(int $id, string $userId) : AppointmentConfig {
		$qb = $this->db->getQueryBuilder();
		$qb->select('*')
			->from($this->getTableName())
			->where($qb->expr()->eq('id', $qb->createNamedParameter($id, IQueryBuilder::PARAM_INT), IQueryBuilder::PARAM_INT))
			->andWhere($qb->expr()->eq('user_id', $qb->createNamedParameter($userId, IQueryBuilder::PARAM_STR), IQueryBuilder::PARAM_STR));
		return $this->findEntity($qb);
	}

	/**
	 * @param int $id
	 * @return AppointmentConfig
	 * @throws DbException
	 * @throws DoesNotExistException
	 * @throws MultipleObjectsReturnedException
	 */
	public function findById(int $id) : AppointmentConfig {
		$qb = $this->db->getQueryBuilder();
		$qb->select('*')
			->from($this->getTableName())
			->where($qb->expr()->eq('id', $qb->createNamedParameter($id, IQueryBuilder::PARAM_INT), IQueryBuilder::PARAM_INT));
		return $this->findEntity($qb);
	}

	/**
	 * @param string $token
	 * @return AppointmentConfig
	 * @throws DoesNotExistException
	 */
	public function findByToken(string $token) : AppointmentConfig {
		$qb = $this->db->getQueryBuilder();
		$qb->select('*')
			->from($this->getTableName())
			->where($qb->expr()->eq('token', $qb->createNamedParameter($token, IQueryBuilder::PARAM_STR), IQueryBuilder::PARAM_STR));
		return $this->findEntity($qb);
	}

	/**
	 * @param string $userId
	 * @param string|null $visibility optionally filter for visibility
	 * @psalm-param AppointmentConfig::VISIBILITY_* $visibility
	 * @return AppointmentConfig[]
	 * @throws DbException
	 */
	public function findAllForUser(string $userId, ?string $visibility = null): array {
		$qb = $this->db->getQueryBuilder();
		$qb->select('*')
			->from($this->getTableName())
			->where($qb->expr()->eq('user_id', $qb->createNamedParameter($userId, IQueryBuilder::PARAM_STR), IQueryBuilder::PARAM_STR));
		if ($visibility !== null) {
			$qb->andWhere($qb->expr()->eq('visibility', $qb->createNamedParameter($visibility)));
		}
		return $this->findEntities($qb);
	}

	/**
	 * @param int $id
	 * @param string $userId
	 * @return int
	 * @throws DbException
	 */
	public function deleteById(int $id, string $userId): int {
		$qb = $this->db->getQueryBuilder();

		$qb->delete($this->tableName)
			->where($qb->expr()->eq('id', $qb->createNamedParameter($id, IQueryBuilder::PARAM_INT), IQueryBuilder::PARAM_INT))
			->andWhere($qb->expr()->eq('user_id', $qb->createNamedParameter($userId, IQueryBuilder::PARAM_STR), IQueryBuilder::PARAM_STR));

		return $qb->executeStatement();
	}

	public function deleteByUserId(string $uid): void {
		$qb = $this->db->getQueryBuilder();

		$qb->delete($this->tableName)
			->where($qb->expr()->eq('user_id', $qb->createNamedParameter($uid, IQueryBuilder::PARAM_STR), IQueryBuilder::PARAM_STR));

		$qb->execute();
	}
}
