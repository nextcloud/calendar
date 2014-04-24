<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

class JSONObjectCollection extends JSONCollection {

	/**
	 * @brief get headers for response
	 * @return array
	 */
	public function getHeaders() {
		return array_merge(
			parent::getHeaders(),
			array(
				'Content-type' => 'application/calendar+json; charset=utf-8',
			)
		);
	}

	/**
	 * @brief get json-encoded string containing all information
	 * @return mixed (null|array)
	 */
	public function serialize($convenience=true) {
		//if the collection does not contain any object,
		//return the http 204 no content status code
		if ($this->object->count() === 0) {
			return null;
		}

		$vcalendar = $this->object->getVObject();

		/*ObjectUtility::addMissingVTimezones(
			$vcalendar,
			$this->app->query('TimezoneMapper')
		);*/

		return $vcalendar->jsonSerialize();
	}
}