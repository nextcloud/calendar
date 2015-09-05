<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\ICS;

class ICSObjectCollection extends ICSCollection {

	/**
	 * @brief get json-encoded string containing all information
	 */
	public function serialize($convenience=true) {
		$vcalendar = $this->collection->getVObject();

		if($convenience === true) {
			JSONUtility::addConvenience($vcalendar);
		}

		return $vcalendar->serialize();
	}
}