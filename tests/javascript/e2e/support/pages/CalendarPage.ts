/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Locator, Page } from '@playwright/test'

import { expect } from '@playwright/test'
import { CalendarGridPage } from './CalendarGridPage.ts'
import { EditSimpleDialog } from './EditSimpleDialog.ts'
import { PublicCalendarSubscriptionDialog } from './PublicCalendarSubscriptionDialog.ts'

/**
 * Encapsulate common interactions with the calendar page.
 */
export class CalendarPage extends CalendarGridPage {
	calendarNavigation: Locator
	buttonNewEvent: Locator

	constructor(page: Page) {
		super(page)
		this.calendarNavigation = page.getByRole('navigation', { name: 'Calendar navigation' })
		this.buttonNewEvent = page.getByRole('button', { name: 'Create new event' })
	}

	async goto() {
		await this.page.goto('./index.php/apps/calendar')
	}

	/**
	 * Show the events of a single day, e.g. to open a specific occurrence of a recurring event.
	 *
	 * @param date The day to show, in UTC
	 */
	async gotoDay(date: Date) {
		await this.page.goto(`./index.php/apps/calendar/timeGridDay/${date.toISOString().slice(0, 10)}`)
	}

	/**
	 * Show a meeting proposal, which the calendar page shows in a modal.
	 *
	 * @param proposalId Id of the proposal
	 */
	async gotoProposal(proposalId: string) {
		await this.page.goto(`./index.php/apps/calendar/proposal/view/${proposalId}`)
	}

	async expectCalendarExists(calendarName: string) {
		await expect(this.calendarNavigation.getByRole('link', { name: calendarName })).toBeVisible()
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
		await this.buttonNewEvent.click()

		// Wait for autofocus (`v-focus`) to complete before continuing with any further actions.
		// Focus changing suddenly in between other actions can break tests.
		await this.page.getByRole('textbox', { name: 'Title' })
			.and(this.page.locator(':focus'))
			.waitFor({ state: 'attached' })

		return new EditSimpleDialog(this.page)
	}
}
