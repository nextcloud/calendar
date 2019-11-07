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
import eventClick from "../../../../src/fullcalendar/eventClick.js";
import { getPrefixedRoute } from "../../../../src/utils/router.js";
jest.mock("../../../../src/utils/router.js");

describe('fullcalendar/eventClick test suite', () => {

	beforeEach(() => {
		getPrefixedRoute.mockClear()
	})

	it('should open the Popover on big screens', () => {
		const store = { state: { settings: { skipPopover: false } } }
		const router = { push: jest.fn() }
		const route = { name: 'CalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 1920 }

		getPrefixedRoute
			.mockReturnValueOnce('EditPopoverView')
			.mockReturnValueOnce('EditPopoverView')
			.mockReturnValueOnce('EditSidebarView')

		const eventClickFunction = eventClick(store, router, route, window)
		eventClickFunction({ event: {
			extendedProps: {
				objectId: 'object123',
				recurrenceId: 'recurrence456',
			}
		}})

		expect(getPrefixedRoute).toHaveBeenNthCalledWith(1, 'CalendarView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(2, 'CalendarView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(3, 'CalendarView', 'EditSidebarView')

		expect(router.push.mock.calls.length).toEqual(1)
		expect(router.push.mock.calls[0][0]).toEqual({
			name: 'EditPopoverView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		})
	})

	it('should open the Sidebar on big screens if the user wishes so', () => {
		const store = { state: { settings: { skipPopover: true } } }
		const router = { push: jest.fn() }
		const route = { name: 'CalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 1920 }

		getPrefixedRoute
			.mockReturnValueOnce('EditSidebarView')
			.mockReturnValueOnce('EditPopoverView')
			.mockReturnValueOnce('EditSidebarView')

		const eventClickFunction = eventClick(store, router, route, window)
		eventClickFunction({ event: {
			extendedProps: {
				objectId: 'object123',
				recurrenceId: 'recurrence456',
			}
		}})

		expect(getPrefixedRoute).toHaveBeenNthCalledWith(1, 'CalendarView', 'EditSidebarView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(2, 'CalendarView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(3, 'CalendarView', 'EditSidebarView')

		expect(router.push.mock.calls.length).toEqual(1)
		expect(router.push.mock.calls[0][0]).toEqual({
			name: 'EditSidebarView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		})
	})

	it('should open the Sidebar on smaller screens', () => {
		const store = { state: { settings: { skipPopover: false } } }
		const router = { push: jest.fn() }
		const route = { name: 'CalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 760 }

		getPrefixedRoute
			.mockReturnValueOnce('EditSidebarView')
			.mockReturnValueOnce('EditPopoverView')
			.mockReturnValueOnce('EditSidebarView')

		const eventClickFunction = eventClick(store, router, route, window)
		eventClickFunction({ event: {
			extendedProps: {
				objectId: 'object123',
				recurrenceId: 'recurrence456',
			}
		}})

		expect(getPrefixedRoute).toHaveBeenNthCalledWith(1, 'CalendarView', 'EditSidebarView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(2, 'CalendarView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(3, 'CalendarView', 'EditSidebarView')

		expect(router.push.mock.calls.length).toEqual(1)
		expect(router.push.mock.calls[0][0]).toEqual({
			name: 'EditSidebarView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		})
	})

	it('should keep the public prefix when viewed in public mode', () => {
		const store = { state: { settings: { skipPopover: true } } }
		const router = { push: jest.fn() }
		const route = { name: 'PublicCalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 1920 }

		getPrefixedRoute
			.mockReturnValueOnce('PublicEditSidebarView')
			.mockReturnValueOnce('PublicEditPopoverView')
			.mockReturnValueOnce('PublicEditSidebarView')

		const eventClickFunction = eventClick(store, router, route, window)
		eventClickFunction({ event: {
				extendedProps: {
					objectId: 'object123',
					recurrenceId: 'recurrence456',
				}
			}})

		expect(getPrefixedRoute).toHaveBeenNthCalledWith(1, 'PublicCalendarView', 'EditSidebarView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(2, 'PublicCalendarView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(3, 'PublicCalendarView', 'EditSidebarView')

		expect(router.push.mock.calls.length).toEqual(1)
		expect(router.push.mock.calls[0][0]).toEqual({
			name: 'PublicEditSidebarView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		})
	})

	it('should keep the embed prefix when viewed in embedded mode', () => {
		const store = { state: { settings: { skipPopover: true } } }
		const router = { push: jest.fn() }
		const route = { name: 'EmbedCalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 1920 }

		getPrefixedRoute
			.mockReturnValueOnce('EmbedEditSidebarView')
			.mockReturnValueOnce('EmbedEditPopoverView')
			.mockReturnValueOnce('EmbedEditSidebarView')

		const eventClickFunction = eventClick(store, router, route, window)
		eventClickFunction({ event: {
				extendedProps: {
					objectId: 'object123',
					recurrenceId: 'recurrence456',
				}
			}})

		expect(getPrefixedRoute).toHaveBeenNthCalledWith(1, 'EmbedCalendarView', 'EditSidebarView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(2, 'EmbedCalendarView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(3, 'EmbedCalendarView', 'EditSidebarView')

		expect(router.push.mock.calls.length).toEqual(1)
		expect(router.push.mock.calls[0][0]).toEqual({
			name: 'EmbedEditSidebarView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		})
	})

	it('should not update the route when the same event and same occurrence is already viewed - same route', () => {
		const store = { state: { settings: { skipPopover: true } } }
		const router = { push: jest.fn() }
		const route = {
			name: 'EditSidebarView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}
		const window = { innerWidth: 1920 }

		getPrefixedRoute
			.mockReturnValueOnce('EditSidebarView')
			.mockReturnValueOnce('EditPopoverView')
			.mockReturnValueOnce('EditSidebarView')

		const eventClickFunction = eventClick(store, router, route, window)
		eventClickFunction({ event: {
				extendedProps: {
					objectId: 'object123',
					recurrenceId: 'recurrence456',
				}
			}})

		expect(getPrefixedRoute).toHaveBeenNthCalledWith(1, 'EditSidebarView', 'EditSidebarView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(2, 'EditSidebarView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(3, 'EditSidebarView', 'EditSidebarView')

		expect(router.push.mock.calls.length).toEqual(0)
	})

	it('should not update the route when the same event and same occurrence is already viewed - Sidebar Route', () => {
		const store = { state: { settings: { skipPopover: false } } }
		const router = { push: jest.fn() }
		const route = {
			name: 'EditSidebarView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}
		const window = { innerWidth: 1920 }

		getPrefixedRoute
			.mockReturnValueOnce('EditPopoverView')
			.mockReturnValueOnce('EditPopoverView')
			.mockReturnValueOnce('EditSidebarView')

		const eventClickFunction = eventClick(store, router, route, window)
		eventClickFunction({ event: {
				extendedProps: {
					objectId: 'object123',
					recurrenceId: 'recurrence456',
				}
			}})

		expect(getPrefixedRoute).toHaveBeenNthCalledWith(1, 'EditSidebarView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(2, 'EditSidebarView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(3, 'EditSidebarView', 'EditSidebarView')

		expect(router.push.mock.calls.length).toEqual(0)
	})

})
