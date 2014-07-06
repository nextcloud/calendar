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

/**
 * Public interface of ownCloud for apps to use.
 * AppFramework\HTTP\JSONResponse class
 */

namespace OCA\Calendar\Http;

use OCP\Calendar\ICollection;
use OCP\Calendar\IEntity;

/**
 * A renderer for JSON calls
 */
abstract class JSONResponse extends Response {

	/**
	 * Returns the rendered json
	 * @return string the rendered json
	 */
	public function render(){
		return json_encode($this->data);
	}


	/**
	 * does stuff like setting content-type
	 */
	public function preSerialize() {
		$this->addHeader('Content-type', 'application/json; charset=utf-8');
	}


	/**
	 * serialize output data from input
	 */
	public function serializeData() {
		if ($this->input instanceof IEntity) {
			$this->data = $this->generate($this->input);
		} elseif ($this->input instanceof ICollection) {
			$data = array();
			$this->input->iterate(function(IEntity $subscription) use (&$data) {
				try {
					$data[] = $this->generate($subscription);
				} catch(SerializerException $ex) {
					return;
				}
			});
			$this->data = $data;
		} else {
			$this->data = array();
		}
	}


	/**
	 * generate output for one backend
	 * @param IEntity $subscription
	 * @return array
	 */
	public function generate(IEntity $subscription) {
		$data = array();

		$properties = get_object_vars($subscription);
		foreach($properties as $key => $value) {
			$getter = 'get' . ucfirst($key);
			$value = $subscription->{$getter}();

			$this->setProperty($data, strtolower($key), $value);
		}

		return $data;
	}


	function setProperty(array &$data, $key, $value) {

	}


	public function postSerialize() {

	}
}