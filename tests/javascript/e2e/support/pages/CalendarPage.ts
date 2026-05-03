/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Locator, Page } from '@playwright/test'

import { PublicCalendarSubscriptionDialog } from './PublicCalendarSubscriptionDialog.ts'

/**
 * Encapsulate common interactions with the calendar page.
 */
export class CalendarPage {
	calendarNavigation: Locator
	publicCalendarSubscriptionDialog: PublicCalendarSubscriptionDialog

	constructor(private readonly page: Page) {
		this.publicCalendarSubscriptionDialog = new PublicCalendarSubscriptionDialog(page)
		this.calendarNavigation = page.getByRole('navigation', { name: 'Calendar navigation' })
	}

	async goto() {
		await this.page.goto('./index.php/apps/calendar')
	}

	async expectCalendarExists(calendarName: string) {
		return this.calendarNavigation.getByRole('link', { name: calendarName }).isVisible()
	}
}
