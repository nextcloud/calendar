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

	constructor(page: Page) {
		this.locator = page.getByRole('dialog', { name: 'Availability of attendees, resources and rooms' })
	}

	async removeUser(name: string) {
		await this.locator.locator('.option').filter({ hasText: name }).getByRole('button', { name: 'Delete' }).click()
	}
}
