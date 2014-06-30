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
namespace OCA\Calendar\Http\JSON;

use OCA\Calendar\Http\Reader;
use OCA\Calendar\Sabre\VObject\ParseException;
use OCA\Calendar\Db\Object;
use OCA\Calendar\Db\ObjectCollection;
use OCA\Calendar\Http\ReaderException;
use OCA\Calendar\Utility\SabreUtility;
use OCA\Calendar\Sabre\VObject\Component\VCalendar;
use OCA\Calendar\Sabre\Splitter\JCalendar;

class JSONObjectReader extends Reader {

	/**
	 * parse json object
	 * @throws ReaderException
	 * @return $this
	 */
	public function parse() {
		try {
			$data = $this->handle;
			$objectCollection = new ObjectCollection();

			$splitter = new JCalendar($data);
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
				$object = $objectCollection->reset();
			} else {
				$object = $objectCollection;
			}

			$this->setObject($object);
		} catch(ParseException $ex) {
			throw new ReaderException($ex->getMessage(), $ex->getCode(), $ex);
		}
	}
}