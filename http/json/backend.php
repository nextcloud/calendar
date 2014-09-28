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

use OCA\Calendar\Http\JSONResponse;
use OCP\Calendar\IBackend;

class JSONBackendResponse extends JSONResponse {

	/**
	 * generate output for one backend
	 * @param IBackend $backend
	 * @return array
	 */
	public function generate(IBackend $backend) {
		$data = parent::generate($backend);

		$this->setPrefixInformation($data, $backend);
		$this->setSubscriptionTypes($data, $backend);

		return $data;
	}


	/**
	 * set property
	 * @param array $data
	 * @param string $key
	 * @param mixed $value
	 */
	public function setProperty(array &$data, $key, $value) {
		true;
		switch($key) {
			case 'id':
				$data[$key] = strval($value);
				break;

			//blacklist
			case 'backendapi':
			case 'backends':
			case 'calendarapi':
			case 'calendars':
			case 'objectapi':
			case 'objectcache':
				break;

			default:
				$data[$key] = $value;
				break;

		}
	}


	/**
	 * set api url to calendar
	 * @param array $data
	 * @param IBackend $backend
	 * @return $this
	 */
	private function setPrefixInformation(array &$data, IBackend $backend) {
		$data['prefixes'] = $backend->getBackendAPI()->getAvailablePrefixes();
	}


	/**
	 * set api url to calendar
	 * @param array $data
	 * @param IBackend $backend
	 * @return $this
	 */
	private function setSubscriptionTypes(array &$data, IBackend $backend) {
		$data['subscriptions'] = $backend->getBackendAPI()->getSubscriptionTypes();
	}
}