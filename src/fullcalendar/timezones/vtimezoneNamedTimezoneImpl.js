/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { createPlugin } from '@fullcalendar/core'
import { NamedTimeZoneImpl } from '@fullcalendar/core/internal'
import getTimezoneManager from '../../services/timezoneDataProviderService.js'
import logger from '../../utils/logger.js'

/**
 * Our own FullCalendar Timezone implementation based on the VTimezones we ship
 */
class VTimezoneNamedTimezone extends NamedTimeZoneImpl {

	/**
	 * gets UTC offset for given date of this timezone
	 *
	 * @param {number[]} date an array that mirrors the parameters from new Date()
	 * @return {number} offset in minutes
	 */
	offsetForArray([year, month, day, hour, minute, second]) {
		let timezone = getTimezoneManager().getTimezoneForId(this.timeZoneName)
		if (!timezone) {
			timezone = getTimezoneManager().getTimezoneForId('UTC')
			logger.error(`VTimezoneNamedTimezoneImpl: Timezone ${this.timeZoneName} not found, falling back to UTC.`)
		}
		// calendar-js works with natural month numbers,
		// not the javascript 0-based ones
		month += 1

		return timezone.offsetForArray(year, month, day, hour, minute, second) / 60
	}

	/**
	 * returns parameters for Date object in this timezone based on given timestamp
	 *
	 * @param {number} ms Timestamp in milliseconds
	 * @return {number[]}
	 */
	timestampToArray(ms) {
		let timezone = getTimezoneManager().getTimezoneForId(this.timeZoneName)
		if (!timezone) {
			timezone = getTimezoneManager().getTimezoneForId('UTC')
			logger.error(`VTimezoneNamedTimezoneImpl: Timezone ${this.timeZoneName} not found, falling back to UTC.`)
		}
		const timestampArray = timezone.timestampToArray(ms)

		// calendar-js works with natural month numbers,
		// not the javascript 0-based ones
		timestampArray[1]--

		return timestampArray
	}

}

export default createPlugin({
	name: '@nextcloud/v-timezone-named-timezone-plugin',
	namedTimeZonedImpl: VTimezoneNamedTimezone,
})
