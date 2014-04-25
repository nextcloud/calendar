<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

require_once(__DIR__ . '/../../3rdparty/VObject/includes.php');

use \OCA\Calendar\Sabre\VObject\Reader;
use \OCA\Calendar\Sabre\VObject\ParseException;
use \OCA\Calendar\Sabre\VObject\EofException;

use \OCA\Calendar\Db\Object;
use \OCA\Calendar\Db\ObjectCollection;

use \OCA\Calendar\Utility\SabreUtility;

class JSONObjectReader extends JSONReader {

	/**
	 * @brief parse json object
	 * @return $this
	 */
	public function parse() {
		try {
			$data = $this->getData();

			$vcalendar = Reader::readJson($data);
			$uniqueUIDs = SabreUtility::countUniqueUIDs($vcalendar);

			if ($uniqueUIDs === 1) {
				$object = new Object($vcalendar);
			} else {
				$singleObjects = SabreUtility::splitByUID($vcalendar);
				$object = new ObjectCollection($singleObjects);
			}

			return $this->setObject($object);
		} catch(ParseException $ex) {
			throw new ReaderException($ex->getMessage(), $ex->getCode(), $ex);
		} catch(EofException $ex) {
			throw new ReaderException($ex->getMessage(), $ex->getCode(), $ex);
		}
	}
}