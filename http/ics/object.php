<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\ICS;

use OCA\Calendar\Sabre\VObject\Reader;
use OCA\Calendar\Sabre\VObject\Component\VEvent;
use OCA\Calendar\Sabre\VObject\Component\VJournal;
use OCA\Calendar\Sabre\VObject\Component\VTodo;

use \OCA\Calendar\Db\Object;

class ICSObject extends ICS {

	/**
	 * @brief get json-encoded string containing all information
	 */
	public function serialize($convenience=true) {
		$vcalendar = $this->object->getVObject();

		if ($convenience === true) {
			JSONUtility::addConvenience($vcalendar);
		}

		return $vcalendar->serialize();
	}
}