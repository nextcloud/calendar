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
import { getDateFromDateTimeValue } from '../utils/date.js'
import DurationValue from 'calendar-js/src/values/durationValue.js'
import { getWeekDayFromDate } from '../utils/recurrence.js'
import { getAmountAndUnitForTimedEvents, getAmountHoursMinutesAndUnitForAllDayEvents } from '../utils/alarms.js'

/**
 * Creates a complete calendar-object-instance-object based on given props
 *
 * @param {Object} props The props already provided
 * @returns {Object}
 */
export const getDefaultCalendarObjectInstanceObject = (props = {}) => Object.assign({}, {
	// Title of the event
	title: null,
	// Start date of the event
	startDate: null,
	// Timezone of the start date
	startTimezoneId: null,
	// End date of the event
	endDate: null,
	// Timezone of the end date
	endTimezoneId: null,
	// Indicator whether or not event is all-day
	isAllDay: false,
	// Location that the event takes places in
	location: null,
	// description of the event
	description: null,
	// Access class of the event (PUBLIC, PRIVATE, CONFIDENTIAL)
	accessClass: null,
	// Status of the event (CONFIRMED, TENTATIVE, CANCELLED)
	status: null,
	// Whether or not to block this event in Free-Busy reports (TRANSPARENT, OPAQUE)
	timeTransparency: null,
	// The recurrence rule of this event. We only support one recurrence-rule
	recurrenceRule: {
		frequency: 'NONE',
		interval: 1,
		count: null,
		until: null,
		byDay: [],
		byMonth: [],
		byMonthDay: [],
		bySetPosition: null,
		isUnsupported: false,
		recurrenceRuleValue: null
	},
	// Attendees of this event
	attendees: [],
	// Organizer of the event
	organizer: {
		// name of the organizer
		name: null,
		// email of the organzier:
		uri: null
	},
	// Alarm of the event
	alarms: [],
	// Custom color of the event
	customColor: null,
	// Categories
	categories: [],
	// Wether or not the user is allowed to toggle the all-day checkbox
	canModifyAllDay: true,
	// The real event-component coming from calendar-js
	eventComponent: null
}, props)

/**
 * Map an EventComponent from calendar-js to our calendar object instance object
 *
 * @param {EventComponent} eventComponent The EventComponent object to map to an object
 * @returns {{color: *, canModifyAllDay: *, timeTransparency: *, description: *, location: *, eventComponent: *, title: *, accessClass: *, status: *}}
 */
export const mapEventComponentToCalendarObjectInstanceObject = (eventComponent) => {
	const calendarObjectInstanceObject = {
		title: eventComponent.title,
		location: eventComponent.location,
		description: eventComponent.description,
		accessClass: eventComponent.accessClass,
		status: eventComponent.status,
		timeTransparency: eventComponent.timeTransparency,
		color: eventComponent.color,
		canModifyAllDay: eventComponent.canModifyAllDay(),
		eventComponent
	}

	// The end date of an event is non-inclusive. This is rather intuitive for timed-events, but very unintuitive for all-day events.
	// That's why, when an events is from 2019-10-03 to 2019-10-04, we will show 2019-10-03 to 2019-10-03 in the editor.
	calendarObjectInstanceObject.isAllDay = eventComponent.isAllDay()
	calendarObjectInstanceObject.startDate = getDateFromDateTimeValue(eventComponent.startDate)
	calendarObjectInstanceObject.startTimezoneId = eventComponent.startDate.timezoneId

	if (eventComponent.isAllDay()) {
		const endDate = eventComponent.endDate.clone()
		endDate.addDuration(DurationValue.fromSeconds(-1 * 60 * 60 * 24))
		calendarObjectInstanceObject.endDate = getDateFromDateTimeValue(endDate)
	} else {
		calendarObjectInstanceObject.endDate = getDateFromDateTimeValue(eventComponent.endDate)
	}
	calendarObjectInstanceObject.endTimezoneId = eventComponent.endDate.timezoneId

	calendarObjectInstanceObject.categories = getCategoriesFromEventComponent(eventComponent)
	calendarObjectInstanceObject.organizer = getOrganizerFromEventComponent(eventComponent)
	calendarObjectInstanceObject.recurrenceRule = getRecurrenceRuleFromEventComponent(eventComponent)
	calendarObjectInstanceObject.hasMultipleRecurrenceRules
		= Array.from(eventComponent.getPropertyIterator('RRULE')).length > 1
	calendarObjectInstanceObject.attendees = getAttendeesFromEventComponent(eventComponent)
	calendarObjectInstanceObject.alarms = getAlarmsFromEventComponent(eventComponent)

	return calendarObjectInstanceObject
}

/**
 * Gets the organizer from the event component
 *
 * @param {EventComponent} eventComponent The event-component representing the instance
 * @returns {null|{commonName: *, uri: *}}
 */
function getOrganizerFromEventComponent(eventComponent) {
	if (eventComponent.organizer) {
		const organizerProperty = eventComponent.getFirstProperty('ORGANIZER')
		return {
			commonName: organizerProperty.commonName,
			uri: organizerProperty.email
		}
	}

	return null
}

/**
 * Gets all categories (without a language tag) from the event component
 *
 * @param {EventComponent} eventComponent The event-component representing the instance
 * @returns {String[]}
 */
function getCategoriesFromEventComponent(eventComponent) {
	return Array.from(eventComponent.getCategoryIterator())
}

/**
 * Gets the first recurrence rule from the event component
 *
 * @param {EventComponent} eventComponent The event-component representing the instance
 * @returns {{byMonth: [], frequency: null, count: null, byDay: [], interval: number, until: null, bySetPosition: null, byMonthDay: []}|{byMonth: *, frequency: *, count: *, byDay: *, interval: *, until: *, bySetPosition: *, byMonthDay: *}}
 */
function getRecurrenceRuleFromEventComponent(eventComponent) {
	/** @type {RecurValue} */
	const recurrenceRule = eventComponent.getFirstPropertyFirstValue('RRULE')
	if (recurrenceRule) {
		const component = {
			frequency: recurrenceRule.frequency,
			interval: parseInt(recurrenceRule.interval, 10) || 1,
			count: recurrenceRule.count,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: recurrenceRule
		}

		if (recurrenceRule.until) {
			component.until = recurrenceRule.until.jsDate
		}

		switch (component.frequency) {
		case 'DAILY':
			getRecurrenceComponentFromDailyRule(recurrenceRule, component)
			break

		case 'WEEKLY':
			getRecurrenceComponentFromWeeklyRule(recurrenceRule, component, eventComponent)
			break

		case 'MONTHLY':
			getRecurrenceComponentFromMonthlyRule(recurrenceRule, component, eventComponent)
			break

		case 'YEARLY':
			getRecurrenceComponentFromYearlyRule(recurrenceRule, component, eventComponent)
			break

		default:
			component.isUnsupported = true
			break
		}

		return component
	}

	return {
		frequency: 'NONE',
		interval: 1,
		count: null,
		until: null,
		byDay: [],
		byMonth: [],
		byMonthDay: [],
		bySetPosition: null,
		isUnsupported: false,
		recurrenceRuleValue: null
	}
}

/**
 * Checks if the recurrence-rule contains any of the given components
 *
 * @param {RecurValue} recurrenceRule The recurrence-rule value to check for the given components
 * @param {String[]} components List of components to check for
 * @returns {Boolean}
 */
function containsRecurrenceComponent(recurrenceRule, components) {
	for (const component of components) {
		const componentValue = recurrenceRule.getComponent(component)
		if (componentValue.length > 0) {
			return true
		}
	}

	return false
}

/**
 * Gets all attendees from the event component
 *
 * @param {EventComponent} eventComponent The event-component representing the instance
 * @returns {[]}
 */
function getAttendeesFromEventComponent(eventComponent) {
	const attendees = []

	for (const attendee of eventComponent.getAttendeeIterator()) {
		attendees.push({
			commonName: attendee.commonName,
			participationStatus: attendee.participationStatus,
			role: attendee.role,
			rsvp: attendee.rsvp,
			uri: attendee.email,
			attendeeProperty: attendee
		})
	}

	return attendees
}

/**
 * Get all alarms from the event Component
 *
 * @param {EventComponent} eventComponent The event-component representing the instance
 * @returns {[]}
 */
function getAlarmsFromEventComponent(eventComponent) {
	const alarms = []

	for (const alarm of eventComponent.getAlarmIterator()) {
		alarms.push(getAlarmFromAlarmComponent(alarm))
	}

	return alarms
}

/**
 * Get all numbers between start and end as strings
 *
 * @param {Number} start Lower end of range
 * @param {Number} end Upper end of range
 * @returns {string[]}
 */
function getRangeAsStrings(start, end) {
	return Array
		.apply(null, Array((end - start) + 1))
		.map((_, n) => n + start)
		.map((s) => s.toString())
}

/**
 * Extracts the recurrence component from a daily recurrence rule
 *
 * @param {RecurValue} recurrenceRule The RecurValue to extract data from
 * @param {Object} recurrenceComponent The recurrence component to write data into
 */
function getRecurrenceComponentFromDailyRule(recurrenceRule, recurrenceComponent) {
	/**
	 * # Daily
	 *
	 * The Nextcloud-editor does not support any BY-parts for the daily rule, hence
	 * we will mark any DAILY rule with BY-parts as unsupported.
	 */
	const forbiddenComponents = [
		'BYSECOND',
		'BYMINUTE',
		'BYHOUR',
		'BYDAY',
		'BYMONTHDAY',
		'BYYEARDAY',
		'BYWEEKNO',
		'BYMONTH',
		'BYSETPOS'
	]

	if (containsRecurrenceComponent(recurrenceRule, forbiddenComponents)) {
		recurrenceComponent.isUnsupported = true
	}
}

/**
 * Extracts the recurrence component from a weekly recurrence rule
 *
 * @param {RecurValue} recurrenceRule The RecurValue to extract data from
 * @param {Object} recurrenceComponent The recurrence component to write data into
 * @param {EventComponent} eventComponent The event component needed for default values
 */
function getRecurrenceComponentFromWeeklyRule(recurrenceRule, recurrenceComponent, eventComponent) {
	/**
	 * # Weekly
	 *
	 * The Nextcloud-editor only supports BYDAY in order to expand the weekly rule.
	 * It does not support other BY-parts like BYSETPOS or BYMONTH
	 *
	 * As defined by RFC 5545, the individual BYDAY components may not be preceded
	 * by a positive or negative integer.
	 */
	const forbiddenComponents = [
		'BYSECOND',
		'BYMINUTE',
		'BYHOUR',
		'BYMONTHDAY',
		'BYYEARDAY',
		'BYWEEKNO',
		'BYMONTH',
		'BYSETPOS'
	]

	if (containsRecurrenceComponent(recurrenceRule, forbiddenComponents)) {
		recurrenceComponent.isUnsupported = true
	}

	recurrenceComponent.byDay = recurrenceRule.getComponent('BYDAY')
		.filter((weekDay) => ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].includes(weekDay))

	// If the BYDAY is empty, add the day that the event occurs in
	// E.g. if the event is on a Wednesday, automatically set BYDAY:WE
	if (recurrenceComponent.byDay.length === 0) {
		recurrenceComponent.byDay.push(getWeekDayFromDate(eventComponent.startDate.jsDate))
	}
}

/**
 * Extracts the recurrence component from a monthly recurrence rule
 *
 * @param {RecurValue} recurrenceRule The RecurValue to extract data from
 * @param {Object} recurrenceComponent The recurrence component to write data into
 * @param {EventComponent} eventComponent The event component needed for default values
 */
function getRecurrenceComponentFromMonthlyRule(recurrenceRule, recurrenceComponent, eventComponent) {
	/**
	 * # Monthly
	 *
	 * The Nextcloud-editor only supports BYMONTHDAY, BYDAY, BYSETPOS in order to expand the monthly rule.
	 * It supports either BYMONTHDAY or the combination of BYDAY and BYSETPOS. They have to be used exclusively
	 * and cannot be combined.
	 *
	 * It does not support other BY-parts like BYMONTH
	 *
	 * For monthly recurrence-rules, BYDAY components are allowed to be preceded by positive or negative integers.
	 * The Nextcloud-editor supports at most one BYDAY component with an integer.
	 * If it's presented with such a BYDAY component, it will internally be converted to BYDAY without integer and BYSETPOS.
	 * e.g.
	 * BYDAY=3WE => BYDAY=WE,BYSETPOS=3
	 *
	 * BYSETPOS is limited to -2, -1, 1, 2, 3, 4, 5
	 * Other values are not supported
	 *
	 * BYDAY is limited to "MO", "TU", "WE", "TH", "FR", "SA", "SU",
	 * "MO,TU,WE,TH,FR,SA,SU", "MO,TU,WE,TH,FR", "SA,SU"
	 *
	 * BYMONYHDAY is limited to "1", "2", ..., "31"
	 */
	const forbiddenComponents = [
		'BYSECOND',
		'BYMINUTE',
		'BYHOUR',
		'BYYEARDAY',
		'BYWEEKNO',
		'BYMONTH'
	]

	if (containsRecurrenceComponent(recurrenceRule, forbiddenComponents)) {
		recurrenceComponent.isUnsupported = true
	}

	if (containsRecurrenceComponent(recurrenceRule, ['BYMONYHDAY'])) {
		if (containsRecurrenceComponent(recurrenceRule, ['BYDAY', 'BYSETPOS'])) {
			recurrenceComponent.isUnsupported = true
		}

		const allowedValues = getRangeAsStrings(1, 31)
		const byMonthDayComponent = recurrenceRule.getComponent('BYMONYHDAY')
		recurrenceComponent.byMonthDay = byMonthDayComponent.filter((day) =>
			allowedValues.includes(day))

		if (byMonthDayComponent.length !== recurrenceComponent.byMonthDay.length) {
			recurrenceComponent.isUnsupported = true
		}
	// TODO: the following is duplicate code, the same as in the yearly function.
	} else if (containsRecurrenceComponent(recurrenceRule, ['BYDAY']) && containsRecurrenceComponent(recurrenceRule, ['BYSETPOS'])) {
		if (isAllowedByDay(recurrenceRule.getComponent('BYDAY'))) {
			recurrenceComponent.byDay = recurrenceRule.getComponent('BYDAY')
		} else {
			recurrenceComponent.byDay = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
			recurrenceComponent.isUnsupported = true
		}

		const setPositionArray = recurrenceRule.getComponent('BYSETPOS')
		if (setPositionArray.length === 1 && isAllowedBySetPos(setPositionArray[0])) {
			recurrenceComponent.bySetPosition = setPositionArray[0]
		} else {
			recurrenceComponent.bySetPosition = 1
			recurrenceComponent.isUnsupported = true
		}
	} else if (containsRecurrenceComponent(recurrenceRule, ['BYDAY'])) {
		const byDayArray = recurrenceRule.getComponent('BYDAY')

		if (byDayArray.length > 1) {
			recurrenceComponent.byMonthDay.push(eventComponent.startDate.day.toString())
			recurrenceComponent.isUnsupported = true
		} else {
			const firstElement = byDayArray[0]

			const match = /^(-?\d)([A-Z]){2}$/.exec(firstElement)
			if (match) {
				const bySetPosition = match[1]
				const byDay = match[2]

				if (isAllowedBySetPos(bySetPosition)) {
					recurrenceComponent.byDay = [byDay]
					recurrenceComponent.bySetPosition = bySetPosition
				} else {
					recurrenceComponent.byDay = [byDay]
					recurrenceComponent.bySetPosition = 1
					recurrenceComponent.isUnsupported = true
				}
			} else {
				recurrenceComponent.byMonthDay.push(eventComponent.startDate.day.toString())
				recurrenceComponent.isUnsupported = true
			}
		}
	} else {
		// If none of the previous rules are present, automatically set a BYMONTHDAY
		recurrenceComponent.byMonthDay.push(eventComponent.startDate.day.toString())
	}
}

/**
 * Extracts the recurrence component from a yearly recurrence rule
 *
 * @param {RecurValue} recurrenceRule The RecurValue to extract data from
 * @param {Object} recurrenceComponent The recurrence component to write data into
 * @param {EventComponent} eventComponent The event component needed for default values
 */
function getRecurrenceComponentFromYearlyRule(recurrenceRule, recurrenceComponent, eventComponent) {
	/**
	 * # YEARLY
	 *
	 * The Nextcloud-editor only supports BYMONTH, BYDAY, BYSETPOS in order to expand the monthly rule.
	 *
	 *
	 *
	 *
	 *
	 *
	 * BYSETPOS is limited to -2, -1, 1, 2, 3, 4, 5
	 * Other values are not supported
	 *
	 * BYDAY is limited to "MO", "TU", "WE", "TH", "FR", "SA", "SU",
	 * "MO,TU,WE,TH,FR,SA,SU", "MO,TU,WE,TH,FR", "SA,SU"
	 */
	const forbiddenComponents = [
		'BYSECOND',
		'BYMINUTE',
		'BYHOUR',
		'BYMONTHDAY',
		'BYYEARDAY',
		'BYWEEKNO'
	]

	if (containsRecurrenceComponent(recurrenceRule, forbiddenComponents)) {
		recurrenceComponent.isUnsupported = true
	}

	if (containsRecurrenceComponent(recurrenceRule, ['BYMONTH'])) {
		recurrenceComponent.byMonth = recurrenceRule.getComponent('BYMONTH')
	} else {
		recurrenceComponent.byMonth.push(eventComponent.startDate.month.toString())
	}

	// TODO: the following is duplicate code, the same as in the month function.
	if (containsRecurrenceComponent(recurrenceRule, ['BYDAY']) && containsRecurrenceComponent(recurrenceRule, ['BYSETPOS'])) {
		if (isAllowedByDay(recurrenceRule.getComponent('BYDAY'))) {
			recurrenceComponent.byDay = recurrenceRule.getComponent('BYDAY')
		} else {
			recurrenceComponent.byDay = ['MO', 'TU', 'W E', 'TH', 'FR', 'SA', 'SU']
			recurrenceComponent.isUnsupported = true
		}

		const setPositionArray = recurrenceRule.getComponent('BYSETPOS')
		if (setPositionArray.length === 1 && isAllowedBySetPos(setPositionArray[0])) {
			recurrenceComponent.bySetPosition = setPositionArray[0]
		} else {
			recurrenceComponent.bySetPosition = 1
			recurrenceComponent.isUnsupported = true
		}
	} else if (containsRecurrenceComponent(recurrenceRule, ['BYDAY'])) {
		const byDayArray = recurrenceRule.getComponent('BYDAY')

		if (byDayArray.length > 1) {
			recurrenceComponent.byMonthDay.push(eventComponent.startDate.day.toString())
			recurrenceComponent.isUnsupported = true
		} else {
			const firstElement = byDayArray[0]

			const match = /^(-?\d)([A-Z]){2}$/.exec(firstElement)
			if (match) {
				const bySetPosition = match[1]
				const byDay = match[2]

				if (isAllowedBySetPos(bySetPosition)) {
					recurrenceComponent.byDay = [byDay]
					recurrenceComponent.bySetPosition = bySetPosition
				} else {
					recurrenceComponent.byDay = [byDay]
					recurrenceComponent.bySetPosition = 1
					recurrenceComponent.isUnsupported = true
				}
			} else {
				recurrenceComponent.byMonthDay.push(eventComponent.startDate.day.toString())
				recurrenceComponent.isUnsupported = true
			}
		}
	}
}

/**
 * Checks if the given parameter is a supported BYDAY value
 *
 * @param {String[]} byDay The byDay component to check
 * @returns {Boolean}
 */
function isAllowedByDay(byDay) {
	const allowedByDay = [
		'MO',
		'TU',
		'WE',
		'TH',
		'FR',
		'SA',
		'SU',
		'FR,MO,SA,SU,TH,TU,WE',
		'FR,MO,TH,TU,WE',
		'SA,SU'
	]

	return allowedByDay.includes(byDay.slice().sort().join(','))
}

/**
 * Checks if the given parameter is a supported BYSETPOS value
 *
 * @param {String} bySetPos The bySetPos component to check
 * @returns {Boolean}
 */
function isAllowedBySetPos(bySetPos) {
	const allowedBySetPos = [
		'-2',
		'-1',
		'1',
		'2',
		'3',
		'4',
		'5'
	]

	return allowedBySetPos.includes(bySetPos.toString())
}

/**
 *
 * @param {Object} alarm The alarm to set / update
 * @param {AlarmComponent} alarmComponent The alarm component to read from
 */
export function updateAlarmFromAlarmComponent(alarm, alarmComponent) {
	alarm.type = alarmComponent.action
	alarm.isRelative = alarmComponent.trigger.isRelative()

	alarm.absoluteDate = null
	alarm.absoluteTimezoneId = null

	alarm.relativeIsBefore = null
	alarm.relativeIsRelatedToStart = null

	alarm.relativeUnitTimed = null
	alarm.relativeAmountTimed = null

	alarm.relativeUnitAllDay = null
	alarm.relativeAmountAllDay = null
	alarm.relativeHoursAllDay = null
	alarm.relativeMinutesAllDay = null

	alarm.relativeTrigger = null

	alarm.alarmComponent = alarmComponent

	if (alarm.isRelative) {
		alarm.relativeIsBefore = alarmComponent.trigger.value.isNegative
		alarm.relativeIsRelatedToStart = alarmComponent.trigger.related === 'START'

		const timedData = getAmountAndUnitForTimedEvents(alarmComponent.trigger.value.totalSeconds)
		alarm.relativeAmountTimed = timedData.amount
		alarm.relativeUnitTimed = timedData.unit

		const allDayData = getAmountHoursMinutesAndUnitForAllDayEvents(alarmComponent.trigger.value.totalSeconds)
		alarm.relativeUnitAllDay = allDayData.unit
		alarm.relativeAmountAllDay = allDayData.amount
		alarm.relativeHoursAllDay = allDayData.hours
		alarm.relativeMinutesAllDay = allDayData.minutes

		alarm.relativeTrigger = alarmComponent.trigger.value.totalSeconds
	} else {
		alarm.absoluteDate = getDateFromDateTimeValue(alarmComponent.trigger.value)
		alarm.absoluteTimezoneId = alarmComponent.trigger.value.timezoneId
	}
}

/**
 *
 * @param {AlarmComponent} alarmComponent The alarm component to read from
 * @returns {Object}
 */
export function getAlarmFromAlarmComponent(alarmComponent) {
	const alarmObject = {}
	updateAlarmFromAlarmComponent(alarmObject, alarmComponent)

	return alarmObject
}
