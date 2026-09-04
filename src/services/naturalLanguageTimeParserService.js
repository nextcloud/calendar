/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as chrono from 'chrono-node'

// Extend the casual English parser with the European DD.MM.YY(YY) date format.
const europeanDateParser = {
	pattern: () => /\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/,
	extract(_context, match) {
		const day = parseInt(match[1], 10)
		const month = parseInt(match[2], 10)
		let year = parseInt(match[3], 10)
		if (year < 100) {
			year = year < 50 ? 2000 + year : 1900 + year
		}
		if (day < 1 || day > 31 || month < 1 || month > 12) {
			return null
		}
		return { day, month, year }
	},
}

/**
 * @param {object} base chrono locale object
 * @return {object} chrono instance with the European date parser prepended
 */
function buildInstance(base) {
	const instance = base.casual.clone()
	// Prepend so the European DD.MM.YY parser takes priority over chrono's built-in
	// numeric date parser, which would otherwise misread e.g. "12.07.2026" as December 7.
	instance.parsers.unshift(europeanDateParser)
	return instance
}

// One pre-built instance per supported locale, created once at module load.
const chronoInstances = {
	en: buildInstance(chrono.en),
	de: buildInstance(chrono.de),
	fr: buildInstance(chrono.fr),
	es: buildInstance(chrono.es),
	it: buildInstance(chrono.it),
	nl: buildInstance(chrono.nl),
	pt: buildInstance(chrono.pt),
	ru: buildInstance(chrono.ru),
	uk: buildInstance(chrono.uk),
	sv: buildInstance(chrono.sv),
	fi: buildInstance(chrono.fi),
	ja: buildInstance(chrono.ja),
	vi: buildInstance(chrono.vi),
	'zh-hans': buildInstance(chrono.zh.hans),
	'zh-hant': buildInstance(chrono.zh.hant),
}

/**
 * Map a Nextcloud locale code (e.g. "de_DE", "zh_CN") to a chrono instance.
 *
 * @param {string|null} language Nextcloud language string from getLanguage()
 * @return {object} chrono instance
 */
function getChronoInstance(language) {
	if (!language) {
		return chronoInstances.en
	}
	const lang = language.toLowerCase().replace(/_/g, '-')
	// Chinese variants: Simplified (CN/SG/default) vs Traditional (TW/HK/MO)
	if (lang === 'zh' || lang === 'zh-cn' || lang === 'zh-sg') {
		return chronoInstances['zh-hans']
	}
	if (lang === 'zh-tw' || lang === 'zh-hk' || lang === 'zh-mo') {
		return chronoInstances['zh-hant']
	}
	// Try full locale, then base language, then fall back to English
	const base = lang.split('-')[0]
	return chronoInstances[lang] ?? chronoInstances[base] ?? chronoInstances.en
}

/**
 * @param {number} n number to pad
 * @return {string} zero-padded two-digit string
 */
function pad(n) {
	return String(n).padStart(2, '0')
}

/**
 * @param {number} hour hour (0-23)
 * @param {number} minute minute (0-59)
 * @return {string} formatted time string "HH:MM"
 */
function formatTimeParts(hour, minute) {
	return `${pad(hour)}:${pad(minute)}`
}

/**
 * Parse natural language time expressions from an event title.
 *
 * Recognises clock times (2pm, 14:00), time ranges (10:00–14:00, 10am to 2pm),
 * dates (23.07.26, July 23, 07/23/2026) and the literal "all day".
 *
 * @param {string|null} text Event title to examine
 * @param {Date|null} referenceDate Reference date for forward-date resolution (defaults to now)
 * @param {string|null} language Nextcloud language code, e.g. "de" or "zh_CN" (defaults to English)
 * @return {object|null} Parsed suggestion or null when nothing was recognised
 */
export function parseNaturalLanguageTime(text, referenceDate = null, language = null) {
	if (!text || text.trim() === '') {
		return null
	}

	// "all day" / "all-day" — chrono-node does not handle this phrase
	const allDayMatch = text.match(/\ball[\s-]?day\b/i)
	if (allDayMatch) {
		return {
			type: 'all-day',
			displayText: 'All day',
			matchedText: allDayMatch[0],
			matchedIndex: allDayMatch.index,
		}
	}

	const ref = referenceDate ?? new Date()
	const results = getChronoInstance(language).parse(text, ref, { forwardDate: true })

	if (!results.length) {
		return null
	}

	const result = results[0]
	const start = result.start
	const end = result.end

	const startHourCertain = start.isCertain('hour')
	// weekday covers relative expressions like "next Monday" / "this Friday"
	const startDateCertain = start.isCertain('day') || start.isCertain('month') || start.isCertain('weekday')

	if (end && end.isCertain('hour')) {
		// Time range: "10:00 – 14:00", "10am to 2pm"
		const sh = start.get('hour')
		const sm = start.get('minute') ?? 0
		const eh = end.get('hour')
		const em = end.get('minute') ?? 0
		return {
			type: 'time-range',
			startHour: sh,
			startMinute: sm,
			endHour: eh,
			endMinute: em,
			displayText: `${formatTimeParts(sh, sm)} – ${formatTimeParts(eh, em)}`,
			matchedText: result.text,
			matchedIndex: result.index,
		}
	}

	if (startHourCertain && !startDateCertain) {
		// Time only: "2pm", "14:00"
		const sh = start.get('hour')
		const sm = start.get('minute') ?? 0
		return {
			type: 'time-only',
			startHour: sh,
			startMinute: sm,
			displayText: formatTimeParts(sh, sm),
			matchedText: result.text,
			matchedIndex: result.index,
		}
	}

	const endDateCertain = end && (end.isCertain('day') || end.isCertain('month'))

	if (startDateCertain && endDateCertain && !startHourCertain) {
		// Date range: "June 1 to June 3", "June 1st - June 3rd"
		const sy = start.get('year')
		const smo = start.get('month')
		const sd = start.get('day')
		const ey = end.get('year')
		const emo = end.get('month')
		const ed = end.get('day')
		const fmt = { day: 'numeric', month: 'long', year: 'numeric' }
		return {
			type: 'date-range',
			startYear: sy,
			startMonth: smo,
			startDay: sd,
			endYear: ey,
			endMonth: emo,
			endDay: ed,
			displayText: `${new Date(sy, smo - 1, sd).toLocaleDateString(undefined, fmt)} – ${new Date(ey, emo - 1, ed).toLocaleDateString(undefined, fmt)}`,
			matchedText: result.text,
			matchedIndex: result.index,
		}
	}

	if (startDateCertain && !startHourCertain) {
		// Date only: "July 23", "23.07.26", "07/23/2026"
		const y = start.get('year')
		const mo = start.get('month')
		const d = start.get('day')
		return {
			type: 'date',
			year: y,
			month: mo,
			day: d,
			displayText: new Date(y, mo - 1, d).toLocaleDateString(undefined, {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			}),
			matchedText: result.text,
			matchedIndex: result.index,
		}
	}

	if (startDateCertain && startHourCertain) {
		// Date + time: "July 23, 4pm", "14.08.2026 19:00"
		const y = start.get('year')
		const mo = start.get('month')
		const d = start.get('day')
		const sh = start.get('hour')
		const sm = start.get('minute') ?? 0
		return {
			type: 'datetime',
			year: y,
			month: mo,
			day: d,
			startHour: sh,
			startMinute: sm,
			displayText: `${new Date(y, mo - 1, d).toLocaleDateString(undefined, {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			})} ${formatTimeParts(sh, sm)}`,
			matchedText: result.text,
			matchedIndex: result.index,
		}
	}

	return null
}
