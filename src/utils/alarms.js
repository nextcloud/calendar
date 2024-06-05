/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { AttendeeProperty, Property } from '@nextcloud/calendar-js'
import { translate as t } from '@nextcloud/l10n'

/**
 * Get the factor for a given unit
 *
 * @param {string} unit The name of the unit to get the factor of
 * @return {number}
 */
export function getFactorForAlarmUnit(unit) {
	switch (unit) {
	case 'seconds':
		return 1

	case 'minutes':
		return 60

	case 'hours':
		return 60 * 60

	case 'days':
		return 24 * 60 * 60

	case 'weeks':
		return 7 * 24 * 60 * 60

	default:
		return 1
	}
}

/**
 * Gets the amount of days / weeks, unit from total seconds
 *
 * @param {number} totalSeconds Total amount of seconds
 * @return {{amount: number, unit: string}}
 */
export function getAmountAndUnitForTimedEvents(totalSeconds) {
	// Before or after the event is handled somewhere else,
	// so make sure totalSeconds is positive
	totalSeconds = Math.abs(totalSeconds)

	// Handle the special case of 0, so we don't show 0 weeks
	if (totalSeconds === 0) {
		return {
			amount: 0,
			unit: 'minutes',
		}
	}

	if (totalSeconds % (7 * 24 * 60 * 60) === 0) {
		return {
			amount: totalSeconds / (7 * 24 * 60 * 60),
			unit: 'weeks',
		}
	}
	if (totalSeconds % (24 * 60 * 60) === 0) {
		return {
			amount: totalSeconds / (24 * 60 * 60),
			unit: 'days',
		}
	}
	if (totalSeconds % (60 * 60) === 0) {
		return {
			amount: totalSeconds / (60 * 60),
			unit: 'hours',
		}
	}
	if (totalSeconds % (60) === 0) {
		return {
			amount: totalSeconds / (60),
			unit: 'minutes',
		}
	}

	return {
		amount: totalSeconds,
		unit: 'seconds',
	}
}

/**
 * Get the total amount of seconds based on amount and unit for timed events
 *
 * @param {number} amount Amount of unit
 * @param {string} unit Minutes/Hours/Days/Weeks
 * @param {boolean=} isBefore Whether the reminder is before or after the event
 * @return {number}
 */
export function getTotalSecondsFromAmountAndUnitForTimedEvents(amount, unit, isBefore = true) {
	return amount * getFactorForAlarmUnit(unit) * (isBefore ? -1 : 1)
}

/**
 * Gets the amount of days / weeks, unit, hours and minutes from total seconds
 *
 * @param {number} totalSeconds Total amount of seconds
 * @return {{amount: *, unit: *, hours: *, minutes: *}}
 */
export function getAmountHoursMinutesAndUnitForAllDayEvents(totalSeconds) {
	const dayFactor = getFactorForAlarmUnit('days')
	const hourFactor = getFactorForAlarmUnit('hours')
	const minuteFactor = getFactorForAlarmUnit('minutes')
	const isNegative = totalSeconds < 0
	totalSeconds = Math.abs(totalSeconds)

	let dayPart = Math.floor(totalSeconds / dayFactor)
	const hourPart = totalSeconds % dayFactor

	if (hourPart !== 0) {
		if (isNegative) {
			dayPart++
		}
	}

	let amount = 0
	let unit = null
	if (dayPart === 0) {
		unit = 'days'
	} else if (dayPart % 7 === 0) {
		amount = dayPart / 7
		unit = 'weeks'
	} else {
		amount = dayPart
		unit = 'days'
	}

	let hours = Math.floor(hourPart / hourFactor)
	const minutePart = hourPart % hourFactor
	let minutes = Math.floor(minutePart / minuteFactor)

	if (isNegative) {
		hours = 24 - hours

		if (minutes !== 0) {
			hours--
			minutes = 60 - minutes
		}
	}

	return {
		amount,
		unit,
		hours,
		minutes,
	}
}

/**
 * Get the total amount of seconds for all-day events
 *
 * @param {number} amount amount of unit
 * @param {number} hours Time of reminder
 * @param {number} minutes Time of reminder
 * @param {string} unit days/weeks
 * @return {number}
 */
export function getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(amount, hours, minutes, unit) {
	if (unit === 'weeks') {
		amount *= 7
		unit = 'days'
	}

	// 0 is on the same day of the all-day event => positive
	// 1 ... n before the event is negative
	const isNegative = amount > 0

	if (isNegative) {
		// If it's negative, we need to subtract one day
		amount--
		// Convert days to seconds
		amount *= getFactorForAlarmUnit(unit)

		let invertedHours = 24 - hours
		let invertedMinutes = 0

		if (minutes !== 0) {
			invertedHours--
			invertedMinutes = 60 - minutes
		}

		amount += (invertedHours * getFactorForAlarmUnit('hours'))
		amount += (invertedMinutes * getFactorForAlarmUnit('minutes'))

		amount *= -1
	} else {
		// Convert days to seconds
		amount *= getFactorForAlarmUnit('days')

		amount += (hours * getFactorForAlarmUnit('hours'))
		amount += (minutes * getFactorForAlarmUnit('minutes'))
	}

	return amount
}

/**
 * Propagate data from an event component to all EMAIL alarm components.
 * An alarm component must contain a description, summary and all attendees to be notified.
 * We don't have a separate UI for maintaining attendees of an alarm, so we just copy them from the event.
 *
 * https://www.rfc-editor.org/rfc/rfc5545#section-3.6.6
 *
 * @param {AbstractRecurringComponent} eventComponent
 */
export function updateAlarms(eventComponent) {
	for (const alarmComponent of eventComponent.getAlarmIterator()) {
		if (alarmComponent.action !== 'EMAIL' && alarmComponent.action !== 'DISPLAY') {
			continue
		}

		alarmComponent.deleteAllProperties('SUMMARY')
		const summaryProperty = eventComponent.getFirstProperty('SUMMARY')
		if (summaryProperty) {
			alarmComponent.addProperty(summaryProperty.clone())
		} else {
			const defaultSummary = t('calendar', 'Untitled event')
			alarmComponent.addProperty(new Property('SUMMARY', defaultSummary))
		}

		if (!alarmComponent.hasProperty('DESCRIPTION')) {
			const defaultDescription = t('calendar', 'This is an event reminder.')
			alarmComponent.addProperty(new Property('DESCRIPTION', defaultDescription))
		}

		alarmComponent.deleteAllProperties('ATTENDEE')
		for (const attendee of eventComponent.getAttendeeIterator()) {
			if (['RESOURCE', 'ROOM'].includes(attendee.userType)) {
				continue
			}

			// Only copy the email address (value) of the attendee
			alarmComponent.addProperty(new AttendeeProperty('ATTENDEE', attendee.value))
		}
	}
}
