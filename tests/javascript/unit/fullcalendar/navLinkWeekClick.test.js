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
import navLinkWeekClick from '../../../../src/fullcalendar/navLinkWeekClick.js'
import { getYYYYMMDDFromDate } from '../../../../src/utils/date.js'
jest.mock('../../../../src/utils/date.js')

describe('fullcalendar/eventClick test suite', () => {

	beforeEach(() => {
		getYYYYMMDDFromDate.mockClear()
	})

	it('should open the clicked day in week view', () => {
		const router = {
			push: jest.fn(),
		}
		const route = {
			name: 'CalendarView',
			params: {
				view: 'dayGridMonth',
				firstDay: 'now',
				otherParam: '456',
			},
		}

		getYYYYMMDDFromDate
			.mockReturnValueOnce('first-day-param-of-date')

		const date = new Date(Date.UTC(2019, 11, 5, 12, 36, 48, 0))

		const navLinkWeekClickFunction = navLinkWeekClick(router, route)
		navLinkWeekClickFunction(date)

		expect(getYYYYMMDDFromDate).toHaveBeenCalledTimes(1)
		expect(getYYYYMMDDFromDate).toHaveBeenNthCalledWith(1, date)

		expect(router.push.mock.calls.length).toEqual(1)
		expect(router.push.mock.calls[0][0]).toEqual({
			name: 'CalendarView',
			params: {
				otherParam: '456',
				view: 'timeGridWeek',
				firstDay: 'first-day-param-of-date',
			}
		})
	})

	it('should open the clicked day in week view (already on correct date)', () => {
		const router = {
			push: jest.fn(),
		}
		const route = {
			name: 'CalendarView',
			params: {
				view: 'dayGridMonth',
				firstDay: 'first-day-param-of-date',
				otherParam: '456',
			},
		}

		getYYYYMMDDFromDate
			.mockReturnValueOnce('first-day-param-of-date')

		const date = new Date(Date.UTC(2019, 11, 5, 12, 36, 48, 0))

		const navLinkWeekClickFunction = navLinkWeekClick(router, route)
		navLinkWeekClickFunction(date)

		expect(getYYYYMMDDFromDate).toHaveBeenCalledTimes(1)
		expect(getYYYYMMDDFromDate).toHaveBeenNthCalledWith(1, date)

		expect(router.push.mock.calls.length).toEqual(1)
		expect(router.push.mock.calls[0][0]).toEqual({
			name: 'CalendarView',
			params: {
				otherParam: '456',
				view: 'timeGridWeek',
				firstDay: 'first-day-param-of-date',
			}
		})
	})

	it('should open the clicked day in week view (already in correct view)', () => {
		const router = {
			push: jest.fn(),
		}
		const route = {
			name: 'CalendarView',
			params: {
				view: 'timeGridWeek',
				firstDay: 'now',
				otherParam: '456',
			},
		}

		getYYYYMMDDFromDate
			.mockReturnValueOnce('first-day-param-of-date')

		const date = new Date(Date.UTC(2019, 11, 5, 12, 36, 48, 0))

		const navLinkWeekClickFunction = navLinkWeekClick(router, route)
		navLinkWeekClickFunction(date)

		expect(getYYYYMMDDFromDate).toHaveBeenCalledTimes(1)
		expect(getYYYYMMDDFromDate).toHaveBeenNthCalledWith(1, date)

		expect(router.push.mock.calls.length).toEqual(1)
		expect(router.push.mock.calls[0][0]).toEqual({
			name: 'CalendarView',
			params: {
				otherParam: '456',
				view: 'timeGridWeek',
				firstDay: 'first-day-param-of-date',
			}
		})
	})

	it('should not open a duplicate route', () => {
		const router = {
			push: jest.fn(),
		}
		const route = {
			name: 'CalendarView',
			params: {
				view: 'timeGridWeek',
				firstDay: 'first-day-param-of-date',
				otherParam: '456',
			},
		}

		getYYYYMMDDFromDate
			.mockReturnValueOnce('first-day-param-of-date')

		const date = new Date(Date.UTC(2019, 11, 5, 12, 36, 48, 0))

		const navLinkWeekClickFunction = navLinkWeekClick(router, route)
		navLinkWeekClickFunction(date)

		expect(getYYYYMMDDFromDate).toHaveBeenCalledTimes(1)
		expect(getYYYYMMDDFromDate).toHaveBeenNthCalledWith(1, date)

		expect(router.push.mock.calls.length).toEqual(0)
	})
})
