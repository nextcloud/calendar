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

use OCP\Calendar\IBackend;

use OCA\Calendar\Http\SimpleJSONResponse;

class JSONBackendResponse extends SimpleJSONResponse {

	/**
	 * generate output for one backend
	 * @param IBackend $backend
	 * @return array
	 */
	protected function generate(IBackend $backend) {
		$data = parent::generate($backend);

		$this->setPrefixInformation($data, $backend);
		$this->setSubscriptionTypes($data, $backend);

		return $data;
	}


	/**
	 * @param array $data
	 * @param string $key
	 * @param mixed $value
	 */
	public function setProperty(array &$data, $key, $value) {
		switch($key) {
			case 'id':
				$data[$key] = strval($value);
				break;

			//blacklist
			case 'backendapi':
			case 'calendarapi':
			case 'objectapi':
			case 'objectcache':
				break;

			default:
				$data[$key] = $value;
				break;

		}
	}


	/**
	 * add information about supported prefixes
	 * @param array $data
	 * @param IBackend $backend
	 * @return $this
	 */
	private function setPrefixInformation(array &$data, IBackend $backend) {
		$data['prefixes'] = $backend->getBackendAPI()->getAvailablePrefixes();
	}


	/**
	 * add information about support subscription types
	 * @param array $data
	 * @param IBackend $backend
	 * @return $this
	 */
	private function setSubscriptionTypes(array &$data, IBackend $backend) {
		$data['subscriptions'] = $backend->getBackendAPI()->getSubscriptionTypes();
	}
}