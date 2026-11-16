/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Calendar } from '../utils/caldav.ts'

import { CalendarGridPage } from './CalendarGridPage.ts'

/**
 * A page of the E2E test app (see tests/apps/event_editor_extension) rendering the reference to a calendar,
 * like e.g. Talk does for a link to a calendar in a message.
 */
export class ReferencePage extends CalendarGridPage {
	/**
	 * Render the reference to a public calendar.
	 *
	 * @param token Token of the public calendar, see `Calendar.publish`
	 */
	async gotoPublicCalendar(token: string) {
		await this.page.goto(`./index.php/apps/event_editor_extension/reference/${token}`)
	}

	/**
	 * Render the reference to a calendar by its CalDAV URL. Requires a user who can access the calendar to be logged in.
	 *
	 * @param calendar The calendar
	 */
	async gotoCalendar(calendar: Calendar) {
		await this.page.goto(`./index.php/apps/event_editor_extension/reference/calendars/${calendar.owner.userId}/${calendar.uri}`)
	}
}
