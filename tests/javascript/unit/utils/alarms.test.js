/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import {
	getFactorForAlarmUnit,
	getAmountHoursMinutesAndUnitForAllDayEvents,
	getAmountAndUnitForTimedEvents,
	getTotalSecondsFromAmountAndUnitForTimedEvents,
	getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents,
	updateAlarms,
} from '../../../../src/utils/alarms.js'
import { getParserManager } from '@nextcloud/calendar-js'

/**
 * Parse an ICS string and return the first event component.
 *
 * @param {string} ics The calendar data
 * @return {object} The first event component
 */
function firstEventFromICS(ics) {
	const parser = getParserManager().getParserForFileType('text/calendar')
	parser.parse(ics)
	const calendarComponent = parser.getAllItems()[0]
	return calendarComponent.getVObjectIterator().next().value
}

/**
 * Build a single-event ICS with the given alarm and attendee blocks.
 *
 * @param {string} alarms VALARM blocks
 * @param {string} attendees ATTENDEE lines
 * @return {string} The calendar data
 */
function eventICS(alarms, attendees = '') {
	return [
		'BEGIN:VCALENDAR',
		'PRODID:-//test//test//EN',
		'VERSION:2.0',
		'BEGIN:VEVENT',
		'UID:alarm-attendee-test',
		'DTSTAMP:20260101T000000Z',
		'DTSTART:20260101T100000Z',
		'DTEND:20260101T110000Z',
		'SUMMARY:My event',
		attendees,
		alarms,
		'END:VEVENT',
		'END:VCALENDAR',
	].filter(Boolean).join('\r\n')
}

describe('utils/alarms test suite', () => {

	it('should return the correct factor for different units', () => {
		expect(getFactorForAlarmUnit('seconds')).toEqual(1)
		expect(getFactorForAlarmUnit('minutes')).toEqual(60)
		expect(getFactorForAlarmUnit('hours')).toEqual(3600)
		expect(getFactorForAlarmUnit('days')).toEqual(86400)
		expect(getFactorForAlarmUnit('weeks')).toEqual(604800)
		expect(getFactorForAlarmUnit('fallback-default')).toEqual(1)
	})

	it('should get the amount and unit from total seconds', () => {
		expect(getAmountAndUnitForTimedEvents(0)).toEqual({
			amount: 0,
			unit: 'minutes'
		})

		expect(getAmountAndUnitForTimedEvents(-60)).toEqual({
			amount: 1,
			unit: 'minutes'
		})

		expect(getAmountAndUnitForTimedEvents(59)).toEqual({
			amount: 59,
			unit: 'seconds'
		})

		expect(getAmountAndUnitForTimedEvents(-61)).toEqual({
			amount: 61,
			unit: 'seconds'
		})

		expect(getAmountAndUnitForTimedEvents(120)).toEqual({
			amount: 2,
			unit: 'minutes'
		})

		expect(getAmountAndUnitForTimedEvents(-3600)).toEqual({
			amount: 1,
			unit: 'hours'
		})

		expect(getAmountAndUnitForTimedEvents(3660)).toEqual({
			amount: 61,
			unit: 'minutes'
		})

		expect(getAmountAndUnitForTimedEvents(-43200)).toEqual({
			amount: 12,
			unit: 'hours'
		})

		expect(getAmountAndUnitForTimedEvents(259200)).toEqual({
			amount: 3,
			unit: 'days'
		})

		expect(getAmountAndUnitForTimedEvents(-1209600)).toEqual({
			amount: 2,
			unit: 'weeks'
		})
	})

	it('should get the total amount of seconds from amount and unit', () => {
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'seconds')).toEqual(-1)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'minutes')).toEqual(-60)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'hours')).toEqual(-3600)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'days')).toEqual(-86400)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'weeks')).toEqual(-604800)

		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(42, 'seconds')).toEqual(-42)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(42, 'minutes')).toEqual(-2520)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(42, 'hours')).toEqual(-151200)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(42, 'days')).toEqual(-3628800)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(42, 'weeks')).toEqual(-25401600)

		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'seconds', false)).toEqual(1)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'minutes', false)).toEqual(60)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'hours', false)).toEqual(3600)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'days', false)).toEqual(86400)
		expect(getTotalSecondsFromAmountAndUnitForTimedEvents(1, 'weeks', false)).toEqual(604800)
	})

	it('should get the amount, hours, minutes and unit for a reminder of an all-day event', () => {
		// Same day at 9am 1 minute and 5 seconds
		expect(getAmountHoursMinutesAndUnitForAllDayEvents(32465)).toEqual({
			amount: 0,
			hours: 9,
			minutes: 1,
			unit: 'days'
		})

		// 1 day before at 9am
		expect(getAmountHoursMinutesAndUnitForAllDayEvents(-15 * 60 * 60)).toEqual({
			amount: 1,
			hours: 9,
			minutes: 0,
			unit: 'days'
		})

		// 2 days before at 9am
		expect(getAmountHoursMinutesAndUnitForAllDayEvents(-39 * 60 * 60)).toEqual({
			amount: 2,
			hours: 9,
			minutes: 0,
			unit: 'days'
		})

		// 1 week before at 9am
		expect(getAmountHoursMinutesAndUnitForAllDayEvents(-159 * 60 * 60)).toEqual({
			amount: 1,
			hours: 9,
			minutes: 0,
			unit: 'weeks'
		})

		// 10 days before at 9am
		expect(getAmountHoursMinutesAndUnitForAllDayEvents(-231 * 60 * 60)).toEqual({
			amount: 10,
			hours: 9,
			minutes: 0,
			unit: 'days'
		})

		// 1 week before at 8:30am
		expect(getAmountHoursMinutesAndUnitForAllDayEvents(-159 * 60 * 60 - 30 * 60)).toEqual({
			amount: 1,
			hours: 8,
			minutes: 30,
			unit: 'weeks'
		})
	})

	it('should get the total amount of seconds from amount, hours, minutes and unit', () => {
		expect(getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(0, 9, 1, 'days')).toEqual(32460)

		expect(getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(1, 9, 0, 'days')).toEqual(-15 * 60 * 60)

		expect(getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(2, 9, 0, 'days')).toEqual(-39 * 60 * 60)

		expect(getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(1, 9, 0, 'weeks')).toEqual(-159 * 60 * 60)

		expect(getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(10, 9, 0, 'days')).toEqual(-231 * 60 * 60)

		expect(getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(1, 8, 30, 'weeks')).toEqual(-159 * 60 * 60 - 30 * 60)
	})

	describe('updateAlarms', () => {
		it('keeps DISPLAY alarms RFC-conformant: a DESCRIPTION but no SUMMARY/ATTENDEE', () => {
			const event = firstEventFromICS(eventICS(
				['BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:-PT15M', 'END:VALARM'].join('\r\n'),
				['ATTENDEE:mailto:a@example.com', 'ATTENDEE:mailto:b@example.com'].join('\r\n'),
			))

			updateAlarms(event)

			const alarm = event.getAlarmIterator().next().value
			expect(alarm.action).toEqual('DISPLAY')
			expect(alarm.hasProperty('DESCRIPTION')).toBe(true)
			expect(alarm.hasProperty('SUMMARY')).toBe(false)
			expect(alarm.hasProperty('ATTENDEE')).toBe(false)
		})

		it('populates EMAIL alarms with SUMMARY, DESCRIPTION and one ATTENDEE per event attendee', () => {
			const event = firstEventFromICS(eventICS(
				['BEGIN:VALARM', 'ACTION:EMAIL', 'TRIGGER:-PT30M', 'END:VALARM'].join('\r\n'),
				['ATTENDEE:mailto:a@example.com', 'ATTENDEE:mailto:b@example.com'].join('\r\n'),
			))

			updateAlarms(event)

			const alarm = event.getAlarmIterator().next().value
			expect(alarm.action).toEqual('EMAIL')
			expect(alarm.hasProperty('DESCRIPTION')).toBe(true)
			expect(alarm.hasProperty('SUMMARY')).toBe(true)
			expect([...alarm.getPropertyIterator('ATTENDEE')]).toHaveLength(2)
		})

		it('strips a stale SUMMARY/ATTENDEE that a DISPLAY alarm received previously', () => {
			const event = firstEventFromICS(eventICS(
				[
					'BEGIN:VALARM',
					'ACTION:DISPLAY',
					'TRIGGER:-PT15M',
					'DESCRIPTION:This is an event reminder.',
					'SUMMARY:My event',
					'ATTENDEE:mailto:a@example.com',
					'END:VALARM',
				].join('\r\n'),
				'ATTENDEE:mailto:a@example.com',
			))

			updateAlarms(event)

			const alarm = event.getAlarmIterator().next().value
			expect(alarm.hasProperty('SUMMARY')).toBe(false)
			expect(alarm.hasProperty('ATTENDEE')).toBe(false)
			expect(alarm.hasProperty('DESCRIPTION')).toBe(true)
		})

		it('does not copy ROOM or RESOURCE attendees into EMAIL alarms', () => {
			const event = firstEventFromICS(eventICS(
				['BEGIN:VALARM', 'ACTION:EMAIL', 'TRIGGER:-PT30M', 'END:VALARM'].join('\r\n'),
				[
					'ATTENDEE:mailto:a@example.com',
					'ATTENDEE;CUTYPE=ROOM:mailto:room@example.com',
					'ATTENDEE;CUTYPE=RESOURCE:mailto:beamer@example.com',
				].join('\r\n'),
			))

			updateAlarms(event)

			const alarm = event.getAlarmIterator().next().value
			expect([...alarm.getPropertyIterator('ATTENDEE')]).toHaveLength(1)
		})
	})
})


