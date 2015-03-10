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

use OCP\IDBConnection;

/**
 * Simple parent class for inheriting your data access layer from. This class
 * may be subject to change in the future
 */
abstract class Mapper extends \OCP\AppFramework\Db\Mapper {


	/**
	 * @var EntityFactory
	 */
	protected $entityFactory;


	/**
	 * @var CollectionFactory
	 */
	protected $collectionFactory;


	/**
	 * @param IDBConnection $db
	 * @param string $tableName the name of the table. set this to allow entity
	 * @param EntityFactory $entityFactory
	 * @param CollectionFactory $collectionFactory
	 * mapped to queries without using sql
	 */
	public function __construct(IDBConnection $db, $tableName, EntityFactory $entityFactory,
								CollectionFactory $collectionFactory){
		parent::__construct($db, $tableName);
		$this->entityFactory = $entityFactory;
		$this->collectionFactory = $collectionFactory;
	}


	/**
	 * Runs a sql query and returns an array of entities
	 * @param string $sql the prepare string
	 * @param array $params the params which should replace the ? in the sql query
	 * @param int $limit the maximum number of rows
	 * @param int $offset from which row we want to start
	 * @return array all fetched entities
	 */
	protected function findEntities($sql, array $params=[], $limit=null, $offset=null) {
		$result = $this->execute($sql, $params, $limit, $offset);
		$rows = [];

		while($row = $result->fetch()){
			$rows[] = $row;
		}

		return $this->collectionFactory->createFromData($rows, EntityFactory::FORMAT_ROW);
	}


	/**
	 * Creates an entity from a row. Automatically determines the entity class
	 * from the current mapper name (MyEntityMapper -> MyEntity)
	 * @param array $row the row which should be converted to an entity
	 * @return Entity the entity
	 */
	protected function mapRowToEntity($row) {
		return $this->entityFactory->createEntity($row, EntityFactory::FORMAT_ROW);
	}
}
