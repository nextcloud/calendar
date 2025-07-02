/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { getWeekDayFromDate } from '../utils/recurrence.js'
import { getDateFromDateTimeValue } from '../utils/date.js'

/**
 * Creates a complete recurrence-rule-object based on given props
 *
 * @param {object} props Recurrence-rule-object-props already provided
 * @return {object}
 */
const getDefaultRecurrenceRuleObject = (props = {}) => Object.assign({}, {
	// The calendar-js recurrence-rule value
	recurrenceRuleValue: null,
	// The frequency of the recurrence-rule (DAILY, WEEKLY, ...)
	frequency: 'NONE',
	// The interval of the recurrence-rule, must be a positive integer
	interval: 1,
	// Positive integer if recurrence-rule limited by count, null otherwise
	count: null,
	// Date if recurrence-rule limited by date, null otherwise
	// We do not store a timezone here, since we only care about the date part
	until: null,
	// List of byDay components to limit/expand the recurrence-rule
	byDay: [],
	// List of byMonth components to limit/expand the recurrence-rule
	byMonth: [],
	// List of byMonthDay components to limit/expand the recurrence-rule
	byMonthDay: [],
	// A position to limit the recurrence-rule (e.g. -1 for last Friday)
	bySetPosition: null,
	// Whether or not the rule is not supported for editing
	isUnsupported: false,
}, props)

/**
 * Maps a calendar-js recurrence-rule-value to an recurrence-rule-object
 *
 * @param {RecurValue} recurrenceRuleValue The calendar-js recurrence rule value
 * @param {DateTimeValue} baseDate The base-date used to fill unset values
 * @return {object}
 */
const mapRecurrenceRuleValueToRecurrenceRuleObject = (recurrenceRuleValue, baseDate) => {
	switch (recurrenceRuleValue.frequency) {
	case 'DAILY':
		return mapDailyRuleValueToRecurrenceRuleObject(recurrenceRuleValue)

	case 'WEEKLY':
		return mapWeeklyRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)

	case 'MONTHLY':
		return mapMonthlyRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)

	case 'YEARLY':
		return mapYearlyRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)

	default: // SECONDLY, MINUTELY, HOURLY
		return getDefaultRecurrenceRuleObjectForRecurrenceValue(recurrenceRuleValue, {
			isUnsupported: true,
		})
	}
}

const FORBIDDEN_BY_PARTS_DAILY = [
	'BYSECOND',
	'BYMINUTE',
	'BYHOUR',
	'BYDAY',
	'BYMONTHDAY',
	'BYYEARDAY',
	'BYWEEKNO',
	'BYMONTH',
	'BYSETPOS',
]
const FORBIDDEN_BY_PARTS_WEEKLY = [
	'BYSECOND',
	'BYMINUTE',
	'BYHOUR',
	'BYMONTHDAY',
	'BYYEARDAY',
	'BYWEEKNO',
	'BYMONTH',
	'BYSETPOS',
]
const FORBIDDEN_BY_PARTS_MONTHLY = [
	'BYSECOND',
	'BYMINUTE',
	'BYHOUR',
	'BYYEARDAY',
	'BYWEEKNO',
	'BYMONTH',
]
const FORBIDDEN_BY_PARTS_YEARLY = [
	'BYSECOND',
	'BYMINUTE',
	'BYHOUR',
	'BYYEARDAY',
	'BYWEEKNO',
]

const SUPPORTED_BY_DAY_WEEKLY = [
	'SU',
	'MO',
	'TU',
	'WE',
	'TH',
	'FR',
	'SA',
]

const SUPPORTED_BY_MONTHDAY_MONTHLY = [...Array(31).keys().map(i => i + 1)]

const SUPPORTED_BY_MONTH_YEARLY = [...Array(12).keys().map(i => i + 1)]

/**
 * Maps a daily calendar-js recurrence-rule-value to an recurrence-rule-object
 *
 * @param recurrenceRuleValue
 * @return {object}
 */
const mapDailyRuleValueToRecurrenceRuleObject = (recurrenceRuleValue) => {
	/**
	 * We only support DAILY rules without any by-parts in the editor.
	 * If the recurrence-rule contains any by-parts, mark it as unsupported.
	 */
	const isUnsupported = containsRecurrenceComponent(recurrenceRuleValue, FORBIDDEN_BY_PARTS_DAILY)

	return getDefaultRecurrenceRuleObjectForRecurrenceValue(recurrenceRuleValue, {
		isUnsupported,
	})
}

/**
 * Maps a weekly calendar-js recurrence-rule-value to an recurrence-rule-object
 *
 * @param {RecurValue} recurrenceRuleValue The calendar-js recurrence rule value
 * @param {DateTimeValue} baseDate The base-date used to fill unset values
 * @return {object}
 */
const mapWeeklyRuleValueToRecurrenceRuleObject = (recurrenceRuleValue, baseDate) => {
	/**
	 * For WEEKLY recurrences, our editor only allows BYDAY
	 *
	 * As defined in RFC5545 3.3.10. Recurrence Rule:
	 * > Each BYDAY value can also be preceded by a positive (+n) or
	 * > negative (-n) integer.  If present, this indicates the nth
	 * > occurrence of a specific day within the MONTHLY or YEARLY "RRULE".
	 *
	 * RFC 5545 specifies other components, which can be used along WEEKLY.
	 * Among them are BYMONTH and BYSETPOS. We don't support those.
	 */
	const containsUnsupportedByParts = containsRecurrenceComponent(recurrenceRuleValue, FORBIDDEN_BY_PARTS_WEEKLY)
	const containsInvalidByDayPart = recurrenceRuleValue.getComponent('BYDAY')
		.some((weekday) => !SUPPORTED_BY_DAY_WEEKLY.includes(weekday))

	const isUnsupported = containsUnsupportedByParts || containsInvalidByDayPart

	const byDay = recurrenceRuleValue.getComponent('BYDAY')
		.filter((weekday) => SUPPORTED_BY_DAY_WEEKLY.includes(weekday))

	// If the BYDAY is empty, add the day that the event occurs in
	// E.g. if the event is on a Wednesday, automatically set BYDAY:WE
	if (byDay.length === 0) {
		byDay.push(getWeekDayFromDate(baseDate.jsDate))
	}

	return getDefaultRecurrenceRuleObjectForRecurrenceValue(recurrenceRuleValue, {
		byDay,
		isUnsupported,
	})
}

/**
 * Maps a monthly calendar-js recurrence-rule-value to an recurrence-rule-object
 *
 * @param {RecurValue} recurrenceRuleValue The calendar-js recurrence rule value
 * @param {DateTimeValue} baseDate The base-date used to fill unset values
 * @return {object}
 */
const mapMonthlyRuleValueToRecurrenceRuleObject = (recurrenceRuleValue, baseDate) => {
	/**
	 * We only supports BYMONTHDAY, BYDAY, BYSETPOS in order to expand the monthly rule.
	 * It supports either BYMONTHDAY or the combination of BYDAY and BYSETPOS. They have to be used exclusively
	 * and cannot be combined.
	 *
	 * We do not support other BY-parts like BYMONTH
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
	 * BYMONTHDAY is limited to "1", "2", ..., "31"
	 */
	let isUnsupported = containsRecurrenceComponent(recurrenceRuleValue, FORBIDDEN_BY_PARTS_MONTHLY)

	let byDay = []
	let bySetPosition = null
	let byMonthDay = []

	// This handles the first case, where we have a BYMONTHDAY rule
	if (containsRecurrenceComponent(recurrenceRuleValue, ['BYMONTHDAY'])) {
		// verify there is no BYDAY or BYSETPOS at the same time
		if (containsRecurrenceComponent(recurrenceRuleValue, ['BYDAY', 'BYSETPOS'])) {
			isUnsupported = true
		}

		const containsInvalidByMonthDay = recurrenceRuleValue.getComponent('BYMONTHDAY')
			.some((monthDay) => !SUPPORTED_BY_MONTHDAY_MONTHLY.includes(monthDay))
		isUnsupported = isUnsupported || containsInvalidByMonthDay

		byMonthDay = recurrenceRuleValue.getComponent('BYMONTHDAY')
			.filter((monthDay) => SUPPORTED_BY_MONTHDAY_MONTHLY.includes(monthDay))
			.map((monthDay) => monthDay)

		// This handles cases where we have both BYDAY and BYSETPOS
	} else if (containsRecurrenceComponent(recurrenceRuleValue, ['BYDAY']) && containsRecurrenceComponent(recurrenceRuleValue, ['BYSETPOS'])) {

		if (isAllowedByDay(recurrenceRuleValue.getComponent('BYDAY'))) {
			byDay = recurrenceRuleValue.getComponent('BYDAY')
		} else {
			byDay = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
			isUnsupported = true
		}

		const setPositionArray = recurrenceRuleValue.getComponent('BYSETPOS')
		if (setPositionArray.length === 1 && isAllowedBySetPos(setPositionArray[0])) {
			bySetPosition = setPositionArray[0]
		} else {
			bySetPosition = 1
			isUnsupported = true
		}

		// This handles cases where we only have a BYDAY
	} else if (containsRecurrenceComponent(recurrenceRuleValue, ['BYDAY'])) {

		const byDayArray = recurrenceRuleValue.getComponent('BYDAY')

		if (byDayArray.length > 1) {
			byMonthDay.push(baseDate.day)
			isUnsupported = true
		} else {
			const firstElement = byDayArray[0]

			const match = /^(-?\d)([A-Z]{2})$/.exec(firstElement)
			if (match) {
				const matchedBySetPosition = match[1]
				const matchedByDay = match[2]

				if (isAllowedBySetPos(matchedBySetPosition)) {
					byDay = [matchedByDay]
					bySetPosition = parseInt(matchedBySetPosition, 10)
				} else {
					byDay = [matchedByDay]
					bySetPosition = 1
					isUnsupported = true
				}
			} else {
				byMonthDay.push(baseDate.day)
				isUnsupported = true
			}
		}

		// This is a fallback where we just default BYMONTHDAY to the start date of the event
	} else {
		byMonthDay.push(baseDate.day)
	}

	return getDefaultRecurrenceRuleObjectForRecurrenceValue(recurrenceRuleValue, {
		byDay,
		bySetPosition,
		byMonthDay,
		isUnsupported,
	})
}

/**
 * Maps a yearly calendar-js recurrence-rule-value to an recurrence-rule-object
 *
 * @param {RecurValue} recurrenceRuleValue The calendar-js recurrence rule value
 * @param {DateTimeValue} baseDate The base-date used to fill unset values
 * @return {object}
 */
const mapYearlyRuleValueToRecurrenceRuleObject = (recurrenceRuleValue, baseDate) => {
	/**
	 * We only supports BYMONTH, BYDAY, BYSETPOS in order to expand the yearly rule.
	 * It supports a combination of them.
	 *
	 * We do not support other BY-parts.
	 *
	 * For yearly recurrence-rules, BYDAY components are allowed to be preceded by positive or negative integers.
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
	 */
	let isUnsupported = containsRecurrenceComponent(recurrenceRuleValue, FORBIDDEN_BY_PARTS_YEARLY)

	let byDay = []
	let bySetPosition = null
	let byMonth = []
	let byMonthDay = []

	if (containsRecurrenceComponent(recurrenceRuleValue, ['BYMONTH'])) {
		// This handles the first case, where we have a BYMONTH rule

		const containsInvalidByMonth = recurrenceRuleValue.getComponent('BYMONTH')
			.some((month) => !SUPPORTED_BY_MONTH_YEARLY.includes(month))
		isUnsupported = isUnsupported || containsInvalidByMonth

		byMonth = recurrenceRuleValue.getComponent('BYMONTH')
			.filter((month) => SUPPORTED_BY_MONTH_YEARLY.includes(month))
			.map((month) => month)

	} else {
		// This is a fallback where we just default BYMONTH to the start date of the event

		byMonth.push(baseDate.month)
	}

	if (containsRecurrenceComponent(recurrenceRuleValue, ['BYMONTHDAY'])) {
		// This handles the first case, where we have a BYMONTHDAY rule

		// verify there is no BYDAY or BYSETPOS at the same time
		if (containsRecurrenceComponent(recurrenceRuleValue, ['BYDAY', 'BYSETPOS'])) {
			isUnsupported = true
		}

		const containsInvalidByMonthDay = recurrenceRuleValue.getComponent('BYMONTHDAY')
			.some((monthDay) => !SUPPORTED_BY_MONTHDAY_MONTHLY.includes(monthDay))
		isUnsupported = isUnsupported || containsInvalidByMonthDay

		byMonthDay = recurrenceRuleValue.getComponent('BYMONTHDAY')
			.filter((monthDay) => SUPPORTED_BY_MONTHDAY_MONTHLY.includes(monthDay))
			.map((monthDay) => monthDay)

	} else if (containsRecurrenceComponent(recurrenceRuleValue, ['BYDAY']) && containsRecurrenceComponent(recurrenceRuleValue, ['BYSETPOS'])) {
		// This handles cases where we have both BYDAY and BYSETPOS

		if (isAllowedByDay(recurrenceRuleValue.getComponent('BYDAY'))) {
			byDay = recurrenceRuleValue.getComponent('BYDAY')
		} else {
			byDay = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
			isUnsupported = true
		}

		const setPositionArray = recurrenceRuleValue.getComponent('BYSETPOS')
		if (setPositionArray.length === 1 && isAllowedBySetPos(setPositionArray[0])) {
			bySetPosition = setPositionArray[0]
		} else {
			bySetPosition = 1
			isUnsupported = true
		}
	} else if (containsRecurrenceComponent(recurrenceRuleValue, ['BYDAY'])) {
		// This handles cases where we only have a BYDAY

		const byDayArray = recurrenceRuleValue.getComponent('BYDAY')

		if (byDayArray.length > 1) {
			byMonthDay.push(baseDate.day)
			isUnsupported = true
		} else {
			const firstElement = byDayArray[0]

			const match = /^(-?\d)([A-Z]{2})$/.exec(firstElement)
			if (match) {
				const matchedBySetPosition = match[1]
				const matchedByDay = match[2]

				if (isAllowedBySetPos(matchedBySetPosition)) {
					byDay = [matchedByDay]
					bySetPosition = parseInt(matchedBySetPosition, 10)
				} else {
					byDay = [matchedByDay]
					bySetPosition = 1
					isUnsupported = true
				}
			} else {
				byMonthDay.push(baseDate.day)
				isUnsupported = true
			}
		}
	} else {
		// This is a fallback where we just default BYMONTHDAY to the start date of the event
		byMonthDay.push(baseDate.day)
	}

	return getDefaultRecurrenceRuleObjectForRecurrenceValue(recurrenceRuleValue, {
		byDay,
		bySetPosition,
		byMonth,
		byMonthDay,
		isUnsupported,
	})
}

/**
 * Checks if the given parameter is a supported BYDAY value
 *
 * @param {string[]} byDay The byDay component to check
 * @return {boolean}
 */
const isAllowedByDay = (byDay) => {
	return [
		'MO',
		'TU',
		'WE',
		'TH',
		'FR',
		'SA',
		'SU',
		'FR,MO,SA,SU,TH,TU,WE',
		'FR,MO,TH,TU,WE',
		'SA,SU',
	].includes(byDay.slice().sort().join(','))
}

/**
 * Checks if the given parameter is a supported BYSETPOS value
 *
 * @param {string} bySetPos The bySetPos component to check
 * @return {boolean}
 */
const isAllowedBySetPos = (bySetPos) => {
	return [
		'-2',
		'-1',
		'1',
		'2',
		'3',
		'4',
		'5',
	].includes(bySetPos.toString())
}

/**
 * Checks if the recurrence-rule contains any of the given components
 *
 * @param {RecurValue} recurrenceRule The recurrence-rule value to check for the given components
 * @param {string[]} components List of components to check for
 * @return {boolean}
 */
const containsRecurrenceComponent = (recurrenceRule, components) => {
	for (const component of components) {
		const componentValue = recurrenceRule.getComponent(component)
		if (componentValue.length > 0) {
			return true
		}
	}

	return false
}

/**
 * Returns a full recurrence-rule-object with default values derived from recurrenceRuleValue
 * and additional props
 *
 * @param {RecurValue} recurrenceRuleValue The recurrence-rule value to get default values from
 * @param {object} props The properties to provide on top of default one
 * @return {object}
 */
const getDefaultRecurrenceRuleObjectForRecurrenceValue = (recurrenceRuleValue, props) => {
	const isUnsupported = recurrenceRuleValue.count !== null && recurrenceRuleValue.until !== null
	let isUnsupportedProps = {}

	if (isUnsupported) {
		isUnsupportedProps = {
			isUnsupported,
		}
	}

	return getDefaultRecurrenceRuleObject(Object.assign({}, {
		recurrenceRuleValue,
		frequency: recurrenceRuleValue.frequency,
		interval: parseInt(recurrenceRuleValue.interval, 10) || 1,
		count: recurrenceRuleValue.count,
		until: recurrenceRuleValue.until
			? getDateFromDateTimeValue(recurrenceRuleValue.until)
			: null,
	}, props, isUnsupportedProps))
}

export {
	getDefaultRecurrenceRuleObject,
	mapRecurrenceRuleValueToRecurrenceRuleObject,
}
