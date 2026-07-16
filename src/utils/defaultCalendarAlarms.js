/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
	getAmountAndUnitForTimedEvents,
	getAmountHoursMinutesAndUnitForAllDayEvents,
	getTotalSecondsFromAmountAndUnitForTimedEvents,
	getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents,
} from './alarms.js'

/** @typedef {import('../types/calendar.ts').DefaultCalendarAlarm} DefaultCalendarAlarm */
/** @typedef {import('../types/calendar.ts').DefaultCalendarAlarmAction} DefaultCalendarAlarmAction */

const ALLOWED_ACTIONS = ['DISPLAY', 'EMAIL']

/**
 * @param {number} time
 * @return {object}
 */
export function triggerToAlarmObject(time) {
	const timedData = getAmountAndUnitForTimedEvents(time)
	const allDayData = getAmountHoursMinutesAndUnitForAllDayEvents(time)

	return {
		isRelative: true,
		absoluteDate: null,
		absoluteTimezoneId: null,
		relativeIsBefore: time < 0,
		relativeIsRelatedToStart: true,
		relativeUnitTimed: timedData.unit,
		relativeAmountTimed: timedData.amount,
		relativeUnitAllDay: allDayData.unit,
		relativeAmountAllDay: allDayData.amount,
		relativeHoursAllDay: allDayData.hours,
		relativeMinutesAllDay: allDayData.minutes,
		relativeTrigger: time,
	}
}

/**
 * @param {object} alarmObject
 * @param {boolean} isAllDay
 * @return {number}
 */
export function alarmObjectToTrigger(alarmObject, isAllDay) {
	if (isAllDay) {
		return getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(
			alarmObject.relativeAmountAllDay,
			alarmObject.relativeHoursAllDay,
			alarmObject.relativeMinutesAllDay,
			alarmObject.relativeUnitAllDay,
		)
	}

	return getTotalSecondsFromAmountAndUnitForTimedEvents(
		alarmObject.relativeAmountTimed,
		alarmObject.relativeUnitTimed,
		alarmObject.relativeIsBefore,
	)
}

/**
 * @param {Array|null|undefined} plural
 * @param {number|null|undefined} legacyInt
 * @return {DefaultCalendarAlarm[]}
 */
export function normalizeFromDav(plural, legacyInt) {
	if (Array.isArray(plural) && plural.length > 0) {
		return plural
			.filter((entry) => entry && typeof entry.trigger === 'number' && typeof entry.action === 'string')
			.map((entry) => ({
				trigger: entry.trigger,
				action: /** @type {DefaultCalendarAlarmAction} */ (entry.action),
			}))
	}

	if (legacyInt !== null && legacyInt !== undefined) {
		return [{ trigger: legacyInt, action: 'DISPLAY' }]
	}

	return []
}

/**
 * @param {DefaultCalendarAlarm[]|null|undefined} alarms
 * @return {DefaultCalendarAlarm[]|null}
 */
export function toDavPayload(alarms) {
	if (!Array.isArray(alarms) || alarms.length === 0) {
		return null
	}

	const normalized = alarms.map((alarm) => {
		if (!ALLOWED_ACTIONS.includes(alarm.action)) {
			throw new Error('Default alarm action must be DISPLAY or EMAIL')
		}

		return {
			trigger: alarm.trigger,
			action: alarm.action,
		}
	})

	return normalized
}

/**
 * @param {DefaultCalendarAlarm[]} alarms
 * @return {boolean}
 */
export function defaultAlarmsEqual(alarmsA, alarmsB) {
	if (alarmsA.length !== alarmsB.length) {
		return false
	}

	return alarmsA.every((alarm, index) => {
		const other = alarmsB[index]
		return alarm.trigger === other.trigger && alarm.action === other.action
	})
}
