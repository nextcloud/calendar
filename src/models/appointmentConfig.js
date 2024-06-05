/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { generateUrl } from '@nextcloud/router'
import {
	getEmptySlots,
	vavailabilityToSlots,
} from '@nextcloud/calendar-availability-vue'

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

	/** @member {object} */
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

	/** @member {?number} */
	futureLimit

	/** @member {?string[]} */
	calendarFreeBusyUris

	/** @member {bool} */
	createTalkRoom

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
	 * @param {object} data.availability Availability
	 * @param {number} data.length Length in seconds
	 * @param {number} data.increment Increment in seconds
	 * @param {number} data.preparationDuration Preparation duration in seconds
	 * @param {number} data.followupDuration Followup duration in seconds
	 * @param {number} data.timeBeforeNextSlot Time before next slot in seconds
	 * @param {?number} data.dailyMax Max daily slots
	 * @param {?number} data.futureLimit Limits how far in the future appointments can be booked
	 * @param {?string[]} data.calendarFreeBusyUris URIs of calendars to check for conflicts
	 * @param {bool} data.createTalkRoom Whether a Talk room should be created
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
		this.futureLimit = tryParseInt(data.futureLimit)
		this.calendarFreeBusyUris = data.calendarFreeBusyUris
		this.createTalkRoom = data.createTalkRoom
	}

	/**
	 * Create a default appointment config instance
	 *
	 * @param {string} targetCalendarUri
	 * @param {ScheduleInbox} scheduleInbox
	 * @param {string} timezoneId fallback time zone when no schedule inbox availability is set
	 * @return {AppointmentConfig} Default appointment config instance
	 */
	static createDefault(targetCalendarUri, scheduleInbox, timezoneId) {
		let slots = getEmptySlots()
		if (scheduleInbox && scheduleInbox.availability) {
			const converted = vavailabilityToSlots(scheduleInbox.availability)
			slots = converted.slots
			timezoneId = converted.timezoneId ?? timezoneId
		} else {
			// Set default availability to Mo-Fr 9-5
			const tsAtTime = (hours, minutes) => Math.round((new Date()).setHours(hours, minutes, 0, 0) / 1000);
			['MO', 'TU', 'WE', 'TH', 'FR'].forEach(day => slots[day].push({
				start: tsAtTime(9, 0),
				end: tsAtTime(17, 0),
			}))
		}

		return new AppointmentConfig({
			name: '',
			description: '',
			location: '',
			targetCalendarUri,
			availability: {
				timezoneId,
				slots,
			},
			visibility: 'PRIVATE',
			length: 5 * 60,
			increment: 15 * 60,
			preparationDuration: 0,
			followupDuration: 0,
			timeBeforeNextSlot: 0,
			calendarFreeBusyUris: [],
			futureLimit: 2 * 30 * 24 * 60 * 60, // 2 months
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
