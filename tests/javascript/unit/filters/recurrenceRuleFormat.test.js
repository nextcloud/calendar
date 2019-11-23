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
import recurrenceRuleFormat from '../../../../src/filters/recurrenceRuleFormat.js'

import moment from '@nextcloud/moment'
import { translate, translatePlural, getDayNames, getMonthNames } from '@nextcloud/l10n'

jest.mock('@nextcloud/moment')
jest.mock('@nextcloud/l10n')

describe('format/recurrenceRuleFormat test suite', () => {

	beforeEach(() => {
		moment.mockClear()
		translate.mockClear()
		translatePlural.mockClear()

		translate
			.mockImplementation((app, str) => str)
		translatePlural
			.mockImplementation((app, sinStr, pluStr) => pluStr)
		getDayNames
			.mockReturnValue(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
		getMonthNames
			.mockReturnValue(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])
	})

	it('should format a recurrence-rule that is non-recurring', () => {
		expect(recurrenceRuleFormat({
			frequency: 'NONE',
				interval: 1,
				count: null,
				until: null,
				byDay: [],
				byMonth: [],
				byMonthDay: [],
				bySetPosition: null,
				isUnsupported: false,
				recurrenceRuleValue: null,
		}, 'de')).toEqual('Does not repeat')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Does not repeat')
	})

	it('should format a recurrence-rule that is recurring infinitely every day', () => {
		expect(recurrenceRuleFormat({
			frequency: 'DAILY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toEqual('Daily')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Daily')
	})

	it('should format a recurrence-rule that is recurring infinitely every week on Tuesday', () => {
		expect(recurrenceRuleFormat({
			frequency: 'WEEKLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['TU'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toEqual('Weekly on {weekdays}')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Weekly')
		expect(translatePlural).toHaveBeenCalledTimes(1)
		expect(translatePlural).toHaveBeenNthCalledWith(1, 'calendar', 'on {weekday}', 'on {weekdays}', 1, {
			weekday: 'Tuesday',
			weekdays: 'Tuesday',
		})
	})

	it('should format a recurrence-rule that is recurring infinitely every third week on Tuesday and Thursday', () => {
		expect(recurrenceRuleFormat({
			frequency: 'WEEKLY',
			interval: 3,
			count: null,
			until: null,
			byDay: ['TU', 'TH'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toEqual('Every %n weeks on {weekdays}')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(translate).toHaveBeenCalledTimes(0)
		expect(translatePlural).toHaveBeenCalledTimes(2)
		expect(translatePlural).toHaveBeenNthCalledWith(1, 'calendar', 'Every %n week', 'Every %n weeks', 3)
		expect(translatePlural).toHaveBeenNthCalledWith(2, 'calendar', 'on {weekday}', 'on {weekdays}', 2, {
			weekday: 'Tuesday, Thursday',
			weekdays: 'Tuesday, Thursday',
		})
	})

	it('should format a recurrence-rule that is recurring infinitely every other month on 15th', () => {
		expect(recurrenceRuleFormat({
			frequency: 'MONTHLY',
			interval: 2,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: ['15'],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toEqual('Every %n months on days {dayOfMonthList}')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(translate).toHaveBeenCalledTimes(0)
		expect(translatePlural).toHaveBeenCalledTimes(2)
		expect(translatePlural).toHaveBeenNthCalledWith(1, 'calendar', 'Every %n month', 'Every %n months', 2)
		expect(translatePlural).toHaveBeenNthCalledWith(2, 'calendar', 'on day {dayOfMonthList}', 'on days {dayOfMonthList}', 1, {
			dayOfMonthList: '15',
		})
	})

	it('should format a recurrence-rule that is recurring infinitely every month on 15th, 16th, 17th, 18th', () => {
		expect(recurrenceRuleFormat({
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: ['15', '16', '17', '18'],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toEqual('Monthly on days {dayOfMonthList}')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Monthly')
		expect(translatePlural).toHaveBeenCalledTimes(1)
		expect(translatePlural).toHaveBeenNthCalledWith(1, 'calendar', 'on day {dayOfMonthList}', 'on days {dayOfMonthList}', 4, {
			dayOfMonthList: '15, 16, 17, 18',
		})
	})

	it('should format a recurrence-rule that is recurring infinitely every month on last weekday', () => {
		expect(recurrenceRuleFormat({
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['MO', 'TU', 'WE', 'TH', 'FR'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: -1,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toEqual('Monthly on the {ordinalNumber} {byDaySet}')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(translate).toHaveBeenCalledTimes(3)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Monthly')
		expect(translate).toHaveBeenNthCalledWith(2, 'calendar', 'last')
		expect(translate).toHaveBeenNthCalledWith(3, 'calendar', 'on the {ordinalNumber} {byDaySet}', {
			ordinalNumber: 'last',
			byDaySet: 'Monday, Tuesday, Wednesday, Thursday, Friday',
		})
	})

	it('should format a recurrence-rule that is recurring infinitely every month second Wednesday', () => {
		expect(recurrenceRuleFormat({
			frequency: 'MONTHLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['WE'],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: 2,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toEqual('Monthly on the {ordinalNumber} {byDaySet}')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(translate).toHaveBeenCalledTimes(3)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Monthly')
		expect(translate).toHaveBeenNthCalledWith(2, 'calendar', 'second')
		expect(translate).toHaveBeenNthCalledWith(3, 'calendar', 'on the {ordinalNumber} {byDaySet}', {
			ordinalNumber: 'second',
			byDaySet: 'Wednesday',
		})
	})

	it('should format a recurrence-rule that is recurring infinitely every year in May', () => {
		expect(recurrenceRuleFormat({
			frequency: 'YEARLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: ['5'],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toEqual('Yearly in {monthNames}')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(translate).toHaveBeenCalledTimes(2)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Yearly')
		expect(translate).toHaveBeenNthCalledWith(2, 'calendar', 'in {monthNames}', {
			monthNames: 'May'
		})
	})

	it('should format a recurrence-rule that is recurring infinitely every year in May, July, October', () => {
		expect(recurrenceRuleFormat({
			frequency: 'YEARLY',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: ['5', '7', '10'],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toEqual('Yearly in {monthNames}')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(translate).toHaveBeenCalledTimes(2)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Yearly')
		expect(translate).toHaveBeenNthCalledWith(2, 'calendar', 'in {monthNames}', {
			monthNames: 'May, July, October'
		})
	})

	it('should format a recurrence-rule that is recurring infinitely every year in May, July, October on third Thursday', () => {
		expect(recurrenceRuleFormat({
			frequency: 'YEARLY',
			interval: 1,
			count: null,
			until: null,
			byDay: ['TH'],
			byMonth: ['5', '7', '10'],
			byMonthDay: [],
			bySetPosition: 3,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toEqual('Yearly in {monthNames} on the {ordinalNumber} {byDaySet}')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(moment).toHaveBeenCalledTimes(0)
		expect(translate).toHaveBeenCalledTimes(3)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Yearly')
		expect(translate).toHaveBeenNthCalledWith(2, 'calendar', 'third')
		expect(translate).toHaveBeenNthCalledWith(3, 'calendar', 'in {monthNames} on the {ordinalNumber} {byDaySet}', {
			monthNames: 'May, July, October',
			ordinalNumber: 'third',
			byDaySet: 'Thursday'
		})
	})

	it('should format a recurrence-rule that is recurring every day until a certain date', () => {
		const date = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))

		const format = jest.fn()
			.mockReturnValue('formatted-allday-date')
		const locale = jest.fn()
			.mockReturnValue({ format })
		moment
			.mockReturnValue({ locale })

		expect(recurrenceRuleFormat({
			frequency: 'DAILY',
			interval: 1,
			count: null,
			until: date,
			byDay: [],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toEqual('Daily until {untilDate}')

		expect(moment).toHaveBeenCalledTimes(1)
		expect(moment).toHaveBeenNthCalledWith(1, date)
		expect(locale).toHaveBeenCalledTimes(1)
		expect(locale).toHaveBeenNthCalledWith(1, 'de')
		expect(format).toHaveBeenCalledTimes(1)
		expect(format).toHaveBeenNthCalledWith(1, 'L')
		expect(translate).toHaveBeenCalledTimes(2)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Daily')
		expect(translate).toHaveBeenNthCalledWith(2, 'calendar', 'until {untilDate}', {
			untilDate: 'formatted-allday-date'
		})
	})

	it('should format a recurrence-rule that is recurring every day exactly 10 times', () => {
		expect(recurrenceRuleFormat({
			frequency: 'DAILY',
			interval: 1,
			count: 42,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
			isUnsupported: false,
			recurrenceRuleValue: null,
		}, 'de')).toEqual('Daily %n times')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Daily')
		expect(translatePlural).toHaveBeenCalledTimes(1)
		expect(translatePlural).toHaveBeenNthCalledWith(1, 'calendar', '%n time', '%n times', 42)
	})
})
