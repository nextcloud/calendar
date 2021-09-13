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

use InvalidArgumentException;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\AppFramework\Db\QBMapper;
use OCP\DB\Exception;
use OCP\DB\QueryBuilder\IQueryBuilder;
use OCP\IDBConnection;
use OCP\IL10N;

/**
 * @template-extends QBMapper<Appointment>
 */
class AppointmentMapper extends QBMapper {

	/** @var IL10N */
	private $l10n;

	public function __construct(IDBConnection $db,
								IL10N $l10n) {
		parent::__construct($db, 'calendar_appointments');
		$this->l10n = $l10n;
	}

	/**
	 * @param int $id
	 * @return Appointment
	 * @throws DoesNotExistException
	 * @throws MultipleObjectsReturnedException
	 * @throws Exception
	 */
	public function findById(int $id) : Appointment {
		$qb = $this->db->getQueryBuilder();
		$qb->select('*')
			->from($this->getTableName())
			->where($qb->expr()->eq('id', $qb->createNamedParameter($id, IQueryBuilder::PARAM_INT), IQueryBuilder::PARAM_INT));
		return $this->findEntity($qb);
	}

	/**
	 * @param $data
	 * @return Appointment
	 * @throws Exception
	 * @throws InvalidArgumentException
	 */
	public function updateFromData($data): Appointment {
		$appointment = $this->mapRowToEntity($data);
		return $this->update($appointment);
	}

	/**
	 * @param string $user
	 * @return Appointment[]
	 * @throws Exception
	 */
	public function findAllForUser(string $user): array {
		$qb = $this->db->getQueryBuilder();
		$qb->select('*')
			->from($this->getTableName())
			->where($qb->expr()->eq('user_id', $qb->createNamedParameter($user, IQueryBuilder::PARAM_STR), IQueryBuilder::PARAM_STR));
		return $this->findEntities($qb);
	}
}
