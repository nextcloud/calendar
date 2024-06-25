/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import select from "../../../../../src/fullcalendar/interaction/select.js";
import useSettingsStore from '../../../../../src/store/settings.js'
import { createPinia, setActivePinia } from 'pinia'

describe('fullcalendar/select test suite', () => {

	beforeEach(() => {
		setActivePinia(createPinia())
	})

	it('should open the Popover on big screens', () => {
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = false

		const router = { push: jest.fn() }
		const route = { name: 'CalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 1920 }

		const start = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2019, 0, 2, 0, 0, 0, 0))
		const allDay = true

		const selectFunction = select(router, route, window)
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
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = true

		const router = { push: jest.fn() }
		const route = { name: 'CalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 1920 }

		const start = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2019, 0, 2, 0, 0, 0, 0))
		const allDay = true

		const selectFunction = select(router, route, window)
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
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = false

		const router = { push: jest.fn() }
		const route = { name: 'CalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 500 }

		const start = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2019, 0, 2, 0, 0, 0, 0))
		const allDay = true

		const selectFunction = select(router, route, window)
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
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = false

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

		const selectFunction = select(router, route, window)
		selectFunction({ start, end, allDay })

		expect(router.push).toHaveBeenCalledTimes(0)
	})

	it('should not update the route if the exact time-range is already open - Sidebar to Popover', () => {
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = false

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

		const selectFunction = select(router, route, window)
		selectFunction({ start, end, allDay })

		expect(router.push).toHaveBeenCalledTimes(0)
	})

	it('should not update the route if the exact time-range is already open - Sidebar to Sidebar', () => {
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = true

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

		const selectFunction = select(router, route, window)
		selectFunction({ start, end, allDay })

		expect(router.push).toHaveBeenCalledTimes(0)
	})

	it('should not update the route if the exact time-range is already open - Popover to Sidebar', () => {
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = true

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

		const selectFunction = select(router, route, window)
		selectFunction({ start, end, allDay })

		expect(router.push).toHaveBeenCalledTimes(0)
	})

	it('should not the popover when a new event sidebar is already open - Popover', () => {
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = false

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

		const selectFunction = select(router, route, window)
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
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = false

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

		const selectFunction = select(router, route, window)
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
