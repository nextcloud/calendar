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
