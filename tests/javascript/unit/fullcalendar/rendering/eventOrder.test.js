/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import eventOrder from '../../../../../src/fullcalendar/rendering/eventOrder.js'

describe('fullcalendar/eventOrder test suite', () => {

	it('should sort events by the underlying calendar-order', () => {
		const firstEvent = {
			extendedProps: {
				calendarOrder: 0,
				calendarName: 'AACCEE',
				calendarId: 'ID:AABBCC',
			},
			title: 'Title 123',
		}
		const secondEvent = {
			extendedProps: {
				calendarOrder: 5,
				calendarName: 'AABBCC',
				calendarId: 'ID:AACCEE',
			},
			title: 'Title 123',
		}

		expect(eventOrder(firstEvent, secondEvent)).toEqual(-1)
		expect(eventOrder(secondEvent, firstEvent)).toEqual(1)
	})

	it('should sort events by calendar-name if calendar-order is equal', () => {
		const firstEvent = {
			extendedProps: {
				calendarOrder: 42,
				calendarName: 'AABBCC',
				calendarId: 'ID:AACCEE',
			},
			title: 'Title 123',
		}
		const secondEvent = {
			extendedProps: {
				calendarOrder: 42,
				calendarName: 'AACCEE',
				calendarId: 'ID:AABBCC',
			},
			title: 'Title 123',
		}

		expect(eventOrder(firstEvent, secondEvent)).toEqual(-1)
		expect(eventOrder(secondEvent, firstEvent)).toEqual(1)
	})

	it('should sort events by calendar-id if calendar-name and calendar-order is equal', () => {
		const firstEvent = {
			extendedProps: {
				calendarOrder: 42,
				calendarName: 'AABBCC',
				calendarId: 'ID:AABBCC',
			},
			title: 'Title 123',
		}
		const secondEvent = {
			extendedProps: {
				calendarOrder: 42,
				calendarName: 'AABBCC',
				calendarId: 'ID:AACCEE',
			},
			title: 'Title 123',
		}

		expect(eventOrder(firstEvent, secondEvent)).toEqual(-1)
		expect(eventOrder(secondEvent, firstEvent)).toEqual(1)
	})

	it('should sort events by title as a fallback', () => {
		const firstEvent = {
			extendedProps: {
				calendarOrder: 42,
				calendarName: 'AABBCC',
				calendarId: 'ID:AABBCC',
			},
			title: 'Title 123',
		}
		const secondEvent = {
			extendedProps: {
				calendarOrder: 42,
				calendarName: 'AABBCC',
				calendarId: 'ID:AABBCC',
			},
			title: 'Title 456',
		}

		expect(eventOrder(firstEvent, secondEvent)).toEqual(-1)
		expect(eventOrder(secondEvent, firstEvent)).toEqual(1)
	})

	it('should return zero if all properties are equal', () => {
		const firstEvent = {
			extendedProps: {
				calendarOrder: 42,
				calendarName: 'AABBCC',
				calendarId: 'ID:AABBCC',
			},
			title: 'Title 123',
		}
		const secondEvent = {
			extendedProps: {
				calendarOrder: 42,
				calendarName: 'AABBCC',
				calendarId: 'ID:AABBCC',
			},
			title: 'Title 123',
		}

		expect(eventOrder(firstEvent, secondEvent)).toEqual(0)
		expect(eventOrder(secondEvent, firstEvent)).toEqual(0)
	})

})
