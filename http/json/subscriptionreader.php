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

use OCA\Calendar\Db\Subscription;
use OCA\Calendar\Db\SubscriptionCollection;
use OCA\Calendar\Http\ReaderException;

class JSONSubscriptionReader extends JSONReader{

	/**
	 * @brief parse jsoncalendar
	 */
	public function parse() {
		$data = stream_get_contents($this->handle);
		$json = json_decode($data, true);

		if ($json === null) {
			$msg  = 'JSONSubscriptionReader: User Error: ';
			$msg .= 'Could not decode json string.';
			throw new ReaderException($msg);
		}

		if ($this->isUserDataACollection($json)) {
			$object = $this->parseCollection($json);
		} else {
			$object = $this->parseSingleEntity($json);
		}

		return $this->setObject($object);
	}


	/**
	 * @brief overwrite values that should not be set by user with null
	 */
	public function sanitize() {
		if ($this->object === null) {
			$this->parse();
		}

		$sanitize = array(
			'userId',
		);

		return parent::nullProperties($sanitize);
	}


	/**
	 * @brief check if $this->data is a collection
	 * @param array $json
	 * @return boolean
	 */
	private function isUserDataACollection($json) {
		if (array_key_exists(0, $json) && is_array($json[0])) {
			return true;
		}

		return false;
	}


	/**
	 * @brief parse a json calendar collection
	 * @param array $data
	 * @return \OCA\Calendar\Db\CalendarCollection
	 */
	private function parseCollection($data) {
		$collection = new SubscriptionCollection();

		foreach($data as $singleEntity) {
			try {
				$calendar = $this->parseSingleEntity($singleEntity);
				$collection->add($calendar);
			} catch(ReaderException $ex) {
				//TODO - log error message
				continue;
			}
		}

		return $collection;
	}


	/**
	 * @brief parse a json calendar
	 * @param array $data
	 * @return \OCA\Calendar\Db\Subscription
	 */
	private function parseSingleEntity($data) {
		$calendar = new Subscription();

		foreach($data as $key => $value) {
			$setter = 'set' . ucfirst($key);

			switch($key) {
				case 'type':
				case 'url':
				case 'userid':
					$calendar->$setter(strval($value));
					break;

				default:
					break;
			}
		}

		return $calendar;
	}
}