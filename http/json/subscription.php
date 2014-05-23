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