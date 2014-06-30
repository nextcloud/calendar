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

use OCP\Calendar\ISubscription;
use OCP\Calendar\ISubscriptionCollection;

use OCA\Calendar\Http\JSONResponse;
use OCA\Calendar\Http\SerializerException;

class JSONSubscriptionResponse extends JSONResponse {

	/**
	 * serialize output data from input
	 */
	public function serializeData() {
		if ($this->input instanceof ISubscription) {
			$this->data = $this->generate($this->input);
		} elseif ($this->input instanceof ISubscriptionCollection) {
			$data = array();
			$this->input->iterate(function(ISubscription $subscription) use (&$data) {
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
	 * @param ISubscription $subscription
	 * @return array
	 */
	public function generate(ISubscription $subscription) {
		$data = array();

		$properties = get_object_vars($subscription);
		foreach($properties as $key => $value) {
			$getter = 'get' . ucfirst($key);
			$value = $subscription->{$getter}();

			$this->setProperty($data, strtolower($key), $value);
		}

		return $data;
	}


	/**
	 * set property
	 * @param array $data
	 * @param string $key
	 * @param mixed $value
	 */
	private function setProperty(&$data, $key, $value) {
		switch($key) {
			case 'type':
			case 'url':
			case 'userid':
				$data[$key] = strval($value);
				break;

			case 'id':
				$data[$key] = intval($value);
				break;

			default:
				$data[$key] = $value;
				break;
			
		}
	}
}