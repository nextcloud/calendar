<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

class Subscription extends Entity {

	public $name;
	public $type;
	public $url;
	public $userId;


	/**
	 * @brief init Backend object with data from db row
	 * @param array $fromRow
	 */
	public function __construct($fromRow=null){
		$this->addType('name', 'string');
		$this->addType('type', 'string');
		$this->addType('url', 'string');
		$this->addType('userId', 'string');

		if (is_array($fromRow)){
			$this->fromRow($fromRow);
		}
	}


	/**
	 * @brief check if object is valid
	 * @return boolean
	 */
	public function isValid() {
		$strings = array(
			$this->name,
			$this->type,
			$this->url,
			$this->userId
		);

		foreach($strings as $string) {
			if (!is_string($string)) {
				return false;
			}
			if (trim($string) === '') {
				return false;
			}
		}

		return true;
	}


	/**
	 * @brief create string representation of object
	 * @return string
	 */
	public function __toString() {
		return $this->userId . '::' . $this->type . '::' . $this->url;
	}
}