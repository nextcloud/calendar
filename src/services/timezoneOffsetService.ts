/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Get the offset in minutes between a date's timezone and the given timezone
 *
 * @param proposalDate The date to compute the offset for
 * @param timezoneId The timezone id to compute the offset against
 * @return The offset in minutes
 */
export function getTimezoneOffset(proposalDate: Date, timezoneId: string): number {
	let timezoneOffset = 0

	try {
		const dtf = new Intl.DateTimeFormat('en-US', {
			timeZone: timezoneId,
			hour12: false,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		})

		const parts = dtf.formatToParts(proposalDate)

		const values: Record<string, string> = {}
		parts.forEach(({ type, value }) => {
			if (type !== 'literal') {
				values[type] = value
			}
		})

		const asUTC = Date.UTC(
			Number(values.year),
			Number(values.month) - 1,
			Number(values.day),
			Number(values.hour),
			Number(values.minute),
			Number(values.second),
		)

		timezoneOffset = Math.round((asUTC - proposalDate.getTime()) / 60000)
	} catch {
		timezoneOffset = 0
	}

	return timezoneOffset
}
