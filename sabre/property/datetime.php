<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\SabreProperty;

use \OCA\Calendar\Sabre\VObject\Property;
use \OCA\Calendar\Sabre\VObject\Parameter;

class DateTime extends \OCA\Calendar\Sabre\VObject\Property\ICalendar\DateTime {

	public function jsonSerialize() {
		$dateTime = $this->getDateTime();
		$this->add('X-OC-RFC8601', $dateTime->format(\DateTime::ISO8601));
		return parent::jsonSerialize();
	}

}