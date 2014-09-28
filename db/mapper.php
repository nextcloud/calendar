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
namespace OCA\Calendar\Db;

use OCP\IDb;

/**
 * Simple parent class for inheriting your data access layer from. This class
 * may be subject to change in the future
 */
abstract class Mapper extends \OCP\AppFramework\Db\Mapper {

	/**
	 * @var string
	 */
	protected $collectionClass;


	/**
	 * @param IDb $db Instance of the Db abstraction layer
	 * @param string $tableName the name of the table. set this to allow entity
	 * @param string $entityClass the name of the entity that the sql should be
	 * @param string $collectionClass the name of the collection
	 * mapped to queries without using sql
	 */
	public function __construct(IDb $db, $tableName, $entityClass=null,
								$collectionClass=null){
		parent::__construct($db, $tableName, $entityClass);

		if($collectionClass === null) {
			$this->collectionClass = ($this->entityClass . 'Collection');
		} else {
			$this->collectionClass = $collectionClass;
		}
	}


	/**
	 * Runs a sql query and returns an array of entities
	 * @param string $sql the prepare string
	 * @param array $params the params which should replace the ? in the sql query
	 * @param int $limit the maximum number of rows
	 * @param int $offset from which row we want to start
	 * @return array all fetched entities
	 */
	protected function findEntities($sql, array $params=array(), $limit=null,
									$offset=null) {
		$entities = parent::findEntities($sql, $params, $limit, $offset);
		return call_user_func($this->collectionClass . '::fromArray', $entities);
	}
}
