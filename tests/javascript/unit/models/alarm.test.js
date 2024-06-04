/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import {getDefaultAlarmObject, mapAlarmComponentToAlarmObject} from '../../../../src/models/alarm.js'
import {
	getAmountAndUnitForTimedEvents,
	getAmountHoursMinutesAndUnitForAllDayEvents
} from '../../../../src/utils/alarms.js'
import { getDateFromDateTimeValue } from '../../../../src/utils/date.js'

jest.mock('../../../../src/utils/alarms.js')
jest.mock('../../../../src/utils/date.js')

describe('Test suite: Alarm model (models/alarm.js)', () => {

	beforeEach(() => {
		getAmountAndUnitForTimedEvents.mockClear()
		getAmountHoursMinutesAndUnitForAllDayEvents.mockClear()
		getDateFromDateTimeValue.mockClear()
	})

	it('should return a default alarm object', () => {
		expect(getDefaultAlarmObject()).toEqual({
			alarmComponent: null,
			type: null,
			isRelative: false,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: null,
			relativeIsRelatedToStart: null,
			relativeUnitTimed: null,
			relativeAmountTimed: null,
			relativeUnitAllDay: null,
			relativeAmountAllDay: null,
			relativeHoursAllDay: null,
			relativeMinutesAllDay: null,
			relativeTrigger: null
		})
	})

	it('should fill up an object with default values', () => {
		expect(getDefaultAlarmObject({
			type: 'DISPLAY',
			otherProp: 'foo',
		})).toEqual({
			alarmComponent: null,
			type: 'DISPLAY',
			isRelative: false,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: null,
			relativeIsRelatedToStart: null,
			relativeUnitTimed: null,
			relativeAmountTimed: null,
			relativeUnitAllDay: null,
			relativeAmountAllDay: null,
			relativeHoursAllDay: null,
			relativeMinutesAllDay: null,
			relativeTrigger: null,
			otherProp: 'foo',
		})
	})

	it('should properly load an absolute alarm', () => {
		const mockDate = new Date()
		getDateFromDateTimeValue
			.mockReturnValueOnce(mockDate)

		const alarmComponent = getAlarmComponentFromAsset('alarms/absoluteAlarm')
		const alarmModel = mapAlarmComponentToAlarmObject(alarmComponent)

		expect(alarmModel).toEqual({
			alarmComponent,
			type: 'DISPLAY',
			isRelative: false,
			absoluteDate: mockDate,
			absoluteTimezoneId: 'UTC',
			relativeIsBefore: null,
			relativeIsRelatedToStart: null,
			relativeUnitTimed: null,
			relativeAmountTimed: null,
			relativeUnitAllDay: null,
			relativeAmountAllDay: null,
			relativeHoursAllDay: null,
			relativeMinutesAllDay: null,
			relativeTrigger: null
		})

		expect(getDateFromDateTimeValue.mock.calls[0][0].jsDate.toISOString()).toEqual('2020-03-06T08:30:00.000Z')

		expect(getAmountAndUnitForTimedEvents).toHaveBeenCalledTimes(0)
		expect(getAmountHoursMinutesAndUnitForAllDayEvents).toHaveBeenCalledTimes(0)
	})

	it('should properly load an absolute alarm with a time zone other than UTC', () => {
		const mockDate = new Date()
		getDateFromDateTimeValue
			.mockReturnValueOnce(mockDate)

		const alarmComponent = getAlarmComponentFromAsset('alarms/absoluteAlarmWithTimezone')
		const alarmModel = mapAlarmComponentToAlarmObject(alarmComponent)

		expect(alarmModel).toEqual({
			alarmComponent,
			type: 'DISPLAY',
			isRelative: false,
			absoluteDate: mockDate,
			absoluteTimezoneId: 'Africa/Banjul',
			relativeIsBefore: null,
			relativeIsRelatedToStart: null,
			relativeUnitTimed: null,
			relativeAmountTimed: null,
			relativeUnitAllDay: null,
			relativeAmountAllDay: null,
			relativeHoursAllDay: null,
			relativeMinutesAllDay: null,
			relativeTrigger: null,
		})

		expect(getDateFromDateTimeValue.mock.calls[0][0].getInUTC().jsDate.toISOString()).toEqual('2022-01-15T09:00:00.000Z')
		expect(getDateFromDateTimeValue.mock.calls[0][0].timezoneId).toEqual('Africa/Banjul')

		expect(getAmountAndUnitForTimedEvents).toHaveBeenCalledTimes(0)
		expect(getAmountHoursMinutesAndUnitForAllDayEvents).toHaveBeenCalledTimes(0)
	})

	it('should properly load a relative alarm a week before the event', () => {
		const alarmComponent = getAlarmComponentFromAsset('alarms/relativeAlarmWeekBefore')

		getAmountAndUnitForTimedEvents
			.mockReturnValueOnce({
				amount: 159,
				unit: 'hours',
			})
		getAmountHoursMinutesAndUnitForAllDayEvents
			.mockReturnValueOnce({
				amount: 1,
				unit: 'weeks',
				hours: 9,
				minutes: 0
			})

		const alarmModel = mapAlarmComponentToAlarmObject(alarmComponent)

		expect(alarmModel).toEqual({
			alarmComponent,
			type: 'DISPLAY',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: true,
			relativeIsRelatedToStart: true,
			relativeUnitTimed: 'hours',
			relativeAmountTimed: 159,
			relativeUnitAllDay: 'weeks',
			relativeAmountAllDay: 1,
			relativeHoursAllDay: 9,
			relativeMinutesAllDay: 0,
			relativeTrigger: -572400,
		})

		expect(getAmountAndUnitForTimedEvents).toHaveBeenCalledTimes(1)
		expect(getAmountAndUnitForTimedEvents).toHaveBeenNthCalledWith(1, -572400)
		expect(getAmountHoursMinutesAndUnitForAllDayEvents).toHaveBeenCalledTimes(1)
		expect(getAmountHoursMinutesAndUnitForAllDayEvents).toHaveBeenNthCalledWith(1, -572400)
	})















	it('should properly load a relative alarm days before the event', () => {
		const alarmComponent = getAlarmComponentFromAsset('alarms/relativeAlarmBefore')

		getAmountAndUnitForTimedEvents
			.mockReturnValueOnce({
				amount: 15,
				unit: 'hours',
			})
		getAmountHoursMinutesAndUnitForAllDayEvents
			.mockReturnValueOnce({
				amount: 1,
				unit: 'days',
				hours: 9,
				minutes: 0
			})

		const alarmModel = mapAlarmComponentToAlarmObject(alarmComponent)

		expect(alarmModel).toEqual({
			alarmComponent,
			type: 'DISPLAY',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: true,
			relativeIsRelatedToStart: true,
			relativeUnitTimed: 'hours',
			relativeAmountTimed: 15,
			relativeUnitAllDay: 'days',
			relativeAmountAllDay: 1,
			relativeHoursAllDay: 9,
			relativeMinutesAllDay: 0,
			relativeTrigger: -54000,
		})

		expect(getAmountAndUnitForTimedEvents).toHaveBeenCalledTimes(1)
		expect(getAmountAndUnitForTimedEvents).toHaveBeenNthCalledWith(1, -54000)
		expect(getAmountHoursMinutesAndUnitForAllDayEvents).toHaveBeenCalledTimes(1)
		expect(getAmountHoursMinutesAndUnitForAllDayEvents).toHaveBeenNthCalledWith(1, -54000)
	})

	it('should properly load a relative alarm within 24 hours after the event', () => {
		const alarmComponent = getAlarmComponentFromAsset('alarms/relativeAlarmAfterWithin24hours')

		getAmountAndUnitForTimedEvents
			.mockReturnValueOnce({
				amount: 9,
				unit: 'hours',
			})
		getAmountHoursMinutesAndUnitForAllDayEvents
			.mockReturnValueOnce({
				amount: 0,
				unit: 'days',
				hours: 9,
				minutes: 0
			})

		const alarmModel = mapAlarmComponentToAlarmObject(alarmComponent)

		expect(alarmModel).toEqual({
			alarmComponent,
			type: 'DISPLAY',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: false,
			relativeIsRelatedToStart: true,
			relativeUnitTimed: 'hours',
			relativeAmountTimed: 9,
			relativeUnitAllDay: 'days',
			relativeAmountAllDay: 0,
			relativeHoursAllDay: 9,
			relativeMinutesAllDay: 0,
			relativeTrigger: 32400,
		})

		expect(getAmountAndUnitForTimedEvents).toHaveBeenCalledTimes(1)
		expect(getAmountAndUnitForTimedEvents).toHaveBeenNthCalledWith(1, 32400)
		expect(getAmountHoursMinutesAndUnitForAllDayEvents).toHaveBeenCalledTimes(1)
		expect(getAmountHoursMinutesAndUnitForAllDayEvents).toHaveBeenNthCalledWith(1, 32400)
	})

	it('should properly load a relative alarm after the alarm', () => {
		const alarmComponent = getAlarmComponentFromAsset('alarms/relativeAlarmAfter')

		getAmountAndUnitForTimedEvents
			.mockReturnValueOnce({
				amount: 33,
				unit: 'hours',
			})
		getAmountHoursMinutesAndUnitForAllDayEvents
			.mockReturnValueOnce({
				amount: 1,
				unit: 'days',
				hours: 9,
				minutes: 0
			})

		const alarmModel = mapAlarmComponentToAlarmObject(alarmComponent)

		expect(alarmModel).toEqual({
			alarmComponent,
			type: 'DISPLAY',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: false,
			relativeIsRelatedToStart: true,
			relativeUnitTimed: 'hours',
			relativeAmountTimed: 33,
			relativeUnitAllDay: 'days',
			relativeAmountAllDay: 1,
			relativeHoursAllDay: 9,
			relativeMinutesAllDay: 0,
			relativeTrigger: 118800,
		})

		expect(getAmountAndUnitForTimedEvents).toHaveBeenCalledTimes(1)
		expect(getAmountAndUnitForTimedEvents).toHaveBeenNthCalledWith(1, 118800)
		expect(getAmountHoursMinutesAndUnitForAllDayEvents).toHaveBeenCalledTimes(1)
		expect(getAmountHoursMinutesAndUnitForAllDayEvents).toHaveBeenNthCalledWith(1, 118800)
	})

	it('should properly load a relative alarm related to the end of the event', () => {
		const alarmComponent = getAlarmComponentFromAsset('alarms/relativeAlarmRelatedEnd')

		getAmountAndUnitForTimedEvents
			.mockReturnValueOnce({
				amount: 15,
				unit: 'hours',
			})
		getAmountHoursMinutesAndUnitForAllDayEvents
			.mockReturnValueOnce({
				amount: 1,
				unit: 'days',
				hours: 9,
				minutes: 0
			})

		const alarmModel = mapAlarmComponentToAlarmObject(alarmComponent)

		expect(alarmModel).toEqual({
			alarmComponent,
			type: 'DISPLAY',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: true,
			relativeIsRelatedToStart: false,
			relativeUnitTimed: 'hours',
			relativeAmountTimed: 15,
			relativeUnitAllDay: 'days',
			relativeAmountAllDay: 1,
			relativeHoursAllDay: 9,
			relativeMinutesAllDay: 0,
			relativeTrigger: -54000,
		})

		expect(getAmountAndUnitForTimedEvents).toHaveBeenCalledTimes(1)
		expect(getAmountAndUnitForTimedEvents).toHaveBeenNthCalledWith(1, -54000)
		expect(getAmountHoursMinutesAndUnitForAllDayEvents).toHaveBeenCalledTimes(1)
		expect(getAmountHoursMinutesAndUnitForAllDayEvents).toHaveBeenNthCalledWith(1, -54000)
	})

})

