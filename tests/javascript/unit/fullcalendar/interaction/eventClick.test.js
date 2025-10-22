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

vi.mock("../../../../../src/utils/router.js");
vi.mock("@nextcloud/router");
vi.mock("@nextcloud/l10n");
vi.mock("@nextcloud/dialogs");

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

		const router = { push: vi.fn() }
		const route = { name: 'CalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 1920 }

		getPrefixedRoute
			.mockReturnValueOnce('EditPopoverView')
			.mockReturnValueOnce('EditPopoverView')
			.mockReturnValueOnce('EditFullView')

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
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(3, 'CalendarView', 'EditFullView')

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

	it('should open the Full on big screens if the user wishes so', () => {
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = true

		const router = { push: vi.fn() }
		const route = { name: 'CalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 1920 }

		getPrefixedRoute
			.mockReturnValueOnce('EditFullView')
			.mockReturnValueOnce('EditPopoverView')
			.mockReturnValueOnce('EditFullView')

		const eventClickFunction = eventClick(router, route, window)
		eventClickFunction({ event: {
			extendedProps: {
				objectId: 'object123',
				recurrenceId: 'recurrence456',
				objectType: 'VEVENT',
			}
		}})

		expect(getPrefixedRoute).toHaveBeenNthCalledWith(1, 'CalendarView', 'EditFullView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(2, 'CalendarView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(3, 'CalendarView', 'EditFullView')

		expect(router.push.mock.calls.length).toEqual(1)
		expect(router.push.mock.calls[0][0]).toEqual({
			name: 'EditFullView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		})
	})

	it('should open the Full on smaller screens', () => {
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = false

		const router = { push: vi.fn() }
		const route = { name: 'CalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 500 }

		getPrefixedRoute
			.mockReturnValueOnce('EditFullView')
			.mockReturnValueOnce('EditPopoverView')
			.mockReturnValueOnce('EditFullView')

		const eventClickFunction = eventClick(router, route, window)
		eventClickFunction({ event: {
			extendedProps: {
				objectId: 'object123',
				recurrenceId: 'recurrence456',
				objectType: 'VEVENT',
			}
		}})

		expect(getPrefixedRoute).toHaveBeenNthCalledWith(1, 'CalendarView', 'EditFullView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(2, 'CalendarView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(3, 'CalendarView', 'EditFullView')

		expect(router.push.mock.calls.length).toEqual(1)
		expect(router.push.mock.calls[0][0]).toEqual({
			name: 'EditFullView',
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

		const router = { push: vi.fn() }
		const route = { name: 'PublicCalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 1920 }

		getPrefixedRoute
			.mockReturnValueOnce('PublicEditFullView')
			.mockReturnValueOnce('PublicEditPopoverView')
			.mockReturnValueOnce('PublicEditFullView')

		const eventClickFunction = eventClick(router, route, window)
		eventClickFunction({ event: {
				extendedProps: {
					objectId: 'object123',
					recurrenceId: 'recurrence456',
					objectType: 'VEVENT',
				}
			}})

		expect(getPrefixedRoute).toHaveBeenNthCalledWith(1, 'PublicCalendarView', 'EditFullView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(2, 'PublicCalendarView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(3, 'PublicCalendarView', 'EditFullView')

		expect(router.push.mock.calls.length).toEqual(1)
		expect(router.push.mock.calls[0][0]).toEqual({
			name: 'PublicEditFullView',
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

		const router = { push: vi.fn() }
		const route = { name: 'EmbedCalendarView', params: { otherParam: '456' } }
		const window = { innerWidth: 1920 }

		getPrefixedRoute
			.mockReturnValueOnce('EmbedEditFullView')
			.mockReturnValueOnce('EmbedEditPopoverView')
			.mockReturnValueOnce('EmbedEditFullView')

		const eventClickFunction = eventClick(router, route, window)
		eventClickFunction({ event: {
				extendedProps: {
					objectId: 'object123',
					recurrenceId: 'recurrence456',
					objectType: 'VEVENT',
				}
			}})

		expect(getPrefixedRoute).toHaveBeenNthCalledWith(1, 'EmbedCalendarView', 'EditFullView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(2, 'EmbedCalendarView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(3, 'EmbedCalendarView', 'EditFullView')

		expect(router.push.mock.calls.length).toEqual(1)
		expect(router.push.mock.calls[0][0]).toEqual({
			name: 'EmbedEditFullView',
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

		const router = { push: vi.fn() }
		const route = {
			name: 'EditFullView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}
		const window = { innerWidth: 1920 }

		getPrefixedRoute
			.mockReturnValueOnce('EditFullView')
			.mockReturnValueOnce('EditPopoverView')
			.mockReturnValueOnce('EditFullView')

		const eventClickFunction = eventClick(router, route, window)
		eventClickFunction({ event: {
				extendedProps: {
					objectId: 'object123',
					recurrenceId: 'recurrence456',
					objectType: 'VEVENT',
				}
			}})

		expect(getPrefixedRoute).toHaveBeenNthCalledWith(1, 'EditFullView', 'EditFullView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(2, 'EditFullView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(3, 'EditFullView', 'EditFullView')

		expect(router.push.mock.calls.length).toEqual(0)
	})

	it('should not update the route when the same event and same occurrence is already viewed - Full Route', () => {
		const settingsStore = useSettingsStore()
		settingsStore.skipPopover = false

		const router = { push: vi.fn() }
		const route = {
			name: 'EditFullView',
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
			.mockReturnValueOnce('EditFullView')

		const eventClickFunction = eventClick(router, route, window)
		eventClickFunction({ event: {
				extendedProps: {
					objectId: 'object123',
					recurrenceId: 'recurrence456',
					objectType: 'VEVENT',
				}
			}})

		expect(getPrefixedRoute).toHaveBeenNthCalledWith(1, 'EditFullView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(2, 'EditFullView', 'EditPopoverView')
		expect(getPrefixedRoute).toHaveBeenNthCalledWith(3, 'EditFullView', 'EditFullView')

		expect(router.push.mock.calls.length).toEqual(0)
	})

	it('should forward to the task app if enabled', () => {
		const settingsStore = useSettingsStore()
		settingsStore.tasksEnabled = true

		const router = { push: vi.fn() }
		const route = {
			name: 'EditFullView',
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

		expect(window.location.href).toEqual('/generated-url')
	})

	it('should do nothing when tasks is disabled and route is public', () => {
		const settingsStore = useSettingsStore()
		settingsStore.tasksEnabled = false

		const router = { push: vi.fn() }
		const route = {
			name: 'EditFullView',
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
		expect(isPublicOrEmbeddedRoute).toHaveBeenNthCalledWith(1, 'EditFullView')

		expect(generateUrl).toHaveBeenCalledTimes(0)
		expect(window.location).toEqual(oldLocation)
	})

	it('should show a hint to enable tasks app, when disabled but not public', () => {
		const settingsStore = useSettingsStore()
		settingsStore.tasksEnabled = false

		const router = { push: vi.fn() }
		const route = {
			name: 'EditFullView',
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
		expect(isPublicOrEmbeddedRoute).toHaveBeenNthCalledWith(1, 'EditFullView')

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

		const next = vi.fn()
		EditorMixin.requiresActionOnRouteLeave = false
		EditorMixin.beforeRouteLeave(toRoute, fromRoute, next)
	})

	it('should not save the event when new side bar view is open and then clicked in a saved event', () => {
		const fromRoute = {
			name: 'NewFullView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}
		const toRoute = {
			name: 'EditFullView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}

		const next = vi.fn()
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

		const next = vi.fn()
		EditorMixin.requiresActionOnRouteLeave = true
		EditorMixin.beforeRouteLeave(toRoute, fromRoute, next)
	})

	it('should not save the event when new popover view is open and then clicked in a saved event in Full view', () => {
		const fromRoute = {
			name: 'NewPopoverView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}
		const toRoute = {
			name: 'EditFullView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}

		const next = vi.fn()
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

		const next = vi.fn()
		EditorMixin.requiresActionOnRouteLeave = true
		EditorMixin.beforeRouteLeave(toRoute, fromRoute, next)
	})

	it('show save event', () => {
		const fromRoute = {
			name: 'EditFullView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}
		const toRoute = {
			name: 'NewFullView',
			params: {
				object: 'object123',
				otherParam: '456',
				recurrenceId: 'recurrence456',
			}
		}

		const next = vi.fn()
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

		const next = vi.fn()
		EditorMixin.requiresActionOnRouteLeave = true
		EditorMixin.beforeRouteLeave(toRoute, fromRoute, next)
	})
})
