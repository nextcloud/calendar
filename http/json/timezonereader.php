<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

use OCA\Calendar\Db\Object;
use OCA\Calendar\Db\ObjectCollection;

class JSONTimezoneReader {

	/**
	 * @brief parse json object
	 */
	public function parse() {
		try {
			$data = $this->getData();

			$vcalendar = Reader::readJson($data);
			$numberTimezones = SabreUtility::countTimezones($vcalendar);
			$isCollection = ($numberTimezones > 1);

			if($isCollection) {
				$object = new TimezoneCollection($vcalendar);
			} else {
				$object = new Timezone($vcalendar);
			}

			$this->setObject($object);

			return $this;
		} catch(/* some */Exception $e) {
			throw new JSONObjectReaderException($ex->getMessage());
		}
	}
}