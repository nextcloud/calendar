/**
 * @copyright Copyright (c) 2019 Georg Ehrke
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
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import DurationValue from 'calendar-js/src/values/durationValue'

/**
 * Gets a calendar-js DurationValue from a FullCalendar Duration object
 *
 * @param {Object|String|Number} fcDuration Duration object provided by FullCalendar
 * @returns {DurationValue|null}
 */
export function getDurationValueFromFullCalendarDuration(fcDuration) {
	switch (typeof fcDuration) {
	case 'object':
		return getDurationValueFromFullCalendarDurationEncodedAsObject(fcDuration)

	case 'string':
		return getDurationValueFromFullCalendarDurationEncodedAsString(fcDuration)

	case 'number':
		return getDurationValueFromFullCalendarDurationEncodedAsNumber(fcDuration)

	default:
		return null
	}
}

/**
 * Gets a FullCalendar Duration object from a calendar-js DurationValue object
 *
 * @param {DurationValue} durationValue calendar-js object
 * @returns {{seconds: {Number}}}
 */
export function getFullCalendarDurationFromDurationValue(durationValue) {
	return {
		seconds: durationValue.totalSeconds
	}
}

/**
 * Gets a calendar-js DurationValue from a FullCalendar Duration object
 *
 * @param {Object} fcDuration The FullCalendar duration encoded as String
 * @returns {DurationValue}
 */
function getDurationValueFromFullCalendarDurationEncodedAsObject(fcDuration) {
	if (fcDuration.year || fcDuration.years || fcDuration.month || fcDuration.months) {
		return null
	}

	const durations = []
	if (fcDuration.days) {
		durations.push(DurationValue.fromData({
			days: fcDuration.days
		}))
	}
	if (fcDuration.day) {
		durations.push(DurationValue.fromData({
			days: fcDuration.day
		}))
	}
	if (fcDuration.minutes) {
		durations.push(DurationValue.fromData({
			minutes: fcDuration.minutes
		}))
	}
	if (fcDuration.minute) {
		durations.push(DurationValue.fromData({
			minutes: fcDuration.minute
		}))
	}
	if (fcDuration.seconds) {
		durations.push(DurationValue.fromData({
			seconds: fcDuration.seconds
		}))
	}
	if (fcDuration.second) {
		durations.push(DurationValue.fromData({
			seconds: fcDuration.second
		}))
	}
	if (fcDuration.milliseconds) {
		durations.push(DurationValue.fromData({
			seconds: Math.floor(fcDuration.milliseconds / 1000)
		}))
	}
	if (fcDuration.millisecond) {
		durations.push(DurationValue.fromData({
			seconds: Math.floor(fcDuration.millisecond / 1000)
		}))
	}
	if (fcDuration.ms) {
		durations.push(DurationValue.fromData({
			seconds: Math.floor(fcDuration.ms / 1000)
		}))
	}

	const duration = DurationValue.fromSeconds(0)
	for (const d of durations) {
		duration.addDuration(d)
	}

	return duration
}

/**
 * Gets a calendar-js DurationValue from a FullCalendar Duration string
 *
 * @param {String} fcDuration The FullCalendar duration encoded as String
 * @returns {DurationValue}
 */
function getDurationValueFromFullCalendarDurationEncodedAsString(fcDuration) {
	const match1 = fcDuration.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/)
	if (match1) {
		const [, hours, minutes, seconds] = match1

		return DurationValue.fromData({
			hours: parseInt(hours, 10),
			minutes: parseInt(minutes, 10),
			seconds: parseInt(seconds, 10)
		})
	}

	const match2 = fcDuration.match(/(\d{2}):(\d{2}):(\d{2})/)
	if (match2) {
		const [, hours, minutes, seconds] = match2

		return DurationValue.fromData({
			hours: parseInt(hours, 10),
			minutes: parseInt(minutes, 10),
			seconds: parseInt(seconds, 10)
		})
	}

	const match3 = fcDuration.match(/(\d{2}):(\d{2})/)
	if (match3) {
		const [, hours, minutes] = match3

		return DurationValue.fromData({
			hours: parseInt(hours, 10),
			minutes: parseInt(minutes, 10),
		})
	}

	return null
}

/**
 * Gets a calendar-js DurationValue from a FullCalendar Duration number
 *
 * @param {Number} fcDuration The FullCalendar duration encoded as Number
 * @returns {DurationValue}
 */
function getDurationValueFromFullCalendarDurationEncodedAsNumber(fcDuration) {
	return DurationValue.fromSeconds(Math.floor(fcDuration / 1000))
}
