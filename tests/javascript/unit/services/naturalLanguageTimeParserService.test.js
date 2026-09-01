/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { parseNaturalLanguageTime } from '../../../../src/services/naturalLanguageTimeParserService.js'

// Fixed reference: Monday 15 June 2026, 09:00 local time
const REF = new Date(2026, 5, 15, 9, 0, 0)

describe('services/naturalLanguageTimeParserService', () => {

	describe('null / empty input', () => {
		it('returns null for null', () => {
			expect(parseNaturalLanguageTime(null)).toBeNull()
		})

		it('returns null for empty string', () => {
			expect(parseNaturalLanguageTime('')).toBeNull()
		})

		it('returns null for whitespace-only string', () => {
			expect(parseNaturalLanguageTime('   ')).toBeNull()
		})

		it('returns null for plain title with no time', () => {
			expect(parseNaturalLanguageTime('Team retrospective', REF)).toBeNull()
		})
	})

	describe('all-day detection', () => {
		it('recognises "all day"', () => {
			const result = parseNaturalLanguageTime('all day', REF)
			expect(result).not.toBeNull()
			expect(result.type).toBe('all-day')
		})

		it('recognises "all-day"', () => {
			const result = parseNaturalLanguageTime('all-day', REF)
			expect(result).not.toBeNull()
			expect(result.type).toBe('all-day')
		})

		it('recognises "All Day" (case-insensitive)', () => {
			expect(parseNaturalLanguageTime('All Day', REF).type).toBe('all-day')
		})

		it('finds "all day" embedded in a title', () => {
			expect(parseNaturalLanguageTime('Birthday party all day', REF).type).toBe('all-day')
		})

		it('provides matchedText and matchedIndex for "all day"', () => {
			const result = parseNaturalLanguageTime('Birthday party all day', REF)
			expect(result.matchedText).toBe('all day')
			expect(result.matchedIndex).toBe(15)
		})
	})

	describe('time-only detection', () => {
		it('parses 12-hour time "2pm"', () => {
			const result = parseNaturalLanguageTime('2pm', REF)
			expect(result.type).toBe('time-only')
			expect(result.startHour).toBe(14)
			expect(result.startMinute).toBe(0)
		})

		it('parses 12-hour time "2 pm"', () => {
			const result = parseNaturalLanguageTime('2 pm', REF)
			expect(result.type).toBe('time-only')
			expect(result.startHour).toBe(14)
		})

		it('parses 12-hour time with minutes "2:30pm"', () => {
			const result = parseNaturalLanguageTime('2:30pm', REF)
			expect(result.type).toBe('time-only')
			expect(result.startHour).toBe(14)
			expect(result.startMinute).toBe(30)
		})

		it('parses AM time "10am"', () => {
			const result = parseNaturalLanguageTime('10am', REF)
			expect(result.type).toBe('time-only')
			expect(result.startHour).toBe(10)
			expect(result.startMinute).toBe(0)
		})

		it('parses midnight "12am"', () => {
			const result = parseNaturalLanguageTime('12am', REF)
			expect(result.type).toBe('time-only')
			expect(result.startHour).toBe(0)
		})

		it('parses noon "12pm"', () => {
			const result = parseNaturalLanguageTime('12pm', REF)
			expect(result.type).toBe('time-only')
			expect(result.startHour).toBe(12)
		})

		it('parses 24-hour time "14:00"', () => {
			const result = parseNaturalLanguageTime('14:00', REF)
			expect(result.type).toBe('time-only')
			expect(result.startHour).toBe(14)
			expect(result.startMinute).toBe(0)
		})

		it('parses 24-hour time "19:00"', () => {
			const result = parseNaturalLanguageTime('19:00', REF)
			expect(result.type).toBe('time-only')
			expect(result.startHour).toBe(19)
		})

		it('parses 24-hour time with minutes "09:30"', () => {
			const result = parseNaturalLanguageTime('09:30', REF)
			expect(result.type).toBe('time-only')
			expect(result.startHour).toBe(9)
			expect(result.startMinute).toBe(30)
		})

		it('picks up time embedded in a title', () => {
			const result = parseNaturalLanguageTime('Team standup 9am', REF)
			expect(result.type).toBe('time-only')
			expect(result.startHour).toBe(9)
		})

		it('includes formatted displayText', () => {
			const result = parseNaturalLanguageTime('14:00', REF)
			expect(result.displayText).toBe('14:00')
		})

		it('provides matchedText and matchedIndex for embedded time', () => {
			const result = parseNaturalLanguageTime('Team standup 9am', REF)
			expect(result.matchedText).toBe('9am')
			expect(result.matchedIndex).toBe(13)
		})
	})

	describe('time-range detection', () => {
		it('parses "10:00 - 14:00"', () => {
			const result = parseNaturalLanguageTime('10:00 - 14:00', REF)
			expect(result.type).toBe('time-range')
			expect(result.startHour).toBe(10)
			expect(result.startMinute).toBe(0)
			expect(result.endHour).toBe(14)
			expect(result.endMinute).toBe(0)
		})

		it('parses "10am to 2pm"', () => {
			const result = parseNaturalLanguageTime('10am to 2pm', REF)
			expect(result.type).toBe('time-range')
			expect(result.startHour).toBe(10)
			expect(result.endHour).toBe(14)
		})

		it('parses "9:00 - 10:30" with non-zero minutes', () => {
			const result = parseNaturalLanguageTime('9:00 - 10:30', REF)
			expect(result.type).toBe('time-range')
			expect(result.startHour).toBe(9)
			expect(result.startMinute).toBe(0)
			expect(result.endHour).toBe(10)
			expect(result.endMinute).toBe(30)
		})

		it('parses ranges embedded in a title', () => {
			const result = parseNaturalLanguageTime('Workshop 10am - 1pm', REF)
			expect(result.type).toBe('time-range')
			expect(result.startHour).toBe(10)
			expect(result.endHour).toBe(13)
		})

		it('includes both times in displayText', () => {
			const result = parseNaturalLanguageTime('10:00 - 14:00', REF)
			expect(result.displayText).toContain('10:00')
			expect(result.displayText).toContain('14:00')
		})

		it('provides matchedText and matchedIndex for a range', () => {
			const result = parseNaturalLanguageTime('Workshop 10:00 - 14:00', REF)
			expect(result.matchedText).toBe('10:00 - 14:00')
			expect(result.matchedIndex).toBe(9)
		})
	})

	describe('date detection', () => {
		it('parses European format "23.07.26"', () => {
			const result = parseNaturalLanguageTime('23.07.26', REF)
			expect(result.type).toBe('date')
			expect(result.year).toBe(2026)
			expect(result.month).toBe(7)
			expect(result.day).toBe(23)
		})

		it('parses European format with full year "23.07.2026"', () => {
			const result = parseNaturalLanguageTime('23.07.2026', REF)
			expect(result.type).toBe('date')
			expect(result.year).toBe(2026)
			expect(result.month).toBe(7)
			expect(result.day).toBe(23)
		})

		it('parses US slash format "07/23/2026"', () => {
			const result = parseNaturalLanguageTime('07/23/2026', REF)
			expect(result.type).toBe('date')
			expect(result.month).toBe(7)
			expect(result.day).toBe(23)
			expect(result.year).toBe(2026)
		})

		it('parses month-name format "July 23"', () => {
			const result = parseNaturalLanguageTime('July 23', REF)
			expect(result.type).toBe('date')
			expect(result.month).toBe(7)
			expect(result.day).toBe(23)
		})

		it('parses month-name with year "July 23 2026"', () => {
			const result = parseNaturalLanguageTime('July 23 2026', REF)
			expect(result.type).toBe('date')
			expect(result.month).toBe(7)
			expect(result.day).toBe(23)
			expect(result.year).toBe(2026)
		})

		it('parses abbreviated month "Sep 4"', () => {
			const result = parseNaturalLanguageTime('Sep 4', REF)
			expect(result.type).toBe('date')
			expect(result.month).toBe(9)
			expect(result.day).toBe(4)
		})

		it('picks up date embedded in a title', () => {
			const result = parseNaturalLanguageTime('Flight 23.07.26', REF)
			expect(result.type).toBe('date')
			expect(result.day).toBe(23)
			expect(result.month).toBe(7)
		})

		it('provides matchedText and matchedIndex for an embedded date', () => {
			const result = parseNaturalLanguageTime('Flight 23.07.26', REF)
			expect(result.matchedText).toBe('23.07.26')
			expect(result.matchedIndex).toBe(7)
		})
	})

	describe('title stripping via matchedText / matchedIndex', () => {
		function stripMatch(title, result) {
			const before = title.slice(0, result.matchedIndex)
			const after = title.slice(result.matchedIndex + result.matchedText.length)
			return (before + after).replace(/\s+/g, ' ').trim()
		}

		function parseWithStrip(title) {
			const result = parseNaturalLanguageTime(title, REF)
			if (!result) return null
			result.strippedTitle = stripMatch(title, result)
			return result
		}

		it('strips standalone "1pm" leaving an empty title', () => {
			const r = parseWithStrip('1pm')
			expect(r.type).toBe('time-only')
			expect(r.matchedText).toBe('1pm')
			expect(r.matchedIndex).toBe(0)
			expect(r.strippedTitle).toBe('')
		})

		it('strips trailing "1pm" — "Meeting 1pm"', () => {
			const r = parseWithStrip('Meeting 1pm')
			expect(r.matchedText).toBe('1pm')
			expect(r.matchedIndex).toBe(8)
			expect(r.strippedTitle).toBe('Meeting')
		})

		it('strips leading "1pm" — "1pm dentist"', () => {
			const r = parseWithStrip('1pm dentist')
			expect(r.matchedText).toBe('1pm')
			expect(r.matchedIndex).toBe(0)
			expect(r.strippedTitle).toBe('dentist')
		})

		it('strips a trailing time — "Team standup 9am"', () => {
			const r = parseWithStrip('Team standup 9am')
			expect(r.matchedText).toBe('9am')
			expect(r.matchedIndex).toBe(13)
			expect(r.strippedTitle).toBe('Team standup')
		})

		it('strips a leading time — "9am Team standup"', () => {
			const r = parseWithStrip('9am Team standup')
			expect(r.matchedText).toBe('9am')
			expect(r.matchedIndex).toBe(0)
			expect(r.strippedTitle).toBe('Team standup')
		})

		it('strips a mid-title time — "Lunch 12:00 with Anna"', () => {
			const r = parseWithStrip('Lunch 12:00 with Anna')
			expect(r.matchedText).toBe('12:00')
			expect(r.matchedIndex).toBe(6)
			expect(r.strippedTitle).toBe('Lunch with Anna')
		})

		it('strips a trailing time range — "Workshop 10:00 - 14:00"', () => {
			const r = parseWithStrip('Workshop 10:00 - 14:00')
			expect(r.matchedText).toBe('10:00 - 14:00')
			expect(r.matchedIndex).toBe(9)
			expect(r.strippedTitle).toBe('Workshop')
		})

		it('strips a mid-title time range — "Workshop 10:00 - 14:00 venue TBD"', () => {
			const r = parseWithStrip('Workshop 10:00 - 14:00 venue TBD')
			expect(r.matchedIndex).toBe(9)
			expect(r.strippedTitle).toBe('Workshop venue TBD')
		})

		it('strips a leading time range — "10am to 2pm team sync"', () => {
			const r = parseWithStrip('10am to 2pm team sync')
			expect(r.matchedIndex).toBe(0)
			expect(r.strippedTitle).toBe('team sync')
		})

		it('strips trailing "all day" — "Birthday party all day"', () => {
			const r = parseWithStrip('Birthday party all day')
			expect(r.matchedText).toBe('all day')
			expect(r.matchedIndex).toBe(15)
			expect(r.strippedTitle).toBe('Birthday party')
		})

		it('strips leading "all-day" — "all-day conference"', () => {
			const r = parseWithStrip('all-day conference')
			expect(r.matchedText).toBe('all-day')
			expect(r.matchedIndex).toBe(0)
			expect(r.strippedTitle).toBe('conference')
		})

		it('strips a trailing European date — "Flight 23.07.26"', () => {
			const r = parseWithStrip('Flight 23.07.26')
			expect(r.matchedText).toBe('23.07.26')
			expect(r.matchedIndex).toBe(7)
			expect(r.strippedTitle).toBe('Flight')
		})

		it('strips a leading European date — "23.07.26 dentist"', () => {
			const r = parseWithStrip('23.07.26 dentist')
			expect(r.matchedText).toBe('23.07.26')
			expect(r.matchedIndex).toBe(0)
			expect(r.strippedTitle).toBe('dentist')
		})

		it('strips a month-name date — "July 23 dentist"', () => {
			const r = parseWithStrip('July 23 dentist')
			expect(r.matchedIndex).toBe(0)
			expect(r.strippedTitle).toBe('dentist')
		})

		it('strips datetime from title — "Dentist July 23, 4pm downtown"', () => {
			const r = parseWithStrip('Dentist July 23, 4pm downtown')
			expect(r.type).toBe('datetime')
			expect(r.strippedTitle).toBe('Dentist downtown')
		})
	})

	describe('datetime detection (date + time combined)', () => {
		it('parses "July 23, 4pm"', () => {
			const result = parseNaturalLanguageTime('July 23, 4pm', REF)
			expect(result).not.toBeNull()
			expect(result.type).toBe('datetime')
			expect(result.month).toBe(7)
			expect(result.day).toBe(23)
			expect(result.startHour).toBe(16)
			expect(result.startMinute).toBe(0)
		})

		it('parses "July 23 2026 4pm"', () => {
			const result = parseNaturalLanguageTime('July 23 2026 4pm', REF)
			expect(result.type).toBe('datetime')
			expect(result.year).toBe(2026)
			expect(result.month).toBe(7)
			expect(result.day).toBe(23)
			expect(result.startHour).toBe(16)
		})

		it('parses "14.08.2026 19:00"', () => {
			const result = parseNaturalLanguageTime('14.08.2026 19:00', REF)
			expect(result).not.toBeNull()
			expect(result.type).toBe('datetime')
			expect(result.year).toBe(2026)
			expect(result.month).toBe(8)
			expect(result.day).toBe(14)
			expect(result.startHour).toBe(19)
			expect(result.startMinute).toBe(0)
		})

		it('parses datetime embedded in a title — "Dentist July 23 4pm downtown"', () => {
			const result = parseNaturalLanguageTime('Dentist July 23 4pm downtown', REF)
			expect(result.type).toBe('datetime')
			expect(result.month).toBe(7)
			expect(result.day).toBe(23)
			expect(result.startHour).toBe(16)
		})

		it('parses European date + 12h time without colon "12.07.2026 9am"', () => {
			const result = parseNaturalLanguageTime('12.07.2026 9am', REF)
			expect(result).not.toBeNull()
			expect(result.type).toBe('datetime')
			expect(result.year).toBe(2026)
			expect(result.month).toBe(7)
			expect(result.day).toBe(12)
			expect(result.startHour).toBe(9)
			expect(result.startMinute).toBe(0)
		})

		it('parses European short year + 12h time "12.07.26 9am"', () => {
			const result = parseNaturalLanguageTime('12.07.26 9am', REF)
			expect(result.type).toBe('datetime')
			expect(result.month).toBe(7)
			expect(result.day).toBe(12)
			expect(result.startHour).toBe(9)
		})

		it('does not misread "12.07.2026" as December 7 when day > 12 is not possible', () => {
			// Regression: built-in parser would interpret 12.07 as month=12 day=7
			const result = parseNaturalLanguageTime('12.07.2026', REF)
			expect(result.type).toBe('date')
			expect(result.month).toBe(7)
			expect(result.day).toBe(12)
		})

		it('includes date and time in displayText', () => {
			const result = parseNaturalLanguageTime('July 23, 4pm', REF)
			expect(result.displayText).toContain('16:00')
		})

		it('provides matchedText and matchedIndex for "July 23, 4pm"', () => {
			const result = parseNaturalLanguageTime('Meeting July 23, 4pm', REF)
			expect(result.matchedIndex).toBe(8)
			expect(result.matchedText).toBe('July 23, 4pm')
		})

		it('strips datetime from title correctly', () => {
			const title = 'Dentist July 23, 4pm downtown'
			const result = parseNaturalLanguageTime(title, REF)
			const before = title.slice(0, result.matchedIndex)
			const after = title.slice(result.matchedIndex + result.matchedText.length)
			expect((before + after).replace(/\s+/g, ' ').trim()).toBe('Dentist downtown')
		})
	})

	describe('date-range detection', () => {
		it('parses "June 1st to June 3rd"', () => {
			const result = parseNaturalLanguageTime('June 1st to June 3rd', REF)
			expect(result).not.toBeNull()
			expect(result.type).toBe('date-range')
			expect(result.startMonth).toBe(6)
			expect(result.startDay).toBe(1)
			expect(result.endMonth).toBe(6)
			expect(result.endDay).toBe(3)
		})

		it('parses "June 1 to June 3"', () => {
			const result = parseNaturalLanguageTime('June 1 to June 3', REF)
			expect(result).not.toBeNull()
			expect(result.type).toBe('date-range')
			expect(result.startDay).toBe(1)
			expect(result.endDay).toBe(3)
		})

		it('parses "June 1st - June 3rd"', () => {
			const result = parseNaturalLanguageTime('June 1st - June 3rd', REF)
			expect(result).not.toBeNull()
			expect(result.type).toBe('date-range')
			expect(result.startDay).toBe(1)
			expect(result.endDay).toBe(3)
		})

		it('parses "June 1-3" (short form)', () => {
			const result = parseNaturalLanguageTime('June 1-3', REF)
			expect(result).not.toBeNull()
			expect(result.type).toBe('date-range')
			expect(result.startDay).toBe(1)
			expect(result.endDay).toBe(3)
		})

		it('includes both dates in displayText', () => {
			const result = parseNaturalLanguageTime('June 20 to June 25', REF)
			expect(result.displayText).toContain('20')
			expect(result.displayText).toContain('25')
		})

		it('provides matchedText and matchedIndex', () => {
			const result = parseNaturalLanguageTime('Conference June 1st to June 3rd downtown', REF)
			expect(result.matchedText).toBe('June 1st to June 3rd')
			expect(result.matchedIndex).toBe(11)
		})

		it('strips a date range from a title', () => {
			const result = parseNaturalLanguageTime('Conference June 1st to June 3rd', REF)
			const before = 'Conference June 1st to June 3rd'.slice(0, result.matchedIndex)
			const after = 'Conference June 1st to June 3rd'.slice(result.matchedIndex + result.matchedText.length)
			const stripped = (before + after).replace(/\s+/g, ' ').trim()
			expect(stripped).toBe('Conference')
		})
	})

	describe('relative date/time expressions', () => {
		it('parses "tomorrow" as an all-day date', () => {
			const result = parseNaturalLanguageTime('tomorrow', REF)
			expect(result).not.toBeNull()
			expect(result.type).toBe('date')
			expect(result.day).toBe(16)
			expect(result.month).toBe(6)
			expect(result.year).toBe(2026)
		})

		it('parses "in 3 days" as a date', () => {
			const result = parseNaturalLanguageTime('in 3 days', REF)
			expect(result).not.toBeNull()
			expect(result.type).toBe('date')
			expect(result.day).toBe(18)
			expect(result.month).toBe(6)
		})

		it('parses "next week" as a date', () => {
			const result = parseNaturalLanguageTime('next week', REF)
			expect(result).not.toBeNull()
			expect(result.type).toBe('date')
		})

		it('parses "next Monday" as a date', () => {
			const result = parseNaturalLanguageTime('next Monday', REF)
			expect(result).not.toBeNull()
			expect(result.type).toBe('date')
			expect(result.day).toBe(22)
			expect(result.month).toBe(6)
		})

		it('parses "this Friday" as a date', () => {
			const result = parseNaturalLanguageTime('this Friday', REF)
			expect(result).not.toBeNull()
			expect(result.type).toBe('date')
			expect(result.day).toBe(19)
			expect(result.month).toBe(6)
		})

		it('parses "tomorrow 3pm" as datetime', () => {
			const result = parseNaturalLanguageTime('tomorrow 3pm', REF)
			expect(result).not.toBeNull()
			expect(result.type).toBe('datetime')
			expect(result.day).toBe(16)
			expect(result.startHour).toBe(15)
		})

		it('parses "next Friday 14:00" as datetime (not time-only)', () => {
			const result = parseNaturalLanguageTime('next Friday 14:00', REF)
			expect(result).not.toBeNull()
			expect(result.type).toBe('datetime')
			expect(result.day).toBe(26)
			expect(result.startHour).toBe(14)
		})

		it('strips "tomorrow" from title', () => {
			const result = parseNaturalLanguageTime('tomorrow', REF)
			const before = 'tomorrow'.slice(0, result.matchedIndex)
			const after = 'tomorrow'.slice(result.matchedIndex + result.matchedText.length)
			expect((before + after).replace(/\s+/g, ' ').trim()).toBe('')
		})

		it('strips "next Monday" from a title', () => {
			const result = parseNaturalLanguageTime('Team lunch next Monday', REF)
			const before = 'Team lunch next Monday'.slice(0, result.matchedIndex)
			const after = 'Team lunch next Monday'.slice(result.matchedIndex + result.matchedText.length)
			expect((before + after).replace(/\s+/g, ' ').trim()).toBe('Team lunch')
		})
	})

	describe('multi-language support', () => {
		describe('German (de)', () => {
			it('parses "14 Uhr" as time-only', () => {
				const result = parseNaturalLanguageTime('14 Uhr', REF, 'de')
				expect(result).not.toBeNull()
				expect(result.type).toBe('time-only')
				expect(result.startHour).toBe(14)
			})

			it('parses "15. Juli" as date', () => {
				const result = parseNaturalLanguageTime('15. Juli', REF, 'de')
				expect(result).not.toBeNull()
				expect(result.type).toBe('date')
				expect(result.month).toBe(7)
				expect(result.day).toBe(15)
			})

			it('parses "20. Juni bis 22. Juni" as date-range', () => {
				const result = parseNaturalLanguageTime('20. Juni bis 22. Juni', REF, 'de')
				expect(result).not.toBeNull()
				expect(result.type).toBe('date-range')
				expect(result.startDay).toBe(20)
				expect(result.endDay).toBe(22)
			})

			it('parses European date "23.07.2026" via de locale', () => {
				const result = parseNaturalLanguageTime('23.07.2026', REF, 'de')
				expect(result).not.toBeNull()
				expect(result.type).toBe('date')
				expect(result.month).toBe(7)
				expect(result.day).toBe(23)
			})

			it('accepts regional code "de_DE"', () => {
				const result = parseNaturalLanguageTime('14 Uhr', REF, 'de_DE')
				expect(result).not.toBeNull()
				expect(result.type).toBe('time-only')
				expect(result.startHour).toBe(14)
			})
		})

		describe('French (fr)', () => {
			it('parses "14h30" as time-only', () => {
				const result = parseNaturalLanguageTime('14h30', REF, 'fr')
				expect(result).not.toBeNull()
				expect(result.type).toBe('time-only')
				expect(result.startHour).toBe(14)
				expect(result.startMinute).toBe(30)
			})

			it('parses "15 juillet" as date', () => {
				const result = parseNaturalLanguageTime('15 juillet', REF, 'fr')
				expect(result).not.toBeNull()
				expect(result.type).toBe('date')
				expect(result.month).toBe(7)
				expect(result.day).toBe(15)
			})
		})

		describe('Spanish (es)', () => {
			it('parses "15 de julio" as date', () => {
				const result = parseNaturalLanguageTime('15 de julio', REF, 'es')
				expect(result).not.toBeNull()
				expect(result.type).toBe('date')
				expect(result.month).toBe(7)
				expect(result.day).toBe(15)
			})
		})

		describe('Italian (it)', () => {
			it('parses "15 luglio" as date', () => {
				const result = parseNaturalLanguageTime('15 luglio', REF, 'it')
				expect(result).not.toBeNull()
				expect(result.type).toBe('date')
				expect(result.month).toBe(7)
				expect(result.day).toBe(15)
			})
		})

		describe('Dutch (nl)', () => {
			it('parses "15 juli" as date', () => {
				const result = parseNaturalLanguageTime('15 juli', REF, 'nl')
				expect(result).not.toBeNull()
				expect(result.type).toBe('date')
				expect(result.month).toBe(7)
				expect(result.day).toBe(15)
			})
		})

		describe('Russian (ru)', () => {
			it('parses "15 июля" as date', () => {
				const result = parseNaturalLanguageTime('15 июля', REF, 'ru')
				expect(result).not.toBeNull()
				expect(result.type).toBe('date')
				expect(result.month).toBe(7)
				expect(result.day).toBe(15)
			})
		})

		describe('Portuguese (pt)', () => {
			it('parses "15 julho" as date', () => {
				const result = parseNaturalLanguageTime('15 julho', REF, 'pt')
				expect(result).not.toBeNull()
				expect(result.type).toBe('date')
				expect(result.month).toBe(7)
				expect(result.day).toBe(15)
			})
		})

		describe('Swedish (sv)', () => {
			it('parses "15 juli" as date', () => {
				const result = parseNaturalLanguageTime('15 juli', REF, 'sv')
				expect(result).not.toBeNull()
				expect(result.type).toBe('date')
				expect(result.month).toBe(7)
				expect(result.day).toBe(15)
			})
		})

		describe('Chinese Simplified (zh_CN)', () => {
			it('parses "7月15日" as date', () => {
				const result = parseNaturalLanguageTime('7月15日', REF, 'zh_CN')
				expect(result).not.toBeNull()
				expect(result.type).toBe('date')
				expect(result.month).toBe(7)
				expect(result.day).toBe(15)
			})
		})

		describe('language fallback', () => {
			it('falls back to English for an unsupported language', () => {
				const result = parseNaturalLanguageTime('2pm', REF, 'ar')
				expect(result).not.toBeNull()
				expect(result.type).toBe('time-only')
				expect(result.startHour).toBe(14)
			})

			it('falls back to English when language is null', () => {
				const result = parseNaturalLanguageTime('2pm', REF, null)
				expect(result).not.toBeNull()
				expect(result.type).toBe('time-only')
			})
		})
	})

	describe('edge cases', () => {
		it('returns null when there is no recognisable pattern', () => {
			expect(parseNaturalLanguageTime('Quarterly review v2', REF)).toBeNull()
		})

		it('works without a reference date argument', () => {
			const result = parseNaturalLanguageTime('14:00')
			expect(result).not.toBeNull()
			expect(result.type).toBe('time-only')
			expect(result.startHour).toBe(14)
		})
	})
})
