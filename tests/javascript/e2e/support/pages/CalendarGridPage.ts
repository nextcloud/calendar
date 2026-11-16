/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Page } from '@playwright/test'

import { EditFullDialog } from './EditFullDialog.ts'
import { EditSimpleDialog } from './EditSimpleDialog.ts'

/**
 * A page showing events on a calendar grid, e.g. the calendar app or a public calendar.
 */
export class CalendarGridPage {
	constructor(protected readonly page: Page) {}

	/**
	 * Open an event shown on the grid in the popover, e.g. on the calendar page or in references.
	 *
	 * @param title The title of the event
	 */
	async openEventInPopover(title: string): Promise<EditSimpleDialog> {
		await this.clickEvent(title)
		return new EditSimpleDialog(this.page)
	}

	/**
	 * Open an event shown on the grid in the full editor,
	 * e.g. on public calendar pages or with the simplified editor disabled.
	 *
	 * @param title The title of the event
	 */
	async openEventInFullEditor(title: string): Promise<EditFullDialog> {
		await this.clickEvent(title)
		return new EditFullDialog(this.page)
	}

	private async clickEvent(title: string) {
		await this.page.locator('.fc-event').filter({ hasText: title }).click()
	}
}
