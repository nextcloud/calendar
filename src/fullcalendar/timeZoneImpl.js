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
import { getTimezone } from '../services/timezoneDataProviderService'
import ICAL from 'ical.js'

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
		const timezone = getTimezone(this.name)
		month += 1
		const time = new ICAL.Time({ year, month, day, hour, minute, second, isDate: false })

		// TODO - all these operations require complex RRULE expansion for DST / Standard
		// this function is called dozens of dozens of times, result should probably be cached

		console.debug(timezone.utcOffset(time) / 60)
		return timezone.utcOffset(time) / 60
	}

	/**
	 * returns parameters for Date object in this timezone based on given timestamp
	 *
	 * @param {Number[]} ms Timestamp in milliseconds
	 * @returns {Number[]}
	 */
	timestampToArray(ms) {
		const timezone = getTimezone(this.name)
		const time = ICAL.Time.fromData({ year: 1970, month: 1, day: 1, hour: 0, minute: 0, second: 0 }) // just create a dummy object because fromUnixTime is not exposed on ICAL.Time
		time.fromUnixTime(Math.floor(ms / 1000))
		const local = time.convertToZone(timezone)

		// TODO - all these operations require complex RRULE expansion for DST / Standard
		// this function is called dozens of dozens of times, result should probably be cached

		console.debug([local.year, local.month - 1, local.day, local.hour, local.minute, local.second, 0])
		return [local.year, local.month - 1, local.day, local.hour, local.minute, local.second, 0]
	}

}

registerNamedTimeZoneImpl('vtimezone-timezone', VTimezoneNamedTimezone)
