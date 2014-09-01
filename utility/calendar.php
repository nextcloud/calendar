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
namespace OCA\Calendar\Utility;

class CalendarUtility extends Utility{

	/**
	 * suggest a new uri
	 * @param string $calendarURI
	 * @return string $calendarURI
	 */
	public static function suggestURI($calendarURI) {
		if (substr_count($calendarURI, '-') === 0) {
			$calendarURI .= '-1';
		} else {
			$positionLastDash = strrpos($calendarURI, '-');
			$firstPart = substr($calendarURI, 0, $positionLastDash);
			$lastPart = substr($calendarURI, $positionLastDash + 1);
			$pattern = '/^\d+$/';
			if (preg_match($pattern, $lastPart)) {
				$lastPart = (int) $lastPart;
				$lastPart++;
				$calendarURI = $firstPart . '-' . $lastPart;
			} else {
				if (substr($calendarURI, -1, 1) === '-') {
					$calendarURI .= '1';
				} else {
					$calendarURI .= '-1';
				}
			}
		}
		return $calendarURI;
	}
}