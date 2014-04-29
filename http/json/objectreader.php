<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

use \OCA\Calendar\Sabre\VObject\Reader;
use \OCA\Calendar\Sabre\VObject\ParseException;
use \OCA\Calendar\Sabre\VObject\EofException;

use \OCA\Calendar\Db\Object;
use \OCA\Calendar\Db\ObjectCollection;

use \OCA\Calendar\Utility\SabreUtility;

use \OCA\Calendar\Sabre\Splitter\JCalendar;

class JSONObjectReader extends JSONReader {

	/**
	 * @brief parse json object
	 * @return $this
	 */
	public function parse() {
		try {
			$data = $this->handle;
			$objectCollection = new ObjectCollection();

			$splitter = new JCalendar($data);
			while($vobject = $splitter->getNext()) {
				SabreUtility::removeXOCAttrFromComponent($vobject);
				$object = new Object();
				$object->fromVObject($vobject);
				$objectCollection->add($object);
			}

			if ($objectCollection->count() === 1) {
				$object = $objectCollection->reset();
			} else {
				$object = $objectCollection;
			}

			return $this->setObject($object);
		} catch(ParseException $ex) {
			throw new ReaderException($ex->getMessage(), $ex->getCode(), $ex);
		} catch(EofException $ex) {
			throw new ReaderException($ex->getMessage(), $ex->getCode(), $ex);
		}
	}
}