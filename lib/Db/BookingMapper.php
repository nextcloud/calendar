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
