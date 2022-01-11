/**
 * @copyright Copyright (c) 2020 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
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
import {
	getAmountAndUnitForTimedEvents,
	getAmountHoursMinutesAndUnitForAllDayEvents,
} from '../utils/alarms.js'
import { getDateFromDateTimeValue } from '../utils/date.js'

/**
 * Creates a complete alarm object based on given props
 *
 * @param {object} props The alarm properties already provided
 * @return {object}
 */
const getDefaultAlarmObject = (props = {}) => Object.assign({}, {
	// The calendar-js alarm component
	alarmComponent: null,
	// Type of alarm: DISPLAY, EMAIL, AUDIO
	type: null,
	// Whether or not the alarm is relative
	isRelative: false,
	// Date object of an absolute alarm (if it's absolute, it must be DATE-TIME)
	absoluteDate: null,
	// The time zone id of for absolute alarms
	absoluteTimezoneId: null,
	// Whether or not the relative alarm is before the event,
	relativeIsBefore: null,
	// Whether or not the alarm is relative to the event's start
	relativeIsRelatedToStart: null,
	// TIMED EVENTS:
	// Unit (seconds, minutes, hours, ...) if this alarm is inside a timed event
	relativeUnitTimed: null,
	// The amount of unit if this alarm is inside a timed event
	relativeAmountTimed: null,
	// ALL-DAY EVENTS:
	// Unit (seconds, minutes, hours, ...) if this alarm is inside an all-day event
	relativeUnitAllDay: null,
	// The amount of unit if this alarm is inside a all-day event
	relativeAmountAllDay: null,
	// The hours to display alarm for in an all-day event (e.g. 1 day before at 9:00 am)
	relativeHoursAllDay: null,
	// The minutes to display alarm for in an all-day event (e.g. 1 day before at 9:30 am)
	relativeMinutesAllDay: null,
	// The total amount of seconds for a relative alarm
	relativeTrigger: null,
}, props)

/**
 * Map an alarm component to our alarm object
 *
 * @param {AlarmComponent} alarmComponent The calendar-js alarm-component to turn into an alarm object
 * @return {object}
 */
const mapAlarmComponentToAlarmObject = (alarmComponent) => {
	if (alarmComponent.trigger.isRelative()) {
		const relativeIsBefore = alarmComponent.trigger.value.isNegative
		const relativeIsRelatedToStart = alarmComponent.trigger.related === 'START'

		const {
			amount: relativeAmountTimed,
			unit: relativeUnitTimed,
		} = getAmountAndUnitForTimedEvents(alarmComponent.trigger.value.totalSeconds)

		const {
			unit: relativeUnitAllDay,
			amount: relativeAmountAllDay,
			hours: relativeHoursAllDay,
			minutes: relativeMinutesAllDay,
		} = getAmountHoursMinutesAndUnitForAllDayEvents(alarmComponent.trigger.value.totalSeconds)

		const relativeTrigger = alarmComponent.trigger.value.totalSeconds

		return getDefaultAlarmObject({
			alarmComponent,
			type: alarmComponent.action,
			isRelative: alarmComponent.trigger.isRelative(),
			relativeIsBefore,
			relativeIsRelatedToStart,
			relativeUnitTimed,
			relativeAmountTimed,
			relativeUnitAllDay,
			relativeAmountAllDay,
			relativeHoursAllDay,
			relativeMinutesAllDay,
			relativeTrigger,
		})
	} else {
		const absoluteDate = getDateFromDateTimeValue(alarmComponent.trigger.value)

		return getDefaultAlarmObject({
			alarmComponent,
			type: alarmComponent.action,
			isRelative: alarmComponent.trigger.isRelative(),
			absoluteDate,
			absoluteTimezoneId: alarmComponent.trigger.value.timezoneId,
		})
	}
}

export {
	getDefaultAlarmObject,
	mapAlarmComponentToAlarmObject,
}
