<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

class JSONObject extends JSON {

	/**
	 * @brief get json-encoded string containing all information
	 */
	public function serialize($convenience=true) {
		$vcalendar = $this->object->getVObject();

		if($convenience === true) {
			JSONUtility::addConvenience($vcalendar);
		}

		return $vcalendar->jsonSerialize();
	}
}