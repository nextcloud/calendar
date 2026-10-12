/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { CalendarInterface } from '@/types/calendar.ts'

const DECK_CALENDAR_URL_FRAGMENT = 'app-generated--deck--board'

/**
 * Check if a calendar belongs to the Deck app.
 *
 * @param calendar - The calendar to check
 * @return True if the calendar belongs to the Deck app
 */
export function isDeckCalendar(calendar: Pick<CalendarInterface, 'url'>): boolean {
	return calendar.url.includes(DECK_CALENDAR_URL_FRAGMENT)
}
