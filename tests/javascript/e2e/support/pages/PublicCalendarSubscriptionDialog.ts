/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Locator, Page } from '@playwright/test'

import { expect } from '@playwright/test'

/**
 * Encapsulate common interactions with the public calendar subscription dialog.
 */
export class PublicCalendarSubscriptionDialog {
	locator: Locator

	constructor(private readonly page: Page) {
		this.locator = page.getByRole('dialog', { name: 'Public calendar subscriptions' })
	}

	async close() {
		await this.locator.getByLabel('Close').click()
	}

	async subscribeToCalendar(calendarName: string) {
		await this.locator.getByText(calendarName + 'Subscribe').getByRole('button', { name: 'Subscribe' }).click()
		await this.expectSubscribed(calendarName)
	}

	async expectSubscribed(calendarName: string) {
		await expect(this.locator.getByText(calendarName + 'Subscribed')).toBeVisible()
	}
}
