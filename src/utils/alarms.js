/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { AttendeeProperty, Property } from '@nextcloud/calendar-js'
import { translate as t } from '@nextcloud/l10n'
import useCalendarObjectInstanceStore from '../store/calendarObjectInstance.js'
import useCalendarsStore from '../store/calendars.js'
import useSettingsStore from '../store/settings.js'
import { isAfterVersion } from './nextcloudVersion.ts'

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
 * Preferred resolver for default alarms when creating or updating an event.
 * On NC35+, returns the normalized plural lists on the calendar model (DISPLAY/EMAIL).
 * On NC34, wraps the legacy single-int reminder as one DISPLAY alarm.
 *
 * @param {object} data The destructuring object
 * @param {object|undefined} data.calendar The selected calendar
 * @param {boolean} data.isAllDay Whether the event is all-day
 * @return {import('../types/calendar.ts').DefaultCalendarAlarm[]}
 */
export function getDefaultAlarmsForEvent({ calendar, isAllDay }) {
	if (isAfterVersion(35) && calendar) {
		const alarms = isAllDay ? calendar.defaultAlarmsFullDay : calendar.defaultAlarmsPartDay
		return Array.isArray(alarms) ? [...alarms] : []
	}

	const legacyReminder = getDefaultReminderForEvent({ calendar, isAllDay })
	if (legacyReminder === null || isNaN(legacyReminder)) {
		return []
	}

	return [{ trigger: legacyReminder, action: 'DISPLAY' }]
}

/**
 * Updates or creates the default alarms for an event.
 * When no default alarms exist yet, they are only created for newly constructed instances
 * passed in by the caller.
 *
 * @param {string} calendarId The ID of the calendar to update the default alarms from
 * @param {object} calendarObjectInstance The calendar object instance to update
 */
export function updateDefaultAlarm(calendarId, calendarObjectInstance) {
	const calendarObjectInstanceStore = useCalendarObjectInstanceStore()
	const calendarsStore = useCalendarsStore()
	const calendar = calendarsStore.getCalendarById(calendarId)

	if (!calendar || !calendarObjectInstance) {
		console.error('Missing calendar or calendar object instance to update default alarm for.')
		return
	}

	const defaultAlarms = getDefaultAlarmsForEvent({
		calendar,
		isAllDay: calendarObjectInstance.isAllDay,
	})

	if (defaultAlarms.length === 0) {
		return
	}

	const existingDefaultAlarms = calendarObjectInstance.alarms.filter(
		(alarm) => alarm.alarmComponent.getFirstPropertyFirstValue('X-NC-DEFAULT-ALARM'),
	)

	if (existingDefaultAlarms.length > 0) {
		for (const alarm of existingDefaultAlarms) {
			calendarObjectInstanceStore.removeAlarmFromCalendarObjectInstance({
				calendarObjectInstance,
				alarm,
			})
		}

		for (const { trigger, action } of defaultAlarms) {
			calendarObjectInstanceStore.addAlarmToCalendarObjectInstance({
				calendarObjectInstance,
				type: action,
				totalSeconds: trigger,
				isDefault: true,
			})
		}
		return
	}

	// Only create missing default alarms for newly constructed event instances,
	// or the active editor instance while composing a new unsaved event (calendar switch).
	const isPreStoreInstance = calendarObjectInstance !== calendarObjectInstanceStore.calendarObjectInstance
	const isNewEditorInstance = calendarObjectInstanceStore.isNew
		&& calendarObjectInstance === calendarObjectInstanceStore.calendarObjectInstance

	if (isPreStoreInstance || isNewEditorInstance) {
		for (const { trigger, action } of defaultAlarms) {
			calendarObjectInstanceStore.addAlarmToCalendarObjectInstance({
				calendarObjectInstance,
				type: action,
				totalSeconds: trigger,
				isDefault: true,
			})
		}
	}
}

/**
 * Legacy resolver: single default reminder in seconds (DISPLAY only).
 * Reads calendar DAV int defaults (NC34+) then global user settings.
 *
 * @deprecated Use {@link getDefaultAlarmsForEvent} instead. Kept exported for backwards compatibility.
 *
 * @param {object} data The destructuring object
 * @param {object|undefined} data.calendar The selected calendar
 * @param {boolean} data.isAllDay Whether the event is all-day
 * @return {number|null}
 */
export function getDefaultReminderForEvent({ calendar, isAllDay }) {
	const settingsStore = useSettingsStore()

	if (isAfterVersion(34) && calendar) {
		if (isAllDay && calendar.dav.defaultAlarmFullDay !== undefined) {
			return calendar.dav.defaultAlarmFullDay
		}

		if (!isAllDay && calendar.dav.defaultAlarmPartDay !== undefined) {
			return calendar.dav.defaultAlarmPartDay
		}
	}

	const globalDefaultReminder = parseInt(isAllDay ? settingsStore.defaultReminderFullDay : settingsStore.defaultReminderPartDay)
	if (!isNaN(globalDefaultReminder)) {
		return globalDefaultReminder
	}

	const legacyDefaultReminder = parseInt(settingsStore.defaultReminder)
	return isNaN(legacyDefaultReminder) ? null : legacyDefaultReminder
}

/**
 * Propagate data from an event component to its DISPLAY and EMAIL alarm components.
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

		if (!alarmComponent.hasProperty('DESCRIPTION')) {
			const defaultDescription = t('calendar', 'This is an event reminder.')
			alarmComponent.addProperty(new Property('DESCRIPTION', defaultDescription))
		}

		// Clear properties that are only valid on EMAIL alarms.
		alarmComponent.deleteAllProperties('SUMMARY')
		alarmComponent.deleteAllProperties('ATTENDEE')

		if (alarmComponent.action !== 'EMAIL') {
			continue
		}

		const summaryProperty = eventComponent.getFirstProperty('SUMMARY')
		if (summaryProperty) {
			alarmComponent.addProperty(summaryProperty.clone())
		} else {
			const defaultSummary = t('calendar', 'Untitled event')
			alarmComponent.addProperty(new Property('SUMMARY', defaultSummary))
		}

		for (const attendee of eventComponent.getAttendeeIterator()) {
			if (['RESOURCE', 'ROOM'].includes(attendee.userType)) {
				continue
			}

			// Only copy the email address (value) of the attendee
			alarmComponent.addProperty(new AttendeeProperty('ATTENDEE', attendee.value))
		}
	}
}
