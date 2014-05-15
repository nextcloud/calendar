<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

use \OCA\Calendar\Db\Calendar;

use \OCA\Calendar\Db\ObjectType;
use \OCA\Calendar\Db\Permissions;

use \OCA\Calendar\Utility\CalendarUtility;
use \OCA\Calendar\Utility\JSONUtility;

class JSONSubscription extends JSON {

	/**
	 * json-encoded data
	 * @var array
	 */
	private $jsonArray;


	/**
	 * @brief get headers for response
	 * @return array
	 */
	public function getHeaders() {
		return array_merge(
			parent::getHeaders(),
			array(
				'Content-type' => 'application/json; charset=utf-8',
			)
		);
	}


	/**
	 * @brief get json-encoded string containing all information
	 * @return array
	 */
	public function serialize() {
		$this->jsonArray = array();

		$properties = get_object_vars($this->object);
		foreach($properties as $key => $value) {
			$getter = 'get' . ucfirst($key);
			$value = $this->object->{$getter}();

			$this->setProperty(strtolower($key), $value);
		}

		return $this->jsonArray;
	}


	/**
	 * @brief set property 
	 * @param string $key
	 * @param mixed $value
	 */
	private function setProperty($key, $value) {
		switch($key) {
			case 'name':
			case 'type':
			case 'url':
			case 'userid':
				$this->jsonArray[$key] = strval($value);
				break;

			//blacklist
			case 'id':
				break;

			default:
				$this->jsonArray[$key] = $value;
				break;
			
		}
	}
}