<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

class CacheStatus extends Entity {

	const DELETED = 1;
	const CREATED = 2;
	const OUTDATED = 3;

	public $calendarId;
	public $objectURI;
	public $type;


	/**
	 * @brief constructor
	 * @param mixed (array|null) $fromRow
	 */
	public function __construct($fromRow=null) {
		$this->addType('objectURI', 'string');
		$this->addType('type', 'integer');

		if(is_array($fromRow)) {
			$this->fromRow($fromRow);
		}
	}
}