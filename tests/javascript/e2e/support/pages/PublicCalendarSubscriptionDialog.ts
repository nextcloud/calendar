/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { type Locator, type Page, expect } from '@playwright/test'

/**
 * Encapsulate common interactions with the public calendar subscription dialog.
 */
export class PublicCalendarSubscriptionDialog {
	dialog: Locator

	constructor(private readonly page: Page) {
		this.dialog = page.getByRole('dialog', { name: 'Public calendar subscriptions' })
	}

	async open() {
		await this.page
			.getByText('My calendarsAdd new')
			.getByRole('button', { name: 'Actions' })
			.click()

		await this.page.getByRole('menuitem', { name: 'Add custom public calendar' }).click()

		await expect(this.dialog).toBeVisible()
	}

	async close() {
		await this.dialog.getByLabel('Close').click()
	}

	async subscribeToCalendar(calendarName: string) {
		await this.dialog.getByText(calendarName + 'Subscribe').getByRole('button', { name: 'Subscribe' }).click()
		await this.expectSubscribed(calendarName)
	}

	async expectSubscribed(calendarName: string) {
		await expect(this.dialog.getByText(calendarName + 'Subscribed')).toBeVisible()
	}
}
