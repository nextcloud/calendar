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
import eventOrder from "../../../../src/fullcalendar/eventOrder.js";

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
