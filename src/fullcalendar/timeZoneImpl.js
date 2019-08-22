/**
 * @copyright Copyright (c) 2018 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { NamedTimeZoneImpl, registerNamedTimeZoneImpl } from 'fullcalendar'
import getTimezoneManager from '../services/timezoneDataProviderService'

/**
 * Our own Fullcalendar Timezone implementation based on the VTimezones we ship
 */
class VTimezoneNamedTimezone extends NamedTimeZoneImpl {

	/**
	 * gets UTC offset for given date of this timezone
	 *
	 * @param {Number[]} date an array that mirrors the parameters from new Date()
	 * @returns {Number} offset in minutes
	 */
	offsetForArray([year, month, day, hour, minute, second]) {
		const timezone = getTimezoneManager().getTimezoneForId(this.name)
		month += 1

		return timezone.offsetForArray(year, month, day, hour, minute, second) / 60
	}

	/**
	 * returns parameters for Date object in this timezone based on given timestamp
	 *
	 * @param {Number[]} ms Timestamp in milliseconds
	 * @returns {Number[]}
	 */
	timestampToArray(ms) {
		const timezone = getTimezoneManager().getTimezoneForId(this.name)
		const timestampArray = timezone.timestampToArray(ms)
		timestampArray[1]--

		return timestampArray
	}

}

registerNamedTimeZoneImpl('vtimezone-timezone', VTimezoneNamedTimezone)
