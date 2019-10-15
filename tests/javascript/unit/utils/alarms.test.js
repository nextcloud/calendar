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
	getFactorForAlarmUnit,
	getAmountHoursMinutesAndUnitForAllDayEvents,
	getAmountAndUnitForTimedEvents,
	getTotalSecondsFromAmountAndUnitForTimedEvents,
	getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents
} from '../../../../src/utils/alarms.js'

describe('utils/alarms test suite', () => {

	it('should return the correct factor for different units', () => {
		expect(getFactorForAlarmUnit('seconds')).toEqual(1)
		expect(getFactorForAlarmUnit('minutes')).toEqual(60)
		expect(getFactorForAlarmUnit('hours')).toEqual(3600)
		expect(getFactorForAlarmUnit('days')).toEqual(86400)
		expect(getFactorForAlarmUnit('weeks')).toEqual(604800)
		expect(getFactorForAlarmUnit('fallback-default')).toEqual(1)
	})

	it('should get the amount and unit from total seconds', () => {
		expect(getAmountAndUnitForTimedEvents(0)).toEqual({
			amount: 0,
			unit: 'minutes'
		})

		expect(getAmountAndUnitForTimedEvents(-60)).toEqual({
			amount: 1,
			unit: 'minutes'
		})

		expect(getAmountAndUnitForTimedEvents(59)).toEqual({
			amount: 59,
			unit: 'seconds'
		})

		expect(getAmountAndUnitForTimedEvents(-61)).toEqual({
			amount: 61,
			unit: 'seconds'
		})

		expect(getAmountAndUnitForTimedEvents(120)).toEqual({
			amount: 2,
			unit: 'minutes'
		})

		expect(getAmountAndUnitForTimedEvents(-3600)).toEqual({
			amount: 1,
			unit: 'hours'
		})

		expect(getAmountAndUnitForTimedEvents(3660)).toEqual({
			amount: 61,
			unit: 'minutes'
		})

		expect(getAmountAndUnitForTimedEvents(-43200)).toEqual({
			amount: 12,
			unit: 'hours'
		})

		expect(getAmountAndUnitForTimedEvents(259200)).toEqual({
			amount: 3,
			unit: 'days'
		})

		expect(getAmountAndUnitForTimedEvents(-1209600)).toEqual({
			amount: 2,
			unit: 'weeks'
		})
	})

	it('should get the total amount of seconds from amount and unit', () => {
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'seconds')).toEqual(-1)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'minutes')).toEqual(-60)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'hours')).toEqual(-3600)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'days')).toEqual(-86400)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'weeks')).toEqual(-604800)

		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(42, 'seconds')).toEqual(-42)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(42, 'minutes')).toEqual(-2520)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(42, 'hours')).toEqual(-151200)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(42, 'days')).toEqual(-3628800)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(42, 'weeks')).toEqual(-25401600)

		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'seconds', false)).toEqual(1)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'minutes', false)).toEqual(60)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'hours', false)).toEqual(3600)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'days', false)).toEqual(86400)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'weeks', false)).toEqual(604800)
	})

	it('should get the amount, hours, minutes and unit for a reminder of an all-day event', () => {
		// Same day at 9am 1 minute and 5 seconds
		expect(getAmountHoursMinutesAndUnitForAllDayEvents(32465)).toEqual({
			amount: 0,
			hours: 9,
			minutes: 1,
			unit: 'days'
		})

		// 1 day before at 9am
		expect(getAmountHoursMinutesAndUnitForAllDayEvents(-15 * 60 * 60)).toEqual({
			amount: 1,
			hours: 9,
			minutes: 0,
			unit: 'days'
		})

		// 2 days before at 9am
		expect(getAmountHoursMinutesAndUnitForAllDayEvents(-39 * 60 * 60)).toEqual({
			amount: 2,
			hours: 9,
			minutes: 0,
			unit: 'days'
		})

		// 1 week before at 9am
		expect(getAmountHoursMinutesAndUnitForAllDayEvents(-159 * 60 * 60)).toEqual({
			amount: 1,
			hours: 9,
			minutes: 0,
			unit: 'weeks'
		})

		// 10 days before at 9am
		expect(getAmountHoursMinutesAndUnitForAllDayEvents(-231 * 60 * 60)).toEqual({
			amount: 10,
			hours: 9,
			minutes: 0,
			unit: 'days'
		})

		// 1 week before at 8:30am
		expect(getAmountHoursMinutesAndUnitForAllDayEvents(-159 * 60 * 60 - 30 * 60)).toEqual({
			amount: 1,
			hours: 8,
			minutes: 30,
			unit: 'weeks'
		})
	})

	it('should get the total amount of seconds from amount, hours, minutes and unit', () => {
		expect(getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(0, 9, 1, 'days')).toEqual(32460)

		expect(getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(1, 9, 0, 'days')).toEqual(-15 * 60 * 60)

		expect(getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(2, 9, 0, 'days')).toEqual(-39 * 60 * 60)

		expect(getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(1, 9, 0, 'weeks')).toEqual(-159 * 60 * 60)

		expect(getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(10, 9, 0, 'days')).toEqual(-231 * 60 * 60)

		expect(getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(1, 8, 30, 'weeks')).toEqual(-159 * 60 * 60 - 30 * 60)
	})
})


