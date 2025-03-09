/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
	getDefaultRecurrenceRuleObject,
	mapRecurrenceRuleValueToRecurrenceRuleObject
} from "../../../../src/models/recurrenceRule.js";
import { getDateFromDateTimeValue } from '../../../../src/utils/date.js'
import { DateTimeValue } from "@nextcloud/calendar-js";

jest.mock('../../../../src/utils/date.js')

describe('Test suite: Recurrence Rule model (models/recurrenceRule.js)', () => {

	beforeEach(() => {
		getDateFromDateTimeValue.mockClear()
	})

	it('should return a default recurrence rule object', () => {
		expect(getDefaultRecurrenceRuleObject()).toEqual({
			recurrenceRuleValue: null,
			frequency: 'NONE',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
		})
	})

	it('should fill up an object with default values', () => {
		expect(getDefaultRecurrenceRuleObject({
			frequency: 'DAILY',
			interval: 42,
			otherProp: 'foo',
		})).toEqual({
			recurrenceRuleValue: null,
			frequency: 'DAILY',
			interval: 42,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
			otherProp: 'foo',
		})
	})

	it('should properly load a recurrence-rule (1/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules1')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// unsupported SECONDLY
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'SECONDLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (2/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules2')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// unsupported MINUTELY
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'MINUTELY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (3/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules3')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// unsupported HOURLY
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'HOURLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (4/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules4')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// plain DAILY with INTERVAL
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'DAILY',
			interval: 5,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
		})
	})

	it('should properly load a recurrence-rule (5/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules5')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// DAILY with unsupported BYMONTH
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'DAILY',
			interval: 42,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (6/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules6')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// plain WEEKLY
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'WEEKLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['SU'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
		})
	})

	it('should properly load a recurrence-rule (7/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules7')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// WEEKLY with BYDAY
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'WEEKLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['MO', 'TU', 'WE'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
		})
	})

	it('should properly load a recurrence-rule (8/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules8')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// WEEKLY with unsupported BYDAY
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'WEEKLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['MO'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (9/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules9')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// WEEKLY with BYDAY and unsupported BYMONYH
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'WEEKLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['MO', 'TU', 'WE'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (10/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules10')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// plain MONTHLY
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [15],
			bySetPosition: null,
			isUnsupported: false,
		})
	})

	it('should properly load a recurrence-rule (11/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules11')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// MONTHLY with BYMONTHDAY
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [1, 2, 3, 30, 31],
			bySetPosition: null,
			isUnsupported: false,
		})
	})

	it('should properly load a recurrence-rule (12/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules12')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// MONTHLY with invalid BYMONTHDAY
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [2, 30, 31],
			bySetPosition: null,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (13/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules13')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// MONTHLY with BYMONTHDAY, BYDAY, BYSETPOS
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [1, 2, 3, 30, 31],
			bySetPosition: null,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (14/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules14')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// MONTHLY with BYDAY and BYSETPOS
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['MO'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: 3,
			isUnsupported: false,
		})
	})

	it('should properly load a recurrence-rule (15/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules15')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// MONTHLY with BYDAY and BYSETPOS, unsupported BYDAY
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: 3,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (16/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules16')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// MONTHLY with BYDAY and BYSETPOS, unsupported BYSETPOS
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['MO'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: 1,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (17/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules17')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// MONTHLY with BYDAY and BYSETPOS, unsupported multiple BYSETPOS
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['MO'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: 1,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (18/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules18')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// plain YEARLY
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'YEARLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [3],
			byMonthDay: [15],
			bySetPosition: null,
			isUnsupported: false,
		})
	})

	it('should properly load a recurrence-rule (19/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules19')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// YEARLY with BYMONTH
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'YEARLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [1, 2, 3],
			byMonthDay: [15],
			bySetPosition: null,
			isUnsupported: false,
		})
	})

	it('should properly load a recurrence-rule (20/24)', () => {
		// YEARLY with invalid BYMONTH
		// Skipped as it is fixed upstream
		// https://github.com/mozilla-comm/ical.js/pull/486
	})

	it('should properly load a recurrence-rule (21/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules21')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// YEARLY with BYDAY and BYSETPOS
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'YEARLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['MO'],
			byMonth: [3],
			byMonthDay: [],
			bySetPosition: 3,
			isUnsupported: false,
		})
	})

	it('should properly load a recurrence-rule (22/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules22')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// YEARLY with BYDAY and BYSETPOS, unsupported BYDAY
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'YEARLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'],
			byMonth: [3],
			byMonthDay: [],
			bySetPosition: 3,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (23/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules23')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// YEARLY with BYDAY and BYSETPOS, unsupported BYSETPOS
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'YEARLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['MO'],
			byMonth: [3],
			byMonthDay: [],
			bySetPosition: 1,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (24/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules24')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// YEARLY with BYDAY and BYSETPOS, unsupported multiple BYSETPOS
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'YEARLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['MO'],
			byMonth: [3],
			byMonthDay: [],
			bySetPosition: 1,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (25/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules25')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// MONTHLY with multiple BYDAY
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [15],
			bySetPosition: null,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (26/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules26')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// MONTHLY with BYDAY that includes a position
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['MO'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: 3,
			isUnsupported: false,
		})
	})

	it('should properly load a recurrence-rule (27/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules27')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// MONTHLY with BYDAY that includes a negative position
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['MO'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: 1,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (28/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules28')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// MONTHLY with BYDAY (only weekday)
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [15],
			bySetPosition: null,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (29/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules29')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// YEARLY with multiple BYDAY
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'YEARLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [3],
			byMonthDay: [15],
			bySetPosition: null,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (30/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules30')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// YEARLY with BYDAY that includes a position
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'YEARLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['MO'],
			byMonth: [3],
			byMonthDay: [],
			bySetPosition: 3,
			isUnsupported: false,
		})
	})

	it('should properly load a recurrence-rule (31/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules31')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// YEARLY with BYDAY that includes a negative position
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'YEARLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['MO'],
			byMonth: [3],
			byMonthDay: [],
			bySetPosition: 1,
			isUnsupported: true,
		})
	})

	it('should properly load a recurrence-rule (32/24)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrules32')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// YEARLY with BYDAY (only weekday)
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'YEARLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [3],
			byMonthDay: [15],
			bySetPosition: null,
			isUnsupported: true,
		})
	})

	it('should properly load recurrence-rules with count-limit', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrule-count')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		// plain MONTHLY
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'MONTHLY',
			interval: 1,
			count: 42,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [15],
			bySetPosition: null,
			isUnsupported: false,
		})
	})

	it('should properly load recurrence-rules with until-limit', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrule-until')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		const mockDate = new Date()
		getDateFromDateTimeValue
			.mockReturnValueOnce(mockDate)

		// plain MONTHLY
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: mockDate,
			byDay: [],
			byMonth: [],
			byMonthDay: [15],
			bySetPosition: null,
			isUnsupported: false,
		})

		expect(getDateFromDateTimeValue).toHaveBeenCalledTimes(1)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(1, recurrenceRuleValue.until)
	})

	it('should properly load recurrence-rules with both count and until-limit (mark as unsupported)', () => {
		const recurrenceRuleValue = getRecurValueFromAsset('rrules/rrule-count-and-until')
		const baseDate = DateTimeValue.fromData({
			year: 2020,
			month: 3,
			day: 15,
			isDate: true,
		})

		const mockDate = new Date()
		getDateFromDateTimeValue
			.mockReturnValueOnce(mockDate)


		// plain MONTHLY
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject(recurrenceRuleValue, baseDate)).toEqual({
			recurrenceRuleValue,
			frequency: 'MONTHLY',
			interval: 1,
			count: 5,
			until: mockDate,
			byDay: [],
			byMonth: [],
			byMonthDay: [15],
			bySetPosition: null,
			isUnsupported: true,
		})

		expect(getDateFromDateTimeValue).toHaveBeenCalledTimes(1)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(1, recurrenceRuleValue.until)
	})
})
