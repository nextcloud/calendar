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
import {
	getInitialView,
	getPrefixedRoute,
	isPublicOrEmbeddedRoute,
	getPreferredEditorRoute,
} from '../../../../src/utils/router.js'
import { loadState } from '@nextcloud/initial-state'

jest.mock('@nextcloud/initial-state')

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

		expect(getPreferredEditorRoute()).toEqual('sidebar')
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

		expect(getPreferredEditorRoute()).toEqual('sidebar')
		expect(getPreferredEditorRoute()).toEqual('sidebar')
		expect(getPreferredEditorRoute()).toEqual('sidebar')

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

	it('should check whether a route is public or embedded', () => {
		expect(isPublicOrEmbeddedRoute('PublicCalendarView')).toEqual(true)
		expect(isPublicOrEmbeddedRoute('PublicEditPopoverView')).toEqual(true)

		expect(isPublicOrEmbeddedRoute('EmbedCalendarView')).toEqual(true)
		expect(isPublicOrEmbeddedRoute('EmbedEditPopoverView')).toEqual(true)

		expect(isPublicOrEmbeddedRoute('CalendarView')).toEqual(false)
		expect(isPublicOrEmbeddedRoute('EditPopoverView')).toEqual(false)
	})
})
