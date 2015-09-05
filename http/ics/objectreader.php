<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\ICS;

use OCA\Calendar\Sabre\VObject\Reader;

class ICSObjectReader extends ICSReader {

	public function parse() {
		try{
			$this->fixData();

			$stream = fopen('php://memory','r+');
			fwrite($stream, $this->getData());
			rewind($stream);

			//TODO - does the vobject splitter support json-encoded calendar data???????
			$vcalendar = new ICalendar($stream);

			$objectCollection = new ObjectCollection();

			while($vobject = $vcalendar->next()) {
				$object = new Object();
				$object->fromVObject($vcalendar);
				$objectCollection->add($object);
			}

			if($objectCollection->count() === 1) {
				$this->setObject($objectCollection->reset()->current());
			} else {
				$this->setObject($objectCollection);
			}

			return $this;
		} catch(Exception $e /* What exception is being thrown??? */) {
			throw new JSONObjectReaderException($ex->getMessage());
		}
	}

	protected function fixData() {
		$data = $this->getData();

		//fix malformed timestamp in some google calendar events
		//originally contributed by nezzi@github
		$data = str_replace('CREATED:00001231T000000Z', 'CREATED:19700101T000000Z', $data);

		//add some more fixes over time

		$this->setData($data);
	}
}

class JSONObjectReaderException extends Exception{}