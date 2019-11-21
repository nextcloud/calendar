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
import alarmFormat from "../../../../src/filters/alarmFormat.js";
import moment from '@nextcloud/moment'
import { translate, translatePlural } from '@nextcloud/l10n'

jest.mock('@nextcloud/moment')
jest.mock('@nextcloud/l10n')

describe('format/alarmFormat test suite', () => {

	beforeEach(() => {
		moment.mockClear()
		translate.mockClear()
		translatePlural.mockClear()

		translate
			.mockImplementation((app, str) => str)

		translatePlural
			.mockImplementation((app, singStr, pluStr) => pluStr)
	})

	it('should format an alarm for an all-day event at midnight', () => {
		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: true,
			relativeIsRelatedToStart: true,
			relativeAmountTimed: 0,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 0,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 0,
			relativeMinutesAllDay: 0,
			relativeTrigger: 0,
		}

		expect(alarmFormat(alarm, true, 'Europe/Berlin', 'de')).toEqual('Midnight on the day the event starts')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Midnight on the day the event starts')
		expect(translatePlural).toHaveBeenCalledTimes(0)
	})

	it('should format an alarm for an all-day event days before', () => {
		const format = jest.fn()
			.mockReturnValue('formatted-LT')
		const locale = jest.fn()
			.mockReturnValue({ format })
		moment
			.mockReturnValue({ locale })

		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: true,
			relativeIsRelatedToStart: true,
			relativeAmountTimed: 0,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 1,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 9,
			relativeMinutesAllDay: 0,
			relativeTrigger: -15 * 60 * 60,
		}

		expect(alarmFormat(alarm, true, 'Europe/Berlin', 'de')).toEqual('%n days before the event at {formattedHourMinute}')

		expect(moment).toHaveBeenCalledTimes(1)
		expect(moment.mock.calls[0][0].getHours()).toEqual(9)
		expect(moment.mock.calls[0][0].getMinutes()).toEqual(0)
		expect(moment.mock.calls[0][0].getSeconds()).toEqual(0)
		expect(moment.mock.calls[0][0].getMilliseconds()).toEqual(0)
		expect(locale).toHaveBeenCalledTimes(1)
		expect(locale).toHaveBeenNthCalledWith(1, 'de')
		expect(format).toHaveBeenCalledTimes(1)
		expect(format).toHaveBeenNthCalledWith(1, 'LT')
		expect(translate).toHaveBeenCalledTimes(0)
		expect(translatePlural).toHaveBeenCalledTimes(1)
		expect(translatePlural).toHaveBeenNthCalledWith(1,
			'calendar',
			'%n day before the event at {formattedHourMinute}',
			'%n days before the event at {formattedHourMinute}',
			1,
			{
				formattedHourMinute: 'formatted-LT',
			},
		)
	})

	it('should format an alarm for an all-day event weeks weeks before', () => {
		const format = jest.fn()
			.mockReturnValue('formatted-LT')
		const locale = jest.fn()
			.mockReturnValue({ format })
		moment
			.mockReturnValue({ locale })

		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: true,
			relativeIsRelatedToStart: true,
			relativeAmountTimed: 0,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 1,
			relativeUnitAllDay: 'weeks',
			relativeHoursAllDay: 9,
			relativeMinutesAllDay: 0,
			relativeTrigger: -159 * 60 * 60 - 30 * 60,
		}

		expect(alarmFormat(alarm, true, 'Europe/Berlin', 'de')).toEqual('%n weeks before the event at {formattedHourMinute}')

		expect(moment).toHaveBeenCalledTimes(1)
		expect(moment.mock.calls[0][0].getHours()).toEqual(9)
		expect(moment.mock.calls[0][0].getMinutes()).toEqual(0)
		expect(moment.mock.calls[0][0].getSeconds()).toEqual(0)
		expect(moment.mock.calls[0][0].getMilliseconds()).toEqual(0)
		expect(locale).toHaveBeenCalledTimes(1)
		expect(locale).toHaveBeenNthCalledWith(1, 'de')
		expect(format).toHaveBeenCalledTimes(1)
		expect(format).toHaveBeenNthCalledWith(1, 'LT')
		expect(translate).toHaveBeenCalledTimes(0)
		expect(translatePlural).toHaveBeenCalledTimes(1)
		expect(translatePlural).toHaveBeenNthCalledWith(1,
			'calendar',
			'%n week before the event at {formattedHourMinute}',
			'%n weeks before the event at {formattedHourMinute}',
			1,
			{
				formattedHourMinute: 'formatted-LT',
			},
		)
	})

	it('should format an alarm for an all-day event on the same day at a certain time', () => {
		const format = jest.fn()
			.mockReturnValue('formatted-LT')
		const locale = jest.fn()
			.mockReturnValue({ format })
		moment
			.mockReturnValue({ locale })

		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: false,
			relativeIsRelatedToStart: true,
			relativeAmountTimed: 0,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 0,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 9,
			relativeMinutesAllDay: 0,
			relativeTrigger: 32400,
		}

		expect(alarmFormat(alarm, true, 'Europe/Berlin', 'de')).toEqual('on the day of the event at {formattedHourMinute}')

		expect(moment).toHaveBeenCalledTimes(1)
		expect(moment.mock.calls[0][0].getHours()).toEqual(9)
		expect(moment.mock.calls[0][0].getMinutes()).toEqual(0)
		expect(moment.mock.calls[0][0].getSeconds()).toEqual(0)
		expect(moment.mock.calls[0][0].getMilliseconds()).toEqual(0)
		expect(locale).toHaveBeenCalledTimes(1)
		expect(locale).toHaveBeenNthCalledWith(1, 'de')
		expect(format).toHaveBeenCalledTimes(1)
		expect(format).toHaveBeenNthCalledWith(1, 'LT')
		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1,
			'calendar',
			'on the day of the event at {formattedHourMinute}',
			{
				formattedHourMinute: 'formatted-LT',
			},
		)
		expect(translatePlural).toHaveBeenCalledTimes(0)
	})

	it('should format an alarm for an all-day event not supported in the default range', () => {
		const humanize = jest.fn()
			.mockReturnValue('humanized-time')
		const locale = jest.fn()
			.mockReturnValue({ humanize })
		moment.duration = jest.fn()
			.mockReturnValue({ locale })

		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: false,
			relativeIsRelatedToStart: true,
			relativeAmountTimed: 33,
			relativeUnitTimed: 'hours',
			relativeAmountAllDay: 1,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 9,
			relativeMinutesAllDay: 0,
			relativeTrigger: 118800,
		}

		expect(alarmFormat(alarm, true, 'Europe/Berlin', 'de')).toEqual('{time} after the event starts')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(moment.duration).toHaveBeenCalledTimes(1)
		expect(moment.duration).toHaveBeenNthCalledWith(1, 118800, 'seconds')
		expect(locale).toHaveBeenCalledTimes(1)
		expect(locale).toHaveBeenNthCalledWith(1, 'de')
		expect(humanize).toHaveBeenCalledTimes(1)
		expect(humanize).toHaveBeenNthCalledWith(1)
		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', '{time} after the event starts', {
			time: 'humanized-time',
		})
		expect(translatePlural).toHaveBeenCalledTimes(0)
	})
	
	it('should format a relative trigger at the events start', () => {
		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: true,
			relativeIsRelatedToStart: true,
			relativeAmountTimed: 0,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 0,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 0,
			relativeMinutesAllDay: 0,
			relativeTrigger: 0,
		}

		expect(alarmFormat(alarm, false, 'Europe/Berlin', 'de')).toEqual('at the event\'s start')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'at the event\'s start')
		expect(translatePlural).toHaveBeenCalledTimes(0)
	})
	
	it('should format a relative trigger at the events end', () => {
		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: true,
			relativeIsRelatedToStart: false,
			relativeAmountTimed: 0,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 0,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 0,
			relativeMinutesAllDay: 0,
			relativeTrigger: 0,
		}

		expect(alarmFormat(alarm, false, 'Europe/Berlin', 'de')).toEqual('at the event\'s end')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'at the event\'s end')
		expect(translatePlural).toHaveBeenCalledTimes(0)
	})

	it('should format a relative trigger before the event starts', () => {
		const humanize = jest.fn()
			.mockReturnValue('humanized-time')
		const locale = jest.fn()
			.mockReturnValue({ humanize })
		moment.duration = jest.fn()
			.mockReturnValue({ locale })

		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: true,
			relativeIsRelatedToStart: true,
			relativeAmountTimed: 15,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 0,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 0,
			relativeMinutesAllDay: 0,
			relativeTrigger: -900,
		}

		expect(alarmFormat(alarm, false, 'Europe/Berlin', 'de')).toEqual('{time} before the event starts')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(moment.duration).toHaveBeenCalledTimes(1)
		expect(moment.duration).toHaveBeenNthCalledWith(1, 900, 'seconds')
		expect(locale).toHaveBeenCalledTimes(1)
		expect(locale).toHaveBeenNthCalledWith(1, 'de')
		expect(humanize).toHaveBeenCalledTimes(1)
		expect(humanize).toHaveBeenNthCalledWith(1)
		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', '{time} before the event starts', {
			time: 'humanized-time',
		})
		expect(translatePlural).toHaveBeenCalledTimes(0)
	})

	it('should format a relative trigger before the event ends', () => {
		const humanize = jest.fn()
			.mockReturnValue('humanized-time')
		const locale = jest.fn()
			.mockReturnValue({ humanize })
		moment.duration = jest.fn()
			.mockReturnValue({ locale })

		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: true,
			relativeIsRelatedToStart: false,
			relativeAmountTimed: 15,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 0,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 0,
			relativeMinutesAllDay: 0,
			relativeTrigger: -900,
		}

		expect(alarmFormat(alarm, false, 'Europe/Berlin', 'de')).toEqual('{time} before the event ends')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(moment.duration).toHaveBeenCalledTimes(1)
		expect(moment.duration).toHaveBeenNthCalledWith(1, 900, 'seconds')
		expect(locale).toHaveBeenCalledTimes(1)
		expect(locale).toHaveBeenNthCalledWith(1, 'de')
		expect(humanize).toHaveBeenCalledTimes(1)
		expect(humanize).toHaveBeenNthCalledWith(1)
		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', '{time} before the event ends', {
			time: 'humanized-time',
		})
		expect(translatePlural).toHaveBeenCalledTimes(0)
	})

	it('should format a relative trigger after the event starts', () => {
		const humanize = jest.fn()
			.mockReturnValue('humanized-time')
		const locale = jest.fn()
			.mockReturnValue({ humanize })
		moment.duration = jest.fn()
			.mockReturnValue({ locale })

		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: false,
			relativeIsRelatedToStart: true,
			relativeAmountTimed: 15,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 0,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 0,
			relativeMinutesAllDay: 0,
			relativeTrigger: 900,
		}

		expect(alarmFormat(alarm, false, 'Europe/Berlin', 'de')).toEqual('{time} after the event starts')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(moment.duration).toHaveBeenCalledTimes(1)
		expect(moment.duration).toHaveBeenNthCalledWith(1, 900, 'seconds')
		expect(locale).toHaveBeenCalledTimes(1)
		expect(locale).toHaveBeenNthCalledWith(1, 'de')
		expect(humanize).toHaveBeenCalledTimes(1)
		expect(humanize).toHaveBeenNthCalledWith(1)
		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', '{time} after the event starts', {
			time: 'humanized-time',
		})
		expect(translatePlural).toHaveBeenCalledTimes(0)
	})

	it('should format a relative trigger after the event ends', () => {
		const humanize = jest.fn()
			.mockReturnValue('humanized-time')
		const locale = jest.fn()
			.mockReturnValue({ humanize })
		moment.duration = jest.fn()
			.mockReturnValue({ locale })

		const alarm = {
			type: 'EMAIL',
			isRelative: true,
			absoluteDate: null,
			absoluteTimezoneId: null,
			relativeIsBefore: false,
			relativeIsRelatedToStart: false,
			relativeAmountTimed: 15,
			relativeUnitTimed: 'minutes',
			relativeAmountAllDay: 0,
			relativeUnitAllDay: 'days',
			relativeHoursAllDay: 0,
			relativeMinutesAllDay: 0,
			relativeTrigger: 900,
		}

		expect(alarmFormat(alarm, false, 'Europe/Berlin', 'de')).toEqual('{time} after the event ends')

		expect(moment).toHaveBeenCalledTimes(0)
		expect(moment.duration).toHaveBeenCalledTimes(1)
		expect(moment.duration).toHaveBeenNthCalledWith(1, 900, 'seconds')
		expect(locale).toHaveBeenCalledTimes(1)
		expect(locale).toHaveBeenNthCalledWith(1, 'de')
		expect(humanize).toHaveBeenCalledTimes(1)
		expect(humanize).toHaveBeenNthCalledWith(1)
		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', '{time} after the event ends', {
			time: 'humanized-time',
		})
		expect(translatePlural).toHaveBeenCalledTimes(0)
	})

	it('should format an absolute alarm in the user\'s timezone', () => {
		const format = jest.fn()
			.mockReturnValue('formatted-LLLL')
		const locale = jest.fn()
			.mockReturnValue({ format })
		moment
			.mockReturnValue({ locale })

		const date = new Date(2019, 0, 1, 0, 0, 0, 0)
		const alarm = {
			type: 'EMAIL',
			isRelative: false,
			absoluteDate: date,
			absoluteTimezoneId: 'Europe/Berlin',
			relativeIsBefore: null,
			relativeIsRelatedToStart: null,
			relativeAmountTimed: null,
			relativeUnitTimed: null,
			relativeAmountAllDay: null,
			relativeUnitAllDay: null,
			relativeHoursAllDay: null,
			relativeMinutesAllDay: null,
			relativeTrigger: null,
		}

		expect(alarmFormat(alarm, false, 'Europe/Berlin', 'de')).toEqual('on {time}')

		expect(moment).toHaveBeenCalledTimes(1)
		expect(moment).toHaveBeenNthCalledWith(1, date)
		expect(locale).toHaveBeenCalledTimes(1)
		expect(locale).toHaveBeenNthCalledWith(1, 'de')
		expect(format).toHaveBeenCalledTimes(1)
		expect(format).toHaveBeenNthCalledWith(1, 'LLLL')
		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'on {time}', {
			time: 'formatted-LLLL'
		})
		expect(translatePlural).toHaveBeenCalledTimes(0)
	})

	it('should format an absolute alarm in a different timezone', () => {
		const format = jest.fn()
			.mockReturnValue('formatted-LLLL')
		const locale = jest.fn()
			.mockReturnValue({ format })
		moment
			.mockReturnValue({ locale })

		const date = new Date(2019, 0, 1, 0, 0, 0, 0)
		const alarm = {
			type: 'EMAIL',
			isRelative: false,
			absoluteDate: date,
			absoluteTimezoneId: 'America/New_York',
			relativeIsBefore: null,
			relativeIsRelatedToStart: null,
			relativeAmountTimed: null,
			relativeUnitTimed: null,
			relativeAmountAllDay: null,
			relativeUnitAllDay: null,
			relativeHoursAllDay: null,
			relativeMinutesAllDay: null,
			relativeTrigger: null,
		}

		expect(alarmFormat(alarm, true, 'Europe/Berlin', 'de')).toEqual('on {time} ({timezoneId})')

		expect(moment).toHaveBeenCalledTimes(1)
		expect(moment).toHaveBeenNthCalledWith(1, date)
		expect(locale).toHaveBeenCalledTimes(1)
		expect(locale).toHaveBeenNthCalledWith(1, 'de')
		expect(format).toHaveBeenCalledTimes(1)
		expect(format).toHaveBeenNthCalledWith(1, 'LLLL')
		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'on {time} ({timezoneId})', {
			time: 'formatted-LLLL',
			timezoneId: 'America/New_York',
		})
		expect(translatePlural).toHaveBeenCalledTimes(0)
	})

})
