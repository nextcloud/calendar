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

import moment from '@nextcloud/moment'
import dateRangeFormat from "../../../../src/filters/dateRangeFormat.js";
import { translate } from '@nextcloud/l10n'

jest.mock('@nextcloud/moment')
jest.mock('@nextcloud/l10n')

describe('format/dateRangeFormat test suite', () => {

	beforeEach(() => {
		moment.mockClear()
		translate.mockClear()
	})

	it('should provide a format for day view', () => {
		const date = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))

		const format = jest.fn()
			.mockReturnValue('formatted-allday-date')
		const locale = jest.fn()
			.mockReturnValue({ format })
		moment
			.mockReturnValue({ locale })

		expect(dateRangeFormat(date, 'timeGridDay', 'de')).toEqual('formatted-allday-date')

		expect(moment).toHaveBeenCalledTimes(1)
		expect(moment).toHaveBeenNthCalledWith(1, date)
		expect(locale).toHaveBeenCalledTimes(1)
		expect(locale).toHaveBeenNthCalledWith(1, 'de')
		expect(format).toHaveBeenCalledTimes(1)
		expect(format).toHaveBeenNthCalledWith(1, 'll')

		expect(translate).toHaveBeenCalledTimes(0)
	})

	it('should provide a format for week view', () => {
		translate
			.mockImplementation((app, str) => str)

		const date = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))

		const week = jest.fn()
			.mockReturnValue('week-no')
		const weekYear = jest.fn()
			.mockReturnValue('week-year')
		const locale = jest.fn()
			.mockReturnValue({ week, weekYear })
		moment
			.mockReturnValue({ locale })

		expect(dateRangeFormat(date, 'timeGridWeek', 'de')).toEqual('Week {number} of {year}')

		expect(moment).toHaveBeenCalledTimes(2)
		expect(moment).toHaveBeenNthCalledWith(1, date)
		expect(moment).toHaveBeenNthCalledWith(2, date)
		expect(locale).toHaveBeenCalledTimes(2)
		expect(locale).toHaveBeenNthCalledWith(1, 'de')
		expect(locale).toHaveBeenNthCalledWith(2, 'de')
		expect(week).toHaveBeenCalledTimes(1)
		expect(week).toHaveBeenNthCalledWith(1)
		expect(weekYear).toHaveBeenCalledTimes(1)
		expect(weekYear).toHaveBeenNthCalledWith(1)

		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Week {number} of {year}', {
			number: 'week-no',
			year: 'week-year',
		})
	})

	it('should provide a format for month view', () => {
		const date = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))

		const format = jest.fn()
			.mockReturnValue('formatted-allday-month-year')
		const locale = jest.fn()
			.mockReturnValue({ format })
		moment
			.mockReturnValue({ locale })

		expect(dateRangeFormat(date, 'dayGridMonth', 'de')).toEqual('formatted-allday-month-year')

		expect(moment).toHaveBeenCalledTimes(1)
		expect(moment).toHaveBeenNthCalledWith(1, date)
		expect(locale).toHaveBeenCalledTimes(1)
		expect(locale).toHaveBeenNthCalledWith(1, 'de')
		expect(format).toHaveBeenCalledTimes(1)
		expect(format).toHaveBeenNthCalledWith(1, 'MMMM YYYY')

		expect(translate).toHaveBeenCalledTimes(0)
	})

	it('should provide month as fallback for unknown view', () => {
		const date = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))

		const format = jest.fn()
			.mockReturnValue('formatted-allday-month-year')
		const locale = jest.fn()
			.mockReturnValue({ format })
		moment
			.mockReturnValue({ locale })

		expect(dateRangeFormat(date, 'fooBarUnknownView', 'de')).toEqual('formatted-allday-month-year')

		expect(moment).toHaveBeenCalledTimes(1)
		expect(moment).toHaveBeenNthCalledWith(1, date)
		expect(locale).toHaveBeenCalledTimes(1)
		expect(locale).toHaveBeenNthCalledWith(1, 'de')
		expect(format).toHaveBeenCalledTimes(1)
		expect(format).toHaveBeenNthCalledWith(1, 'MMMM YYYY')

		expect(translate).toHaveBeenCalledTimes(0)
	})

})
