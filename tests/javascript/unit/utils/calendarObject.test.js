/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { getParserManager } from '@nextcloud/calendar-js'
import { describe, expect, it } from 'vitest'
import { isBaseOccurrence } from '@/utils/calendarObject.js'

/**
 * @param {string} ics Raw ICS text
 * @return {object} calendarObject Fake calendar-object model wrapping the parsed calendarComponent
 */
function parseCalendarObject(ics) {
	const parser = getParserManager().getParserForFileType('text/calendar')
	parser.parse(ics)
	const calendarComponent = parser.getItemIterator().next().value
	return { calendarComponent }
}

/**
 * @param {object} calendarObject Calendar-object model
 * @return {object} The master VEVENT component (without RECURRENCE-ID)
 */
function getBaseComponent(calendarObject) {
	for (const component of calendarObject.calendarComponent.getComponentIterator()) {
		if (component.name === 'VEVENT' && !component.hasProperty('RECURRENCE-ID')) {
			return component
		}
	}
	return null
}

describe('utils/calendarObject isBaseOccurrence', () => {
	it('returns true for the first occurrence of a simple weekly series', () => {
		const calendarObject = parseCalendarObject([
			'BEGIN:VCALENDAR',
			'VERSION:2.0',
			'PRODID:-//Nextcloud Tests//calendar-js//EN',
			'BEGIN:VEVENT',
			'UID:primary-occurrence-test',
			'DTSTART:20260907T100000Z',
			'DTEND:20260907T110000Z',
			'DTSTAMP:20260901T000000Z',
			'SUMMARY:Test',
			'RRULE:FREQ=WEEKLY;COUNT=5',
			'END:VEVENT',
			'END:VCALENDAR',
		].join('\r\n'))
		const baseComponent = getBaseComponent(calendarObject)

		const firstOccurrence = baseComponent.recurrenceManager.getOccurrenceAtExactly(baseComponent.startDate)

		expect(isBaseOccurrence(calendarObject, firstOccurrence)).toBe(true)
	})

	it('returns false for a later occurrence of a simple weekly series', () => {
		const calendarObject = parseCalendarObject([
			'BEGIN:VCALENDAR',
			'VERSION:2.0',
			'PRODID:-//Nextcloud Tests//calendar-js//EN',
			'BEGIN:VEVENT',
			'UID:primary-occurrence-test',
			'DTSTART:20260907T100000Z',
			'DTEND:20260907T110000Z',
			'DTSTAMP:20260901T000000Z',
			'SUMMARY:Test',
			'RRULE:FREQ=WEEKLY;COUNT=5',
			'END:VEVENT',
			'END:VCALENDAR',
		].join('\r\n'))
		const baseComponent = getBaseComponent(calendarObject)
		const rangeEnd = baseComponent.startDate.clone()
		rangeEnd.year += 1
		const secondOccurrence = baseComponent.recurrenceManager.getAllOccurrencesBetween(baseComponent.startDate, rangeEnd)[1]

		expect(isBaseOccurrence(calendarObject, secondOccurrence)).toBe(false)
	})

	it('returns true for the real first occurrence even when DTSTART does not match the RRULE (e.g. BYDAY excludes it)', () => {
		// DTSTART is a Thursday, but the rule only ever generates Mondays - DTSTART
		// itself is never a valid occurrence, so the real first occurrence is later.
		const calendarObject = parseCalendarObject([
			'BEGIN:VCALENDAR',
			'VERSION:2.0',
			'PRODID:-//Nextcloud Tests//calendar-js//EN',
			'BEGIN:VEVENT',
			'UID:misaligned-dtstart-test',
			'DTSTART:20260903T100000Z',
			'DTEND:20260903T110000Z',
			'DTSTAMP:20260901T000000Z',
			'SUMMARY:Test',
			'RRULE:FREQ=WEEKLY;COUNT=5;BYDAY=MO',
			'END:VEVENT',
			'END:VCALENDAR',
		].join('\r\n'))
		const baseComponent = getBaseComponent(calendarObject)

		expect(baseComponent.recurrenceManager.getOccurrenceAtExactly(baseComponent.startDate)).toBeNull()

		const realFirstOccurrence = baseComponent.recurrenceManager.getClosestOccurrence(baseComponent.startDate)

		expect(isBaseOccurrence(calendarObject, realFirstOccurrence)).toBe(true)
	})

	it('returns false for a non-recurring event', () => {
		const calendarObject = parseCalendarObject([
			'BEGIN:VCALENDAR',
			'VERSION:2.0',
			'PRODID:-//Nextcloud Tests//calendar-js//EN',
			'BEGIN:VEVENT',
			'UID:non-recurring-test',
			'DTSTART:20260907T100000Z',
			'DTEND:20260907T110000Z',
			'DTSTAMP:20260901T000000Z',
			'SUMMARY:Test',
			'END:VEVENT',
			'END:VCALENDAR',
		].join('\r\n'))
		const baseComponent = getBaseComponent(calendarObject)

		expect(isBaseOccurrence(calendarObject, baseComponent)).toBe(false)
	})
})
