/**
 * @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @author Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @license AGPL-3.0-or-later
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

import { generateUrl } from '@nextcloud/router'
import { getEmptySlots } from '@nextcloud/calendar-availability-vue'

/** @class */
export default class AppointmentConfig {

	/** @member {?number} */
	id

	/** @member {?string} */
	token

	/** @member {string} */
	name

	/** @member {string} */
	description

	/** @member {string} */
	location

	/** @member {string} */
	visibility

	/** @member {string} */
	targetCalendarUri

	/** @member {Object} */
	availability

	/** @member {number} */
	length

	/** @member {number} */
	increment

	/** @member {number} */
	preparationDuration

	/** @member {number} */
	followupDuration

	/** @member {number} */
	timeBeforeNextSlot

	/** @member {?number} */
	dailyMax

	/** @member {?string[]} */
	freebusyUris

	/**
	 * Create a new AppointmentConfig from the given plain object data
	 *
	 * @param {object} data Appointment config data to construct an instance from
	 * @param {?number} data.id Id
	 * @param {?string} data.token Token
	 * @param {string} data.name Name
	 * @param {string} data.description Description
	 * @param {string} data.location Location
	 * @param {string} data.visibility Visibility
	 * @param {string} data.targetCalendarUri Target calendar URI
	 * @param {Object} data.availability Availability
	 * @param {number} data.length Length in seconds
	 * @param {number} data.increment Increment in seconds
	 * @param {number} data.preparationDuration Preparation duration in seconds
	 * @param {number} data.followupDuration Followup duration in seconds
	 * @param {number} data.timeBeforeNextSlot Time before next slot in seconds
	 * @param {?number} data.dailyMax Max daily slots
	 * @param {?string[]} data.freebusyUris FreeBusy URIs
	 */
	constructor(data) {
		data ??= {}
		this.id = data.id
		this.token = data.token
		this.name = data.name
		this.description = data.description
		this.location = data.location
		this.visibility = data.visibility
		this.targetCalendarUri = data.targetCalendarUri
		this.availability = data.availability
		this.length = tryParseInt(data.length) ?? 0
		this.increment = tryParseInt(data.increment) ?? 0
		this.preparationDuration = tryParseInt(data.preparationDuration)
		this.followupDuration = tryParseInt(data.followupDuration)
		this.timeBeforeNextSlot = tryParseInt(data.timeBeforeNextSlot)
		this.dailyMax = tryParseInt(data.dailyMax)
		this.freebusyUris = data.freebusyUris
	}

	/**
	 * Create a default appointment config instance from the given vuex store
	 *
	 * @param {object} store The vuex store object (e.g. this.$store)
	 * @return {AppointmentConfig} Default appointment config instance
	 */
	static createDefault(store) {
		// Set default availability to Mo-Fr 9-5
		// TODO: fetch user's working hours if possible
		const tsAtTime = (hours, minutes) => Math.round((new Date()).setHours(hours, minutes, 0, 0) / 1000)
		const slots = getEmptySlots();
		['MO', 'TU', 'WE', 'TH', 'FR'].forEach(day => slots[day].push({
			start: tsAtTime(9, 0),
			end: tsAtTime(17, 0),
		}))

		return new AppointmentConfig({
			name: '',
			description: '',
			location: '',
			targetCalendarUri: store.getters.sortedCalendars[0].url,
			availability: {
				timezoneId: store.getters.getResolvedTimezone,
				slots,
			},
			visibility: 'PUBLIC',
			length: 5 * 60,
			increment: 15 * 60,
			preparationDuration: 0,
			followupDuration: 0,
			timeBeforeNextSlot: 0,
			freebusyUris: [],
		})

	}

	/**
	 * Clone this instance
	 *
	 * @return {AppointmentConfig} A cloned version of this instance
	 */
	clone() {
		return AppointmentConfig.fromJSON(JSON.stringify(this))
	}

	/**
	 * Parse a JSON string into a new AppointmentConfig instance
	 *
	 * @param {string} jsonString The JSON string to parse
	 * @return {AppointmentConfig} New instance parsed from given JSON string
	 */
	static fromJSON(jsonString) {
		return new AppointmentConfig(JSON.parse(jsonString))
	}

	/**
	 * Get the absolute booking URL of this instance
	 *
	 * @return {string} Absolute URL
	 */
	get bookingUrl() {
		const baseUrl = `${window.location.protocol}//${window.location.hostname}`
		const relativeUrl = generateUrl('/apps/calendar/appointment/{token}', {
			token: this.token,
		})
		return baseUrl + relativeUrl
	}

}

/**
 * Try to parse an int from the given value or return undefined
 *
 * @param {string|number|null|undefined} value The value to parse
 * @return {number|undefined} Parsed number or undefined
 */
function tryParseInt(value) {
	if (value === null || value === undefined) {
		return undefined
	}

	return parseInt(value)
}
