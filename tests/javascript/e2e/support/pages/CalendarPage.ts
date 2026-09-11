/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Locator, Page } from '@playwright/test'

import { EditSimpleDialog } from './EditSimpleDialog.ts'
import { PublicCalendarSubscriptionDialog } from './PublicCalendarSubscriptionDialog.ts'

/**
 * Encapsulate common interactions with the calendar page.
 */
export class CalendarPage {
	calendarNavigation: Locator

	constructor(private readonly page: Page) {
		this.calendarNavigation = page.getByRole('navigation', { name: 'Calendar navigation' })
	}

	async goto() {
		await this.page.goto('./index.php/apps/calendar')
	}

	async expectCalendarExists(calendarName: string) {
		return this.calendarNavigation.getByRole('link', { name: calendarName }).isVisible()
	}

	async openPublicCalendarSubscriptionDialog() {
		await this.page
			.getByText('My calendarsAdd new')
			.getByRole('button', { name: 'Actions' })
			.click()
		await this.page.getByRole('menuitem', { name: 'Add custom public calendar' }).click()

		return new PublicCalendarSubscriptionDialog(this.page)
	}

	async createNewEvent() {
		await this.page.getByRole('button', { name: 'Create new event' }).click()

		// Wait for autofocus (`v-focus`) to complete before continuing with any further actions.
		// Focus changing suddenly in between other actions can break tests.
		await this.page.getByRole('textbox', { name: 'Title' })
			.and(this.page.locator(':focus'))
			.waitFor({ state: 'attached' })

		return new EditSimpleDialog(this.page)
	}
}
