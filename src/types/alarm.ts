// SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * A selectable default-alarm option, as offered in the
 * "Default reminder for part-day/full-day events" dropdowns.
 */
export interface AlarmOption {
	label: string
	value: number | null
}

/**
 * Alarm object shape expected by `alarmFormat()` in `src/filters/alarmFormat.js`,
 * built from a trigger time via `getAmountAndUnitForTimedEvents()` /
 * `getAmountHoursMinutesAndUnitForAllDayEvents()` in `src/utils/alarms.js`.
 */
export interface AlarmObject {
	isRelative: boolean
	absoluteDate: string | null
	absoluteTimezoneId: string | null
	relativeIsBefore: boolean
	relativeIsRelatedToStart: boolean
	relativeUnitTimed: string
	relativeAmountTimed: number
	relativeUnitAllDay: string
	relativeAmountAllDay: number
	relativeHoursAllDay: number
	relativeMinutesAllDay: number
	relativeTrigger: number
}
