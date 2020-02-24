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
import {
	dateFactory,
	getYYYYMMDDFromDate,
	getUnixTimestampFromDate,
	getDateFromFirstdayParam,
	getYYYYMMDDFromFirstdayParam,
	getDateFromDateTimeValue,
	modifyDate
} from '../../../../src/utils/date.js'

describe('utils/alarms test suite', () => {

	it('should return a date', () => {
		expect(dateFactory()).toBeInstanceOf(Date)
	})

	it('should return YYYYMMDD from a given date object', () => {
		expect(getYYYYMMDDFromDate(new Date(2019, 0, 1, 0, 0, 0))).toEqual('2019-01-01')
		expect(getYYYYMMDDFromDate(new Date(2019, 11, 31, 23, 59, 59))).toEqual('2019-12-31')
	})

	it('should return the unix timestamp from a given date object', () => {
		expect(getUnixTimestampFromDate(new Date(Date.UTC(2019, 0, 1, 23, 59, 59)))).toEqual(1546387199)
		expect(getUnixTimestampFromDate(new Date(Date.UTC(2019, 11, 31, 23, 59, 59)))).toEqual(1577836799)
	})

	it('should get a date object from the first-day-parameter', () => {
		expect(getDateFromFirstdayParam('now')).toBeInstanceOf(Date)

		const date1 = getDateFromFirstdayParam('2019-01-01')
		const date2 = getDateFromFirstdayParam('2019-12-31')

		const expectedTimezoneOffset = new Date().getTimezoneOffset()

		expect(date1.getFullYear()).toEqual(2019)
		expect(date1.getMonth()).toEqual(0)
		expect(date1.getDate()).toEqual(1)
		expect(date1.getHours()).toEqual(0)
		expect(date1.getMinutes()).toEqual(0)
		expect(date1.getSeconds()).toEqual(0)
		expect(date1.getMilliseconds()).toEqual(0)
		expect(date1.getTimezoneOffset()).toEqual(expectedTimezoneOffset)

		expect(date2.getFullYear()).toEqual(2019)
		expect(date2.getMonth()).toEqual(11)
		expect(date2.getDate()).toEqual(31)
		expect(date2.getHours()).toEqual(0)
		expect(date2.getMinutes()).toEqual(0)
		expect(date2.getSeconds()).toEqual(0)
		expect(date2.getMilliseconds()).toEqual(0)
		expect(date2.getTimezoneOffset()).toEqual(expectedTimezoneOffset)
	})

	it('shoud get YYYYMMDD from a given first day-param', () => {
		expect(getYYYYMMDDFromFirstdayParam('now')).toEqual(expect.any(String))

		const date1 = getYYYYMMDDFromFirstdayParam('2019-01-01')
		const date2 = getYYYYMMDDFromFirstdayParam('2019-12-31')

		expect(date1).toEqual('2019-01-01')
		expect(date2).toEqual('2019-12-31')
	})

	it('should return from a date-time-value', () => {
		const date = getDateFromDateTimeValue({
			year: 2019,
			month: 1,
			day: 1,
			hour: 14,
			minute: 42,
			seconds: 13
		})

		expect(date.getFullYear()).toEqual(2019)
		expect(date.getMonth()).toEqual(0)
		expect(date.getDate()).toEqual(1)
		expect(date.getHours()).toEqual(14)
		expect(date.getMinutes()).toEqual(42)
		expect(date.getSeconds()).toEqual(0)
		expect(date.getMilliseconds()).toEqual(0)
	})

	it('should modify a date', () => {
		const date1 = modifyDate(new Date(2019, 0, 1, 0, 0, 0), { day: 5 })
		const date2 = modifyDate(new Date(2019, 0, 1, 0, 0, 0), { day: 60 })
		const date3 = modifyDate(new Date(2019, 0, 1, 0, 0, 0), { week: 1 })
		const date4 = modifyDate(new Date(2019, 0, 1, 0, 0, 0), { week: 7 })
		const date5 = modifyDate(new Date(2019, 0, 1, 0, 0, 0), { month: 1 })
		const date6 = modifyDate(new Date(2019, 0, 1, 0, 0, 0), { month: 18 })
		const date7 = modifyDate(new Date(2019, 0, 1, 0, 0, 0), { day: 22, week: 42, month: 5 })

		expect(date1.getFullYear()).toEqual(2019)
		expect(date1.getMonth()).toEqual(0)
		expect(date1.getDate()).toEqual(6)

		expect(date2.getFullYear()).toEqual(2019)
		expect(date2.getMonth()).toEqual(2)
		expect(date2.getDate()).toEqual(2)

		expect(date3.getFullYear()).toEqual(2019)
		expect(date3.getMonth()).toEqual(0)
		expect(date3.getDate()).toEqual(8)

		expect(date4.getFullYear()).toEqual(2019)
		expect(date4.getMonth()).toEqual(1)
		expect(date4.getDate()).toEqual(19)

		expect(date5.getFullYear()).toEqual(2019)
		expect(date5.getMonth()).toEqual(1)
		expect(date5.getDate()).toEqual(1)

		expect(date6.getFullYear()).toEqual(2020)
		expect(date6.getMonth()).toEqual(6)
		expect(date6.getDate()).toEqual(1)

		expect(date7.getFullYear()).toEqual(2020)
		expect(date7.getMonth()).toEqual(3)
		expect(date7.getDate()).toEqual(13)
	})
})
