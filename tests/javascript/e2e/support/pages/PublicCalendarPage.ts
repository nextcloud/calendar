/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { CalendarGridPage } from './CalendarGridPage.ts'

/**
 * The page of a public calendar, which anyone with the link can view.
 */
export class PublicCalendarPage extends CalendarGridPage {
	/**
	 * @param token Token of the public calendar, see `Calendar.publish`
	 */
	async goto(token: string) {
		await this.page.goto(`./index.php/apps/calendar/p/${token}`)
	}

	/**
	 * Show the public calendar like when it is embedded into another website.
	 *
	 * @param token Token of the public calendar, see `Calendar.publish`
	 */
	async gotoEmbedded(token: string) {
		await this.page.goto(`./index.php/apps/calendar/embed/${token}`)
	}
}
