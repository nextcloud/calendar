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

use OCA\Calendar\VObject\Splitter\ICalendar;

class JSONObjectReader {

	/**
	 * @brief parse json object
	 */
	public function parse() {
		try {
			$data = $this->getData();

			$vcalendar = Reader::readJson($data);
			$uniqueUIDs = SabreUtility::countUniqueUIDs($vcalendar);
			$isCollection = ($uniqueUIDs !== 1);

			if($isCollection) {
				$singleObjects = SabreUtility::splitByUID($vcalendar);
				$collection = new ObjectCollection($singleObjects);
				$this->setObject($collection);
			} else {
				$object = new Object($vcalendar);
				$this->setObject($object);
			}
			return $this;
		} catch(/* some */Exception $e) {
			throw new JSONObjectReaderException($ex->getMessage());
		}
	}
}