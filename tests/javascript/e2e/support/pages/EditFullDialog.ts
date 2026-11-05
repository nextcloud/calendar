/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Locator, Page } from '@playwright/test'

import { FreeBusyDialog } from './FreeBusyDialog.ts'

/**
 * Encapsulate interactions with the detailed event editor dialog.
 */
export class EditFullDialog {
	locator: Locator

	constructor(private readonly page: Page) {
		this.locator = page.getByRole('dialog', { name: 'Detailed event editor' })
	}

	async openFreeBusyDialog() {
		await this.locator.getByRole('button', { name: 'Find a time' }).click()
		return new FreeBusyDialog(this.page)
	}
}
