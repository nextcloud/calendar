/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { type Locator, type Page } from '@playwright/test'
import { FreeBusyDialog } from './FreeBusyDialog'

/**
 * Encapsulate interactions with the detailed event editor dialog.
 */
export class EditFullDialog {
	locator: Locator

	constructor(private readonly page: Page) {
		this.locator = page.getByRole('dialog', { name: 'Detailed event editor' })
	}

	async addAttende(name: string) {
		const attendeesInput = this.locator.getByRole('combobox', { name: 'Search for attendees' })
		await attendeesInput.fill(name)
		await this.page.getByRole('option', { name: name }).click()
	}

	async openFreeBusyDialog() {
		await this.locator.getByRole('button', { name: 'Find a time' }).click()
		return new FreeBusyDialog(this.page)
	}
}