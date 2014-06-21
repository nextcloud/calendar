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
namespace OCA\Calendar\Http\JSON;

use OCP\Calendar\Backend;

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
		$this->setSubscriptionTypes();

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
		$calActions = array(
			'create' => 
				$this->object->api->implementsActions(Backend::CREATE_CALENDAR),
			'update' => 
				$this->object->api->implementsActions(Backend::UPDATE_CALENDAR),
			'delete' => 
				$this->object->api->implementsActions(Backend::DELETE_CALENDAR),
			'merge' => 
				$this->object->api->implementsActions(Backend::MERGE_CALENDAR),
			'move' => 
				$this->object->api->implementsActions(Backend::MOVE_CALENDAR),
		);

		$objActions = array(
			'create' => 
				$this->object->api->implementsActions(Backend::CREATE_OBJECT),
			'update' => 
				$this->object->api->implementsActions(Backend::UPDATE_OBJECT),
			'delete' => 
				$this->object->api->implementsActions(Backend::DELETE_OBJECT),
		);

		$actions = array(
			'calendar' => $calActions,
			'object' => $objActions,
		);

		$this->jsonArray['actions'] = $actions;
	}


	/**
	 * @brief set api url to calendar
	 * @return $this
	 */
	private function setPrefixInformation() {
		$this->jsonArray['prefixes'] = $this->object->api->getAvailablePrefixes();
		return $this;
	}


	/**
	 * @brief set api url to calendar
	 * @return $this
	 */
	private function setSubscriptionTypes() {
		$this->jsonArray['subscriptions'] = $this->object->api->getSubscriptionTypes();
		return $this;
	}
}