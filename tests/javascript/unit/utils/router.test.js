/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { loadState } from '@nextcloud/initial-state'
import {
	getInitialView,
	getPreferredEditorRoute,
	getPrefixedRoute,
	getViewMode,
	ViewMode,
} from '@/utils/router.js'

vi.mock('@nextcloud/initial-state')

describe('utils/router test suite', () => {
	beforeEach(() => {
		loadState.mockClear()
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
