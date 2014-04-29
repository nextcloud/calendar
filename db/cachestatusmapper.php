<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Db\Object;

class CacheStatusMapper extends Mapper {

	/**
	 * @brief Constructor
	 * @param IAppContainer $app
	 * @param string $tablename
	 */
	public function __construct(IAppContainer $app, $tablename='clndr_cache_status'){
		parent::__construct($app, $tablename);
	}


	/**
	 * @brief find a CacheStatus by type
	 * @param Calendar $calendar
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @return CacheStatusCollection
	 */
	public function findByType(Calendar $calendar, $type, $limit, $offset) {
		$sql  = 'SELECT * FROM `'. $this->getTableName() . '` ';
		$sql .= 'WHERE `calendarId` = ? AND `type` = ?';

		return $this->findEntities($sql, array(
			$calendar->getId(),
			$type
		), $limit, $offset);
	}
}