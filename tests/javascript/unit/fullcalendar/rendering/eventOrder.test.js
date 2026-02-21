/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import {
	allDayFirst,
	allDayOrder,
	partDayOrder,
} from '../../../../../src/fullcalendar/rendering/eventOrder.js'

describe('fullcalendar/eventOrder - allDayFirst', () => {

	it('should sort all-day events before timed events', () => {
		const allDayEvent = { allDay: true }
		const timedEvent = { allDay: false }

		expect(allDayFirst(allDayEvent, timedEvent)).toEqual(-1)
		expect(allDayFirst(timedEvent, allDayEvent)).toEqual(1)
	})

	it('should return zero when both events are all-day', () => {
		const first = { allDay: true }
		const second = { allDay: true }

		expect(allDayFirst(first, second)).toEqual(0)
	})

	it('should return zero when both events are timed', () => {
		const first = { allDay: false }
		const second = { allDay: false }

		expect(allDayFirst(first, second)).toEqual(0)
	})
})

describe('fullcalendar/eventOrder - allDayOrder', () => {

	it('should return zero when either event is not all-day', () => {
		const allDayEvent = { allDay: true, extendedProps: { calendarOrder: 0 }, duration: 1000, title: 'A' }
		const timedEvent = { allDay: false, extendedProps: { calendarOrder: 5 }, duration: 500, title: 'B' }

		expect(allDayOrder(allDayEvent, timedEvent)).toEqual(0)
		expect(allDayOrder(timedEvent, allDayEvent)).toEqual(0)
		expect(allDayOrder(timedEvent, timedEvent)).toEqual(0)
	})

	it('should sort all-day events by calendarOrder ascending', () => {
		const first = {
			allDay: true,
			extendedProps: { calendarOrder: 0 },
			duration: 1000,
			title: 'Title 123',
		}
		const second = {
			allDay: true,
			extendedProps: { calendarOrder: 5 },
			duration: 1000,
			title: 'Title 123',
		}

		expect(allDayOrder(first, second)).toEqual(-1)
		expect(allDayOrder(second, first)).toEqual(1)
	})

	it('should sort all-day events by duration descending when calendarOrder is equal', () => {
		const first = {
			allDay: true,
			extendedProps: { calendarOrder: 1 },
			duration: 2000,
			title: 'Title 123',
		}
		const second = {
			allDay: true,
			extendedProps: { calendarOrder: 1 },
			duration: 1000,
			title: 'Title 123',
		}

		// first has longer duration, so it should come first
		expect(allDayOrder(first, second)).toBeLessThan(0)
		expect(allDayOrder(second, first)).toBeGreaterThan(0)
	})

	it('should sort all-day events by title when calendarOrder and duration are equal', () => {
		const first = {
			allDay: true,
			extendedProps: { calendarOrder: 1 },
			duration: 1000,
			title: 'AAA',
		}
		const second = {
			allDay: true,
			extendedProps: { calendarOrder: 1 },
			duration: 1000,
			title: 'BBB',
		}

		expect(allDayOrder(first, second)).toEqual(-1)
		expect(allDayOrder(second, first)).toEqual(1)
	})

	it('should return zero when all properties are equal', () => {
		const first = {
			allDay: true,
			extendedProps: { calendarOrder: 1 },
			duration: 1000,
			title: 'Title 123',
		}
		const second = {
			allDay: true,
			extendedProps: { calendarOrder: 1 },
			duration: 1000,
			title: 'Title 123',
		}

		expect(allDayOrder(first, second)).toEqual(0)
		expect(allDayOrder(second, first)).toEqual(0)
	})
})

describe('fullcalendar/eventOrder - partDayOrder', () => {

	it('should sort timed events by start time ascending', () => {
		const firstEvent = {
			title: 'Title 123',
			allDay: false,
			start: 1000,
		}
		const secondEvent = {
			title: 'Title 123',
			allDay: false,
			start: 1001,
		}

		expect(partDayOrder(firstEvent, secondEvent)).toBeLessThan(0)
		expect(partDayOrder(secondEvent, firstEvent)).toBeGreaterThan(0)
		expect(partDayOrder(firstEvent, firstEvent)).toBe(0)
	})

	it('should return zero when both events are all-day', () => {
		const firstEvent = {
			title: 'Title 123',
			start: 1000,
			allDay: true,
		}
		const secondEvent = {
			title: 'Title 123',
			start: 1001,
			allDay: true,
		}

		expect(partDayOrder(firstEvent, secondEvent)).toBe(0)
		expect(partDayOrder(secondEvent, firstEvent)).toBe(0)
	})
})
