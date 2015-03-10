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
namespace OCA\Calendar\Http;

use OCA\Calendar\Utility\Utility;
use OCP\AppFramework\Http;
use OCA\Calendar\ICollection;
use OCA\Calendar\IEntity;

abstract class SimpleJSONResponse extends JSONResponse {

	/**
	 * Returns the rendered json
	 *
	 * @return string the rendered json
	 */
	public function render() {
		$data = [];

		if ($this->data instanceof IEntity) {
			$data = $this->generate($this->data);
		} elseif ($this->data instanceof ICollection) {
			$data = [];
			foreach ($this->data as $entity) {
				try {
					$data[] = $this->generate($entity);
				} catch (SerializerException $ex) {
					continue;
				}
			}
		}

		return json_encode($data);
	}


	/**
	 * generate output for one backend
	 *
	 * @param IEntity $entity
	 * @return array
	 */
	protected function generate(IEntity $entity) {
		$data = [];

		$properties = Utility::getPublicProperties($entity);
		foreach ($properties as $key => $value) {
			$getter = 'get' . ucfirst($key);
			$value = $entity->{$getter}();

			$this->setProperty($data, strtolower($key), $value);
		}

		return $data;
	}


	/**
	 * @param array &$data
	 * @param string $key
	 * @param mixed $value
	 */
	abstract protected function setProperty(array &$data, $key, $value);
}