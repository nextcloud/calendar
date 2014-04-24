<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

require_once(__DIR__ . '/../../3rdparty/VObject/includes.php');

use \OCA\Calendar\Db\Object;
use \OCA\Calendar\Db\ObjectCollection;

use \OCA\Calendar\VObject\Splitter\ICalendar;
use \OCA\Calendar\Sabre\VObject\Reader;
use \OCA\Calendar\Sabre\VObject\ParseException;
use \OCA\Calendar\Sabre\VObject\EofException;

use \OCA\Calendar\Utility\SabreUtility;

class JSONObjectReader extends JSONReader {

	/**
	 * @brief parse json object
	 */
	public function parse() {
		try {
			$data = $this->getData();

			$vcalendar = Reader::readJson($data);
			$uniqueUIDs = SabreUtility::countUniqueUIDs($vcalendar);
			$isCollection = ($uniqueUIDs !== 1);

			if ($isCollection) {
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


	public function sanitize(){
		return $this;
	}
}