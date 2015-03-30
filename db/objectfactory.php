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
namespace OCA\Calendar\Db;

use OCA\Calendar\CorruptDataException;

class ObjectFactory extends EntityFactory {


	/**
	 * use if data is in ical format
	 */
	const FORMAT_ICAL = 3;


	/**
	 * use if data is in jcal format
	 */
	const FORMAT_JCAL = 4;


	/**
	 * @param array $data
	 * @param int $format
	 * @return Object
	 * @throws CorruptDataException
	 */
	public function createEntity(array $data, $format=self::FORMAT_PARAM) {
		if ($format === self::FORMAT_PARAM) {
			return Object::fromParams($data);
		} elseif ($format === self::FORMAT_ROW) {
			return Object::fromRow($data);
		} else {
			//TODO - add ex msg
			throw new CorruptDataException();
		}
	}
}