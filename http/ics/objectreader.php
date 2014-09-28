<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
namespace OCA\Calendar\Http\ICS;

use OCA\Calendar\Sabre\VObject\Splitter\ICalendar;
use OCA\Calendar\Db\Object;
use OCA\Calendar\Db\ObjectCollection;
use OCA\Calendar\Http\Reader;
use OCA\Calendar\Http\ReaderException;
use OCA\Calendar\Sabre\VObject\Component\VCalendar;
use OCA\Calendar\Utility\SabreUtility;

class ICSObjectReader extends Reader {


	public function preParse() {/*
		$data = $this->getData();

		//fix malformed timestamp in some google calendar events
		//originally contributed by github.com/nezzi
		$data = str_replace('CREATED:00001231T000000Z', 'CREATED:19700101T000000Z', $data);

		//add some more fixes over time

		$this->setData($data);*/
	}


	/**
	 * parse data
	 */
	public function parse() {
		try{
			$objectCollection = new ObjectCollection();

			$splitter = new ICalendar($this->handle);
			while($vobject = $splitter->getNext()) {
				if (!($vobject instanceof VCalendar)) {
					continue;
				}

				SabreUtility::removeXOCAttrFromComponent($vobject);
				$object = new Object();
				$object->fromVObject($vobject);
				$objectCollection->add($object);
			}

			if ($objectCollection->count() === 1) {
				$object = $objectCollection[0];
			} else {
				$object = $objectCollection;
			}

			$this->setObject($object);
		} catch(\Exception $ex /* What exception is being thrown??? */) {
			throw new ReaderException($ex->getMessage());
		}
	}
}