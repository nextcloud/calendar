/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { translate, getCanonicalLocale } from '@nextcloud/l10n'
import { formatDateWithTimezone, isMultiDayAllDayEvent } from '../../../../../src/utils/date.js'
import eventRender from "../../../../../src/fullcalendar/rendering/eventDidMount.js";

vi.mock('@nextcloud/l10n')
vi.mock('../../../../../src/utils/date.js')

describe('fullcalendar/eventDidMount test suite', () => {

	it('should add extended properties from the event to the dataset of the dom element - existing event', () => {
		const el = document.createElement('div')
		const event = {
			source: {},
			extendedProps: {
				objectId: 'object123',
				recurrenceId: 'recurrence456',
			},
		}

		eventRender({ event, el })

		expect(el.dataset.isNew).toEqual(undefined)
		expect(el.dataset.objectId).toEqual('object123')
		expect(el.dataset.recurrenceId).toEqual('recurrence456')
	})

	it('should add extended properties from the event to the dataset of the dom element - new event', () => {
		const el = document.createElement('div')
		const event = {
			source: null,
			extendedProps: {},
		}

		eventRender({ event, el })

		expect(el.dataset.isNew).toEqual('yes')
		expect(el.dataset.objectId).toEqual(undefined)
		expect(el.dataset.recurrenceId).toEqual(undefined)
	})

	it('should add an alarm bell icon if event has an alarm - dark', () => {
		const fcTime = document.createElement('span')
		fcTime.classList.add('fc-time')
		fcTime.appendChild(document.createTextNode('2pm'))
		const fcTitle = document.createElement('span')
		fcTitle.classList.add('fc-title')
		fcTitle.appendChild(document.createTextNode('Title 123'))

		const fcContent = document.createElement('div')
		fcContent.classList.add('fc-content')
		fcContent.appendChild(fcTime)
		fcContent.appendChild(fcTitle)

		const el = document.createElement('div')
		el.classList.add('fc-event-nc-alarms')
		el.appendChild(fcContent)

		const event = {
			source: {},
			extendedProps: {
				objectId: 'object123',
				recurrenceId: 'recurrence456',
				darkText: true,
				percent: 100,
			},
		}

		eventRender({ event, el })

		expect(el.outerHTML).toEqual('<div class="fc-event-nc-alarms" aria-label="undefined" data-object-id="object123" data-recurrence-id="recurrence456"><div class="fc-content"><span class="fc-time">2pm</span><span class="fc-title">Title 123</span><span class="icon-event-reminder icon-event-reminder--dark" aria-hidden="true"></span></div></div>')
	})

	it('should add an alarm bell icon if event has an alarm - light', () => {
		const fcTime = document.createElement('span')
		fcTime.classList.add('fc-time')
		fcTime.appendChild(document.createTextNode('2pm'))
		const fcTitle = document.createElement('span')
		fcTitle.classList.add('fc-title')
		fcTitle.appendChild(document.createTextNode('Title 123'))

		const fcContent = document.createElement('div')
		fcContent.classList.add('fc-content')
		fcContent.appendChild(fcTime)
		fcContent.appendChild(fcTitle)

		const el = document.createElement('div')
		el.classList.add('fc-event-nc-alarms')
		el.appendChild(fcContent)

		const event = {
			source: {},
			extendedProps: {
				objectId: 'object123',
				recurrenceId: 'recurrence456',
				darkText: false,
				percent: 100,
			},
		}

		eventRender({ event, el })

		expect(el.outerHTML).toEqual('<div class="fc-event-nc-alarms" aria-label="undefined" data-object-id="object123" data-recurrence-id="recurrence456"><div class="fc-content"><span class="fc-time">2pm</span><span class="fc-title">Title 123</span><span class="icon-event-reminder icon-event-reminder--light" aria-hidden="true"></span></div></div>')
	})

	// TODO: fix me later
	// it('should prepend a checkbox before tasks - incomplete', () => {
	// 	const fcTime = document.createElement('span')
	// 	fcTime.classList.add('fc-time')
	// 	fcTime.appendChild(document.createTextNode('2pm'))
	// 	const fcTitle = document.createElement('span')
	// 	fcTitle.classList.add('fc-title')
	// 	fcTitle.appendChild(document.createTextNode('Title 123'))
	//
	// 	const fcContent = document.createElement('div')
	// 	fcContent.classList.add('fc-content')
	// 	fcContent.appendChild(fcTime)
	// 	fcContent.appendChild(fcTitle)
	//
	// 	const el = document.createElement('div')
	// 	el.classList.add('fc-event-nc-task')
	// 	el.appendChild(fcContent)
	//
	// 	const event = {
	// 		source: {},
	// 		extendedProps: {
	// 			objectId: 'object123',
	// 			recurrenceId: 'recurrence456',
	// 			darkText: false,
	// 			percent: 50,
	// 		},
	// 	}
	//
	// 	eventRender({ event, el })
	//
	// 	expect(el.outerHTML).toEqual('<div class="fc-event-nc-task" data-object-id="object123" data-recurrence-id="recurrence456"><div class="fc-content"><span class="icon-event-task icon-event-task--light"></span><span class="fc-time">2pm</span><span class="fc-title">Title 123</span></div></div>')
	// })
	//
	// it('should prepend a checkbox before tasks - completed', () => {
	// 	const fcTime = document.createElement('span')
	// 	fcTime.classList.add('fc-time')
	// 	fcTime.appendChild(document.createTextNode('2pm'))
	// 	const fcTitle = document.createElement('span')
	// 	fcTitle.classList.add('fc-title')
	// 	fcTitle.appendChild(document.createTextNode('Title 123'))
	//
	// 	const fcContent = document.createElement('div')
	// 	fcContent.classList.add('fc-content')
	// 	fcContent.appendChild(fcTime)
	// 	fcContent.appendChild(fcTitle)
	//
	// 	const el = document.createElement('div')
	// 	el.classList.add('fc-event-nc-task')
	// 	el.appendChild(fcContent)
	//
	// 	const event = {
	// 		source: {},
	// 		extendedProps: {
	// 			objectId: 'object123',
	// 			recurrenceId: 'recurrence456',
	// 			darkText: false,
	// 			percent: 100,
	// 		},
	// 	}
	//
	// 	eventRender({ event, el })
	//
	// 	expect(el.outerHTML).toEqual('<div class="fc-event-nc-task" data-object-id="object123" data-recurrence-id="recurrence456"><div class="fc-content"><span class="icon-event-task icon-event-task--light icon-event-task--checked--light"></span><span class="fc-time">2pm</span><span class="fc-title">Title 123</span></div></div>')
	// })

})

describe('fullcalendar/eventDidMount aria-label test suite', () => {

	beforeEach(() => {
		translate.mockClear()
		getCanonicalLocale.mockClear()
		formatDateWithTimezone.mockClear()
		isMultiDayAllDayEvent.mockClear()

		getCanonicalLocale.mockReturnValue('en')

		// Mock translate to perform placeholder substitution like the real function
		translate.mockImplementation((app, str, params) => {
			if (!params) return str
			return Object.entries(params).reduce(
				(result, [key, value]) => result.replace(`{${key}}`, value),
				str,
			)
		})
	})

	/**
	 * Helper to create a minimal event object
	 *
	 * @param {object} overrides Properties to override on the event
	 * @return {object} A minimal fullcalendar-like event object
	 */
	function createEvent(overrides = {}) {
		return {
			title: 'Team Meeting',
			allDay: false,
			start: new Date('2026-03-11T10:00:00'),
			end: new Date('2026-03-11T11:00:00'),
			source: {},
			extendedProps: {
				objectId: 'obj1',
				recurrenceId: 'rec1',
			},
			...overrides,
		}
	}

	/**
	 * Helper to create a DOM element and run eventRender, returning the aria-label
	 *
	 * @param {object} event The event object
	 * @return {string} The aria-label attribute value
	 */
	function getAriaLabel(event) {
		const el = document.createElement('div')
		eventRender({ event, el })
		return el.getAttribute('aria-label')
	}

	describe('all-day events', () => {

		it('should build an aria-label for a single-day all-day event', () => {
			const start = new Date('2026-03-11T00:00:00')
			const end = new Date('2026-03-12T00:00:00')

			formatDateWithTimezone.mockReturnValue('Wednesday, March 11, 2026')
			isMultiDayAllDayEvent.mockReturnValue(false)

			const label = getAriaLabel(createEvent({ allDay: true, start, end }))

			expect(label).toBe('Team Meeting, All day: Wednesday, March 11, 2026')
			expect(formatDateWithTimezone).toHaveBeenCalledWith(start, 'en', expect.objectContaining({
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			}))
		})

		it('should build an aria-label for a multi-day all-day event', () => {
			const start = new Date('2026-03-11T00:00:00')
			const end = new Date('2026-03-14T00:00:00')

			formatDateWithTimezone
				.mockReturnValueOnce('Wednesday, March 11, 2026')
				.mockReturnValueOnce('Friday, March 13, 2026')
			isMultiDayAllDayEvent.mockReturnValue(true)

			const label = getAriaLabel(createEvent({ allDay: true, start, end }))

			expect(label).toBe('Team Meeting, All day: Wednesday, March 11, 2026 to Friday, March 13, 2026')
			// Should have been called twice: once for start, once for adjusted end
			expect(formatDateWithTimezone).toHaveBeenCalledTimes(2)
		})

		it('should handle an all-day event with no end date', () => {
			const start = new Date('2026-03-11T00:00:00')

			formatDateWithTimezone.mockReturnValue('Wednesday, March 11, 2026')

			const label = getAriaLabel(createEvent({ allDay: true, start, end: null }))

			expect(label).toBe('Team Meeting, All day: Wednesday, March 11, 2026')
		})

		it('should handle an all-day event with no start date', () => {
			const label = getAriaLabel(createEvent({ allDay: true, start: null, end: null }))

			expect(label).toBe('Team Meeting, All day')
			expect(formatDateWithTimezone).not.toHaveBeenCalled()
		})
	})

	describe('timed events', () => {

		it('should build an aria-label for a same-day timed event', () => {
			const start = new Date('2026-03-11T10:00:00Z')
			const end = new Date('2026-03-11T11:00:00Z')
			// Make toDateString() match for same-day detection
			start.toDateString = () => 'Wed Mar 11 2026'
			end.toDateString = () => 'Wed Mar 11 2026'

			formatDateWithTimezone
				.mockReturnValueOnce('Wednesday, March 11, 2026, 10:00 AM')
				.mockReturnValueOnce('11:00 AM')

			const label = getAriaLabel(createEvent({ allDay: false, start, end }))

			expect(label).toBe('Team Meeting, Wednesday, March 11, 2026, 10:00 AM to 11:00 AM')
			expect(formatDateWithTimezone).toHaveBeenCalledTimes(2)
			// First call: full datetime for start
			expect(formatDateWithTimezone).toHaveBeenCalledWith(start, 'en', expect.objectContaining({
				weekday: 'long',
				hour: 'numeric',
				minute: 'numeric',
			}), true)
			// Second call: time-only for end
			expect(formatDateWithTimezone).toHaveBeenCalledWith(end, 'en', expect.objectContaining({
				hour: 'numeric',
				minute: 'numeric',
			}), true)
		})

		it('should build an aria-label for a multi-day timed event', () => {
			const start = new Date('2026-03-11T10:00:00Z')
			const end = new Date('2026-03-12T14:00:00Z')
			start.toDateString = () => 'Wed Mar 11 2026'
			end.toDateString = () => 'Thu Mar 12 2026'

			formatDateWithTimezone
				.mockReturnValueOnce('Wednesday, March 11, 2026, 10:00 AM')
				.mockReturnValueOnce('Thursday, March 12, 2026, 2:00 PM')

			const label = getAriaLabel(createEvent({ allDay: false, start, end }))

			expect(label).toBe('Team Meeting, Wednesday, March 11, 2026, 10:00 AM to Thursday, March 12, 2026, 2:00 PM')
			expect(formatDateWithTimezone).toHaveBeenCalledTimes(2)
			// Both calls use full dateTime options
			expect(formatDateWithTimezone).toHaveBeenNthCalledWith(1, start, 'en', expect.objectContaining({
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
			}), true)
			expect(formatDateWithTimezone).toHaveBeenNthCalledWith(2, end, 'en', expect.objectContaining({
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
			}), true)
		})

		it('should handle a timed event with no end date', () => {
			const start = new Date('2026-03-11T10:00:00Z')

			formatDateWithTimezone.mockReturnValue('Wednesday, March 11, 2026, 10:00 AM')

			const label = getAriaLabel(createEvent({ allDay: false, start, end: null }))

			expect(label).toBe('Team Meeting, Wednesday, March 11, 2026, 10:00 AM')
			expect(formatDateWithTimezone).toHaveBeenCalledTimes(1)
		})

		it('should handle a timed event with no start date', () => {
			const label = getAriaLabel(createEvent({ allDay: false, start: null, end: null }))

			expect(label).toBe('Team Meeting')
			expect(formatDateWithTimezone).not.toHaveBeenCalled()
		})
	})

	describe('edge cases', () => {

		it('should use "Untitled event" for events with no title', () => {
			const start = new Date('2026-03-11T00:00:00')

			formatDateWithTimezone.mockReturnValue('Wednesday, March 11, 2026')
			isMultiDayAllDayEvent.mockReturnValue(false)

			const label = getAriaLabel(createEvent({ title: '', allDay: true, start, end: null }))

			expect(label).toBe('Untitled event, All day: Wednesday, March 11, 2026')
		})

		it('should use "Untitled event" for events with undefined title', () => {
			const label = getAriaLabel(createEvent({ title: undefined, allDay: false, start: null, end: null }))

			expect(label).toBe('Untitled event')
		})

		it('should set the aria-label attribute on the DOM element', () => {
			const start = new Date('2026-03-11T00:00:00')

			formatDateWithTimezone.mockReturnValue('Wednesday, March 11, 2026')
			isMultiDayAllDayEvent.mockReturnValue(false)

			const el = document.createElement('div')
			const event = createEvent({ allDay: true, start, end: null })

			eventRender({ event, el })

			expect(el.hasAttribute('aria-label')).toBe(true)
			expect(el.getAttribute('aria-label')).toBeTruthy()
			expect(el.getAttribute('aria-label')).toContain('Team Meeting')
		})

		it('should use all localized strings via t() and not hardcode separators', () => {
			const start = new Date('2026-03-11T10:00:00Z')
			const end = new Date('2026-03-11T11:00:00Z')
			start.toDateString = () => 'Wed Mar 11 2026'
			end.toDateString = () => 'Wed Mar 11 2026'

			formatDateWithTimezone
				.mockReturnValueOnce('formatted-start')
				.mockReturnValueOnce('formatted-end')

			getAriaLabel(createEvent({ allDay: false, start, end }))

			// Verify that translate was called for combining title + time description
			// (not just raw string concatenation)
			const translateCalls = translate.mock.calls
			const ariaLabelCall = translateCalls.find(
				call => call[1] === '{title}, {timeDescription}',
			)
			expect(ariaLabelCall).toBeTruthy()
			expect(ariaLabelCall[2]).toEqual({
				title: 'Team Meeting',
				timeDescription: 'formatted-start to formatted-end',
			})
		})

		it('should pass through getCanonicalLocale to formatDateWithTimezone', () => {
			getCanonicalLocale.mockReturnValue('ar')

			const start = new Date('2026-03-11T00:00:00')
			formatDateWithTimezone.mockReturnValue('الأربعاء، ١١ مارس ٢٠٢٦')
			isMultiDayAllDayEvent.mockReturnValue(false)

			getAriaLabel(createEvent({ allDay: true, start, end: null }))

			expect(formatDateWithTimezone).toHaveBeenCalledWith(
				start,
				'ar',
				expect.any(Object),
			)
		})

		it('should handle undefined locale from getCanonicalLocale', () => {
			getCanonicalLocale.mockReturnValue('')

			const start = new Date('2026-03-11T00:00:00')
			formatDateWithTimezone.mockReturnValue('Wednesday, March 11, 2026')
			isMultiDayAllDayEvent.mockReturnValue(false)

			getAriaLabel(createEvent({ allDay: true, start, end: null }))

			// Empty string is falsy, so locale should be undefined
			expect(formatDateWithTimezone).toHaveBeenCalledWith(
				start,
				undefined,
				expect.any(Object),
			)
		})
	})
})
