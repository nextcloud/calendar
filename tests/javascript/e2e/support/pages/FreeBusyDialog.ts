/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Locator, Page } from '@playwright/test'

/**
 * Encapsulate interactions with the free-busy dialog.
 */
export class FreeBusyDialog {
	locator: Locator

	constructor(private readonly page: Page) {
		this.locator = page.getByRole('dialog', { name: 'Availability of attendees, resources and rooms' })
	}

	async addAttende(name: string) {
		const attendeesInput = this.locator.getByRole('combobox', { name: 'Search for attendees' })
		await attendeesInput.fill(name)
		await this.page.getByRole('option', { name }).click()
	}

	async removeUser(name: string) {
		this.locator.locator('.option').filter({ hasText: name }).getByRole('button', { name: 'Delete' }).click()
	}
}
