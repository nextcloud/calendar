<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

class JSONBackend extends JSON {

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

		$this->setSupportedActions();
		$this->setPrefixInformation();

		return $this->jsonArray;
	}


	/**
	 * @brief set property 
	 * @param string $key
	 * @param mixed $value
	 */
	private function setProperty($key, $value) {
		switch($key) {
			case 'backend':
				$this->jsonArray[$key] = strval($value);
				break;

			case 'enabled':
				$this->jsonArray[$key] = (bool) $value; //boolval is PHP >= 5.5 only
				break;

			//blacklist
			case 'id':
			case 'arguments':
			case 'classname':
			case 'api':
				break;

			default:
				$this->jsonArray[$key] = $value;
				break;
			
		}
	}


	/**
	 * @brief set api url to calendar
	 * @return $this
	 */
	private function setSupportedActions() {
		$actions = array(
			'createCalendar' => 
				$this->object->api->implementsActions(\OCA\Calendar\Backend\CREATE_CALENDAR),
			'updateCalendar' => 
				$this->object->api->implementsActions(\OCA\Calendar\Backend\UPDATE_CALENDAR),
			'deleteCalendar' => 
				$this->object->api->implementsActions(\OCA\Calendar\Backend\DELETE_CALENDAR),
			'mergeCalendar' => 
				$this->object->api->implementsActions(\OCA\Calendar\Backend\MERGE_CALENDAR),
			'moveCalendar' => 
				$this->object->api->implementsActions(\OCA\Calendar\Backend\MOVE_CALENDAR),
			'createObject' => 
				$this->object->api->implementsActions(\OCA\Calendar\Backend\CREATE_OBJECT),
			'updateObject' => 
				$this->object->api->implementsActions(\OCA\Calendar\Backend\UPDATE_OBJECT),
			'deleteObject' => 
				$this->object->api->implementsActions(\OCA\Calendar\Backend\DELETE_OBJECT),
		);
		$this->jsonArray['actions'] = $actions;
	}


	/**
	 * @brief set api url to calendar
	 * @return $this
	 */
	private function setPrefixInformation() {
		$this->jsonArray['needsPrefix'] = $this->object->api->needsPrefix();
		$this->jsonArray['prefixes'] = $this->object->api->getAvailablePrefixes();
	}
}