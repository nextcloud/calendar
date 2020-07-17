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
import select from "../../../../src/fullcalendar/select.js";

describe('fullcalendar/select test suite', () => {

	it('should open the Popover on big screens', () => {
		const store = { state: { settings: { skipPopover: false } } }
		const router = { push: jest.fn() }
		const route = { name: 'CalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 1920 }

		const start = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2019, 0, 2, 0, 0, 0, 0))
		const allDay = true

		const selectFunction = select(store, router, route, window)
		selectFunction({ start, end, allDay })

		expect(router.push).toHaveBeenCalledTimes(1)
		expect(router.push).toHaveBeenNthCalledWith(1, {
			name: 'NewPopoverView',
			params: {
				otherParam: '456',
				allDay: '1',
				dtstart: '1546300800',
				dtend: '1546387200',
			},
		})
	})

	it('should open the Sidebar on big screens if the user wishes so', () => {
		const store = { state: { settings: { skipPopover: true } } }
		const router = { push: jest.fn() }
		const route = { name: 'CalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 1920 }

		const start = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2019, 0, 2, 0, 0, 0, 0))
		const allDay = true

		const selectFunction = select(store, router, route, window)
		selectFunction({ start, end, allDay })

		expect(router.push).toHaveBeenCalledTimes(1)
		expect(router.push).toHaveBeenNthCalledWith(1, {
			name: 'NewSidebarView',
			params: {
				otherParam: '456',
				allDay: '1',
				dtstart: '1546300800',
				dtend: '1546387200',
			},
		})
	})

	it('should open the Sidebar on smaller screens', () => {
		const store = { state: { settings: { skipPopover: false } } }
		const router = { push: jest.fn() }
		const route = { name: 'CalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 760 }

		const start = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2019, 0, 2, 0, 0, 0, 0))
		const allDay = true

		const selectFunction = select(store, router, route, window)
		selectFunction({ start, end, allDay })

		expect(router.push).toHaveBeenCalledTimes(1)
		expect(router.push).toHaveBeenNthCalledWith(1, {
			name: 'NewSidebarView',
			params: {
				otherParam: '456',
				allDay: '1',
				dtstart: '1546300800',
				dtend: '1546387200',
			},
		})
	})

	it('should not update the route if the exact time-range is already open - Popover to Popover', () => {
		const store = { state: { settings: { skipPopover: false } } }
		const router = { push: jest.fn() }
		const route = {
			name: 'NewPopoverView',
			params: {
				otherParam: '456',
				allDay: '1',
				dtstart: '1546300800',
				dtend: '1546387200',
			},
		}
		const window = { innerWidth: 1920 }

		const start = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2019, 0, 2, 0, 0, 0, 0))
		const allDay = true

		const selectFunction = select(store, router, route, window)
		selectFunction({ start, end, allDay })

		expect(router.push).toHaveBeenCalledTimes(0)
	})

	it('should not update the route if the exact time-range is already open - Sidebar to Popover', () => {
		const store = { state: { settings: { skipPopover: false } } }
		const router = { push: jest.fn() }
		const route = {
			name: 'NewSidebarView',
			params: {
				otherParam: '456',
				allDay: '1',
				dtstart: '1546300800',
				dtend: '1546387200',
			},
		}
		const window = { innerWidth: 1920 }

		const start = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2019, 0, 2, 0, 0, 0, 0))
		const allDay = true

		const selectFunction = select(store, router, route, window)
		selectFunction({ start, end, allDay })

		expect(router.push).toHaveBeenCalledTimes(0)
	})

	it('should not update the route if the exact time-range is already open - Sidebar to Sidebar', () => {
		const store = { state: { settings: { skipPopover: true } } }
		const router = { push: jest.fn() }
		const route = {
			name: 'NewSidebarView',
			params: {
				otherParam: '456',
				allDay: '1',
				dtstart: '1546300800',
				dtend: '1546387200',
			},
		}
		const window = { innerWidth: 1920 }

		const start = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2019, 0, 2, 0, 0, 0, 0))
		const allDay = true

		const selectFunction = select(store, router, route, window)
		selectFunction({ start, end, allDay })

		expect(router.push).toHaveBeenCalledTimes(0)
	})

	it('should not update the route if the exact time-range is already open - Popover to Sidebar', () => {
		const store = { state: { settings: { skipPopover: true } } }
		const router = { push: jest.fn() }
		const route = {
			name: 'NewPopoverView',
			params: {
				otherParam: '456',
				allDay: '1',
				dtstart: '1546300800',
				dtend: '1546387200',
			},
		}
		const window = { innerWidth: 1920 }

		const start = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2019, 0, 2, 0, 0, 0, 0))
		const allDay = true

		const selectFunction = select(store, router, route, window)
		selectFunction({ start, end, allDay })

		expect(router.push).toHaveBeenCalledTimes(0)
	})

	it('should not the popover when a new event sidebar is already open - Popover', () => {
		const store = { state: { settings: { skipPopover: false } } }
		const router = { push: jest.fn() }
		const route = {
			name: 'NewPopoverView',
			params: {
				otherParam: '456',
				allDay: '1',
				dtstart: '1546300800',
				dtend: '1546387200',
			},
		}
		const window = { innerWidth: 1920 }

		const start = new Date(Date.UTC(2019, 3, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2019, 3, 2, 0, 0, 0, 0))
		const allDay = false

		const selectFunction = select(store, router, route, window)
		selectFunction({ start, end, allDay })

		expect(router.push).toHaveBeenCalledTimes(1)
		expect(router.push).toHaveBeenNthCalledWith(1, {
			name: 'NewPopoverView',
			params: {
				otherParam: '456',
				allDay: '0',
				dtstart: '1554076800',
				dtend: '1554163200',
			},
		})
	})

	it('should not the popover when a new event sidebar is already open - Sidebar', () => {
		const store = { state: { settings: { skipPopover: false } } }
		const router = { push: jest.fn() }
		const route = {
			name: 'NewSidebarView',
			params: {
				otherParam: '456',
				allDay: '1',
				dtstart: '1546300800',
				dtend: '1546387200',
			},
		}
		const window = { innerWidth: 1920 }

		const start = new Date(Date.UTC(2019, 3, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2019, 3, 2, 0, 0, 0, 0))
		const allDay = false

		const selectFunction = select(store, router, route, window)
		selectFunction({ start, end, allDay })

		expect(router.push).toHaveBeenCalledTimes(1)
		expect(router.push).toHaveBeenNthCalledWith(1, {
			name: 'NewSidebarView',
			params: {
				otherParam: '456',
				allDay: '0',
				dtstart: '1554076800',
				dtend: '1554163200',
			},
		})
	})
})
