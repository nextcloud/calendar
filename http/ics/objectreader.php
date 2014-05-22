<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\ICS;

use OCA\Calendar\Sabre\VObject\Splitter\ICalendar;

use OCA\Calendar\Db\Object;
use OCA\Calendar\Db\ObjectCollection;
use OCA\Calendar\Http\ReaderException;
use OCA\Calendar\Utility\SabreUtility;

class ICSObjectReader extends ICSReader {

	/**
	 * @brief parse data
	 */
	public function parse() {
		try{
			$objectCollection = new ObjectCollection();

			$splitter = new ICalendar($this->handle);
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
		} catch(\Exception $ex /* What exception is being thrown??? */) {
			throw new ReaderException($ex->getMessage());
		}
	}

	protected function fixData() {/*
		$data = $this->getData();

		//fix malformed timestamp in some google calendar events
		//originally contributed by nezzi@github
		$data = str_replace('CREATED:00001231T000000Z', 'CREATED:19700101T000000Z', $data);

		//add some more fixes over time

		$this->setData($data);*/
	}
}