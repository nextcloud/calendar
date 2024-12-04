/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import eventClick from "../../../../../src/fullcalendar/interaction/eventClick.js";
import EditorMixin from "../../../../../src/mixins/EditorMixin.js";
import {
	getPrefixedRoute,
	isPublicOrEmbeddedRoute,
} from '../../../../../src/utils/router.js'
import useSettingsStore from '../../../../../src/store/settings.js'
import { generateUrl } from '@nextcloud/router'
import { translate } from '@nextcloud/l10n'
import { showInfo } from '@nextcloud/dialogs'
import { createPinia, setActivePinia } from "pinia";

jest.mock("../../../../../src/utils/router.js");
jest.mock("@nextcloud/router");
jest.mock("@nextcloud/l10n");
jest.mock("@nextcloud/dialogs");

describe('fullcalendar/eventClick test suite', () => {

	beforeEach(() => {
		getPrefixedRoute.mockClear()
		isPublicOrEmbeddedRoute.mockClear()
		generateUrl.mockClear()
		translate.mockClear()
		showInfo.mockClear()

		setActivePinia(createPinia())
	})

	it('should open the Popover on big screens', () => {
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = false

		const router = { push: jest.fn() }
		const route = { name: 'CalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 1920 }

		getPrefixedRoute
			.mockReturnValueOnce('EditPopoverView')
			.mockReturnValueOnce('EditPopoverView')
			.mockReturnValueOnce('EditSidebarView')

		const eventClickFunction = eventClick(router, route, window)
		eventClickFunction({ event: {
			extendedProps: {
				objectId: 'object123',
				recurrenceId: 'recurrence456',
				objectType: 'VEVENT',
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
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = true

		const router = { push: jest.fn() }
		const route = { name: 'CalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 1920 }

		getPrefixedRoute
			.mockReturnValueOnce('EditSidebarView')
			.mockReturnValueOnce('EditPopoverView')
			.mockReturnValueOnce('EditSidebarView')

		const eventClickFunction = eventClick(router, route, window)
		eventClickFunction({ event: {
			extendedProps: {
				objectId: 'object123',
				recurrenceId: 'recurrence456',
				objectType: 'VEVENT',
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
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = false

		const router = { push: jest.fn() }
		const route = { name: 'CalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 500 }

		getPrefixedRoute
			.mockReturnValueOnce('EditSidebarView')
			.mockReturnValueOnce('EditPopoverView')
			.mockReturnValueOnce('EditSidebarView')

		const eventClickFunction = eventClick(router, route, window)
		eventClickFunction({ event: {
			extendedProps: {
				objectId: 'object123',
				recurrenceId: 'recurrence456',
				objectType: 'VEVENT',
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
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = true

		const router = { push: jest.fn() }
		const route = { name: 'PublicCalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 1920 }

		getPrefixedRoute
			.mockReturnValueOnce('PublicEditSidebarView')
			.mockReturnValueOnce('PublicEditPopoverView')
			.mockReturnValueOnce('PublicEditSidebarView')

		const eventClickFunction = eventClick(router, route, window)
		eventClickFunction({ event: {
				extendedProps: {
					objectId: 'object123',
					recurrenceId: 'recurrence456',
					objectType: 'VEVENT',
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
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = true

		const router = { push: jest.fn() }
		const route = { name: 'EmbedCalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 1920 }

		getPrefixedRoute
			.mockReturnValueOnce('EmbedEditSidebarView')
			.mockReturnValueOnce('EmbedEditPopoverView')
			.mockReturnValueOnce('EmbedEditSidebarView')

		const eventClickFunction = eventClick(router, route, window)
		eventClickFunction({ event: {
				extendedProps: {
					objectId: 'object123',
					recurrenceId: 'recurrence456',
					objectType: 'VEVENT',
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
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = true

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

		const eventClickFunction = eventClick(router, route, window)
		eventClickFunction({ event: {
				extendedProps: {
					objectId: 'object123',
					recurrenceId: 'recurrence456',
					objectType: 'VEVENT',
				}
			}})

		expect(getPrefixedRoute).toHaveBeenNthCalledWith(1, 'EditSidebarView', 'EditSidebarView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(2, 'EditSidebarView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(3, 'EditSidebarView', 'EditSidebarView')

		expect(router.push.mock.calls.length).toEqual(0)
	})

	it('should not update the route when the same event and same occurrence is already viewed - Sidebar Route', () => {
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = false

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

		const eventClickFunction = eventClick(router, route, window)
		eventClickFunction({ event: {
				extendedProps: {
					objectId: 'object123',
					recurrenceId: 'recurrence456',
					objectType: 'VEVENT',
				}
			}})

		expect(getPrefixedRoute).toHaveBeenNthCalledWith(1, 'EditSidebarView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(2, 'EditSidebarView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(3, 'EditSidebarView', 'EditSidebarView')

		expect(router.push.mock.calls.length).toEqual(0)
	})

	it('should forward to the task app if enabled', () => {
		const settingsStore = useSettingsStore()
		settingsStore.tasksEnabled = true

		const router = { push: jest.fn() }
		const route = {
			name: 'EditSidebarView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}
		const window = {
			innerWidth: 1920,
			location: {
				protocol: 'http:',
				host: 'nextcloud.testing',
			}
		}

		generateUrl
			.mockReturnValueOnce('/generated-url')

		const eventClickFunction = eventClick(router, route, window)
		eventClickFunction({ event: {
				extendedProps: {
					davUrl: '/remote.php/dav/calendars/admin/reminders/EAFB112A-4556-404A-B807-B1E040D0F7A0.ics',
					object: 'object123',
					recurrenceId: 'recurrence456',
					objectType: 'VTODO',
				}
			}})

		expect(generateUrl).toHaveBeenCalledTimes(1)
		expect(generateUrl).toHaveBeenNthCalledWith(1, 'apps/tasks/calendars/reminders/tasks/EAFB112A-4556-404A-B807-B1E040D0F7A0.ics')

		expect(window.location).toEqual('http://nextcloud.testing/generated-url')
	})

	it('should do nothing when tasks is disabled and route is public', () => {
		const settingsStore = useSettingsStore()
		settingsStore.tasksEnabled = false

		const router = { push: jest.fn() }
		const route = {
			name: 'EditSidebarView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}
		const window = {
			innerWidth: 1920,
			location: {
				protocol: 'http:',
				host: 'nextcloud.testing',
			}
		}
		const oldLocation = window.location

		isPublicOrEmbeddedRoute
			.mockReturnValueOnce(true)

		const eventClickFunction = eventClick(router, route, window)
		eventClickFunction({ event: {
				extendedProps: {
					davUrl: '/remote.php/dav/calendars/admin/reminders/EAFB112A-4556-404A-B807-B1E040D0F7A0.ics',
					object: 'object123',
					recurrenceId: 'recurrence456',
					objectType: 'VTODO',
				}
			}})

		expect(isPublicOrEmbeddedRoute).toHaveBeenCalledTimes(1)
		expect(isPublicOrEmbeddedRoute).toHaveBeenNthCalledWith(1, 'EditSidebarView')

		expect(generateUrl).toHaveBeenCalledTimes(0)
		expect(window.location).toEqual(oldLocation)
	})

	it('should show a hint to enable tasks app, when disabled but not public', () => {
		const settingsStore = useSettingsStore()
		settingsStore.tasksEnabled = false

		const router = { push: jest.fn() }
		const route = {
			name: 'EditSidebarView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}
		const window = {
			innerWidth: 1920,
			location: {
				protocol: 'http:',
				host: 'nextcloud.testing',
			}
		}
		const oldLocation = window.location

		isPublicOrEmbeddedRoute
			.mockReturnValueOnce(false)
		translate
			.mockReturnValue('translated hint')

		const eventClickFunction = eventClick(router, route, window)
		eventClickFunction({ event: {
				extendedProps: {
					davUrl: '/remote.php/dav/calendars/admin/reminders/EAFB112A-4556-404A-B807-B1E040D0F7A0.ics',
					object: 'object123',
					recurrenceId: 'recurrence456',
					objectType: 'VTODO',
				}
			}})

		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Please ask your administrator to enable the Tasks App.')

		expect(showInfo).toHaveBeenCalledTimes(1)
		expect(showInfo).toHaveBeenNthCalledWith(1, 'translated hint')

		expect(isPublicOrEmbeddedRoute).toHaveBeenCalledTimes(1)
		expect(isPublicOrEmbeddedRoute).toHaveBeenNthCalledWith(1, 'EditSidebarView')

		expect(generateUrl).toHaveBeenCalledTimes(0)
		expect(window.location).toEqual(oldLocation)
	})

	it('should do nothing when there is no require action on route leave', () => {
		const fromRoute = {
			name: 'Test1',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}
		const toRoute = {
			name: 'Test2',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}

		const next = jest.fn()
		EditorMixin.requiresActionOnRouteLeave = false
		EditorMixin.beforeRouteLeave(toRoute, fromRoute, next)
	})

	it('should not save the event when new side bar view is open and then clicked in a saved event', () => {
		const fromRoute = {
			name: 'NewSideBarView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}
		const toRoute = {
			name: 'EditSideBarView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}

		const next = jest.fn()
		EditorMixin.requiresActionOnRouteLeave = true
		EditorMixin.beforeRouteLeave(toRoute, fromRoute, next)
	})

	it('should not save the event when new popover view is open and then clicked in a saved event in popover view', () => {
		const fromRoute = {
			name: 'NewPopoverView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}
		const toRoute = {
			name: 'EditPopoverView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}

		const next = jest.fn()
		EditorMixin.requiresActionOnRouteLeave = true
		EditorMixin.beforeRouteLeave(toRoute, fromRoute, next)
	})

	it('should not save the event when new popover view is open and then clicked in a saved event in sidebar view', () => {
		const fromRoute = {
			name: 'NewPopoverView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}
		const toRoute = {
			name: 'EditSideBarView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}

		const next = jest.fn()
		EditorMixin.requiresActionOnRouteLeave = true
		EditorMixin.beforeRouteLeave(toRoute, fromRoute, next)
	})

	it('show save event', () => {
		const fromRoute = {
			name: 'EditPopoverView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}
		const toRoute = {
			name: 'NewPopoverView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}

		const next = jest.fn()
		EditorMixin.requiresActionOnRouteLeave = true
		EditorMixin.beforeRouteLeave(toRoute, fromRoute, next)
	})

	it('show save event', () => {
		const fromRoute = {
			name: 'EditSideBarView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}
		const toRoute = {
			name: 'NewSideBarView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}

		const next = jest.fn()
		EditorMixin.requiresActionOnRouteLeave = true
		EditorMixin.beforeRouteLeave(toRoute, fromRoute, next)
	})

	it('should not save event with invalid to and from routes on beforeRouteLeave', () => {
		const fromRoute = {
			name: 'Test1',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}
		const toRoute = {
			name: 'Test2',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}

		const next = jest.fn()
		EditorMixin.requiresActionOnRouteLeave = true
		EditorMixin.beforeRouteLeave(toRoute, fromRoute, next)
	})
})
