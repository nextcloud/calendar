<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
namespace OCA\Calendar;

use OCA\Calendar\Db\ObjectType;

interface IObjectCollection extends ICollection {

	/**
	 * get a collection of entities within period
	 * @param \DateTime $start
	 * @param \DateTime $end
	 * @return IObjectCollection
	 */
	public function inPeriod(\DateTime $start, \DateTime $end);


	/**
	 * expand all entities of collection
	 * @param \DateTime $start
	 * @param \DateTime $end
	 * @return IObjectCollection
	 */
	public function expand(\DateTime $start, \DateTime $end);


	/**
	 * get a collection of all calendars owned by a certian user
	 * @param string $userId of owner
	 * @return IObjectCollection
	 */
	public function ownedBy($userId);


	/**
	 * get a collection of all enabled calendars within collection
	 * @param integer $type
	 * @return IObjectCollection
	 */
	public function ofType($type);


	/**
	 * @param array $idTable
	 * @return void
	 */
	public function addGlobalIds(array $idTable);


	/**
	 * @param int $type
	 * @return mixed
	 */
	public function listAll($type=ObjectType::ALL);
}