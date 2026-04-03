/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import useCalendarsStore from '../../../../src/store/calendars.js'

import { setActivePinia, createPinia } from 'pinia'

describe('store/calendars test suite', () => {
	
	beforeEach(() => {
		setActivePinia(createPinia())
	})

	it('should provide a getter for all writable calendars sorted', () => {
		const calendarsStore = useCalendarsStore()
		const calendarOrderLast = {
			id: "1",
			order: 2,
			supportsEvents: false,
			supportsJournals: true
		}
		const calendarReadOnly = {
			id: "2",
			readOnly: true,
			supportsEvents: true,
		}
		const calendarOrderFirst = {
			id: "3",
			order: 1,
			supportsEvents: true,
			supportsJournals: false
		}
		calendarsStore.addCalendarMutation({ calendar: calendarOrderLast })
		calendarsStore.addCalendarMutation({ calendar: calendarReadOnly })
		calendarsStore.addCalendarMutation({ calendar: calendarOrderFirst })

		writableCalendars = calendarsStore.sortedWritableCalendarsEvenWithoutSupportForEvents
		expect(writableCalendars).toMatchObject([calendarOrderFirst, calendarOrderLast])
	})

})
