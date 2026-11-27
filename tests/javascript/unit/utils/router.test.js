/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { loadState } from '@nextcloud/initial-state'
import {
	getCalendarView,
	getInitialView,
	getPreferredEditorRoute,
	getPrefixedRoute,
	getViewMode,
	getViewSelectionLocation,
	ROLLING_YEAR_LIST_VIEW,
	ViewMode,
} from '@/utils/router.js'

vi.mock('@nextcloud/initial-state')

describe('utils/router test suite', () => {
	beforeEach(() => {
		loadState.mockClear()
	})

	it('should use the rolling year only when the list URL requests it', () => {
		expect(getCalendarView('listMonth', 'year')).toBe(ROLLING_YEAR_LIST_VIEW)
		expect(getCalendarView('listMonth')).toBe('listMonth')
		expect(getCalendarView('listMonth', 'quarter')).toBe('listMonth')
		expect(getCalendarView('dayGridMonth', 'year')).toBe('dayGridMonth')
	})

	it('should open the yearly list from the view selector even on a monthly list URL', () => {
		const route = {
			name: 'EmbedCalendarView',
			params: { tokens: 'shared', view: 'listMonth', firstDay: 'now' },
			query: {},
		}

		expect(getViewSelectionLocation(route, 'listMonth')).toEqual({
			name: route.name,
			params: route.params,
			query: { show: 'year' },
		})
		expect(getViewSelectionLocation({ ...route, query: { show: 'year' } }, 'listMonth')).toBeNull()
	})

	it('should remove the yearly list option when selecting a different view', () => {
		const route = {
			name: 'CalendarView',
			params: { view: 'listMonth', firstDay: 'now' },
			query: { show: 'year' },
		}

		expect(getViewSelectionLocation(route, 'dayGridMonth')).toEqual({
			name: route.name,
			params: { view: 'dayGridMonth', firstDay: 'now' },
			query: { show: undefined },
		})
	})

	it('should get the initial view', () => {
		loadState
			.mockReturnValueOnce('dayGridView')
			.mockImplementationOnce(() => { throw new Error() })

		expect(getInitialView()).toEqual('dayGridView')
		expect(getInitialView()).toEqual('dayGridMonth')

		expect(loadState).toHaveBeenCalledTimes(2)
		expect(loadState).toHaveBeenNthCalledWith(1, 'calendar', 'initial_view')
		expect(loadState).toHaveBeenNthCalledWith(2, 'calendar', 'initial_view')
	})

	it('should get the preferred editor view (big screens)', () => {
		window.innerWidth = 1920

		loadState
			.mockReturnValueOnce(true)
			.mockReturnValueOnce(false)
			.mockImplementationOnce(() => { throw new Error() })

		expect(getPreferredEditorRoute()).toEqual('full')
		expect(getPreferredEditorRoute()).toEqual('popover')
		expect(getPreferredEditorRoute()).toEqual('popover')

		expect(loadState).toHaveBeenCalledTimes(3)
		expect(loadState).toHaveBeenNthCalledWith(1, 'calendar', 'skip_popover')
		expect(loadState).toHaveBeenNthCalledWith(2, 'calendar', 'skip_popover')
		expect(loadState).toHaveBeenNthCalledWith(3, 'calendar', 'skip_popover')
	})

	it('should get the preferred editor view (small screens)', () => {
		window.innerWidth = 500

		loadState
			.mockReturnValueOnce(true)
			.mockReturnValueOnce(false)
			.mockImplementationOnce(() => { throw new Error() })

		expect(getPreferredEditorRoute()).toEqual('full')
		expect(getPreferredEditorRoute()).toEqual('full')
		expect(getPreferredEditorRoute()).toEqual('full')

		expect(loadState).toHaveBeenCalledTimes(3)
		expect(loadState).toHaveBeenNthCalledWith(1, 'calendar', 'skip_popover')
		expect(loadState).toHaveBeenNthCalledWith(2, 'calendar', 'skip_popover')
		expect(loadState).toHaveBeenNthCalledWith(3, 'calendar', 'skip_popover')
	})

	it('should provide the prefixed route name to navigate to', () => {
		expect(getPrefixedRoute('PublicCalendarView', 'EditPopoverView')).toEqual('PublicEditPopoverView')
		expect(getPrefixedRoute('PublicEditPopoverView', 'CalendarView')).toEqual('PublicCalendarView')

		expect(getPrefixedRoute('EmbedCalendarView', 'EditPopoverView')).toEqual('EmbedEditPopoverView')
		expect(getPrefixedRoute('EmbedEditPopoverView', 'CalendarView')).toEqual('EmbedCalendarView')

		expect(getPrefixedRoute('CalendarView', 'EditPopoverView')).toEqual('EditPopoverView')
		expect(getPrefixedRoute('EditPopoverView', 'CalendarView')).toEqual('CalendarView')
	})

	it('should always report widget mode when isWidget is true, regardless of route', () => {
		expect(getViewMode('PublicCalendarView', true)).toEqual(ViewMode.WIDGET)
		expect(getViewMode('EmbedCalendarView', true)).toEqual(ViewMode.WIDGET)
		expect(getViewMode('CalendarView', true)).toEqual(ViewMode.WIDGET)
		expect(getViewMode(undefined, true)).toEqual(ViewMode.WIDGET)
	})

	it('should derive the view mode from the route name when not a widget', () => {
		expect(getViewMode('PublicCalendarView')).toEqual(ViewMode.PUBLIC)
		expect(getViewMode('PublicEditPopoverView')).toEqual(ViewMode.PUBLIC)

		expect(getViewMode('EmbedCalendarView')).toEqual(ViewMode.EMBEDDED)
		expect(getViewMode('EmbedEditFullView')).toEqual(ViewMode.EMBEDDED)

		expect(getViewMode('CalendarView')).toEqual(ViewMode.USER)
		expect(getViewMode('EditPopoverView')).toEqual(ViewMode.USER)
	})

	it('should default to user mode when there is no route name', () => {
		expect(getViewMode(undefined)).toEqual(ViewMode.USER)
		expect(getViewMode(null)).toEqual(ViewMode.USER)
	})
})
