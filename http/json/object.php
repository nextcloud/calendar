<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

use \OCA\Calendar\Utility\JSONUtility;

class JSONObject extends JSON {

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
	 * @return array
	 */
	public function serialize($convenience=true) {
		$vcalendar = $this->object->getVObject();
		return $vcalendar->jsonSerialize();
	}
}