/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { getDurationValueFromFullCalendarDuration, getFullCalendarDurationFromDurationValue } from '../../../../src/fullcalendar/duration.js'

describe('fullcalendar/duration test suite', () => {

	it('should get the calendar-js duration from a fullcalendar duration object - object', () => {
		expect(getDurationValueFromFullCalendarDuration({
			year: 99,
			days: 2,
		})).toEqual(null)

		expect(getDurationValueFromFullCalendarDuration({
			days: 2,
			minutes: 50,
			seconds: 2
		}).totalSeconds).toEqual(175802)

		expect(getDurationValueFromFullCalendarDuration({
			day: 2,
			minute: 50,
			second: 2
		}).totalSeconds).toEqual(175802)

		expect(getDurationValueFromFullCalendarDuration({
			days: 1,
			day: 1,
			minutes: 25,
			minute: 25,
			seconds: 1,
			second: 1,
			milliseconds: 5555,
			millisecond: 6666,
			ms: 7777
		}).totalSeconds).toEqual(175820)
	})

	it('should get the calendar-js duration from a fullcalendar duration object - string', () => {
		expect(getDurationValueFromFullCalendarDuration('05:00').totalSeconds).toEqual(18000)
		expect(getDurationValueFromFullCalendarDuration('05:21').totalSeconds).toEqual(19260)
		expect(getDurationValueFromFullCalendarDuration('05:21:50').totalSeconds).toEqual(19310)
		expect(getDurationValueFromFullCalendarDuration('05:21:23.678').totalSeconds).toEqual(19283)
		expect(getDurationValueFromFullCalendarDuration('FOO')).toEqual(null)
	})

	it('should get the calendar-js duration from a fullcalendar duration object - number', () => {
		expect(getDurationValueFromFullCalendarDuration(5000).totalSeconds).toEqual(5)
		expect(getDurationValueFromFullCalendarDuration(5555).totalSeconds).toEqual(5)
	})

	it('should get the calendar-js duration from a fullcalendar duration object - other', () => {
		expect(getDurationValueFromFullCalendarDuration(false)).toEqual(null)
	})

	it('should get the fullcalendar duration from a calendar-js duration object', () => {
		expect(getFullCalendarDurationFromDurationValue({ totalSeconds: 500 })).toEqual({ seconds: 500 })
	})
})
