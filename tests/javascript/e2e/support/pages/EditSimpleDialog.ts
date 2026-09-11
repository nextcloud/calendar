/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Locator, Page } from '@playwright/test'

import { EditFullDialog } from './EditFullDialog.ts'

/**
 * Encapsulate interactions with the simple event editor dialog.
 */
export class EditSimpleDialog {
	locator: Locator

	constructor(private readonly page: Page) {
		this.locator = page.getByRole('dialog', { name: 'Simple event editor' })
	}

	async addAttende(name: string) {
		const attendeesInput = this.locator.getByRole('combobox', { name: 'Search for attendees' })
		await attendeesInput.fill(name)
		await this.page.getByRole('option', { name }).click()
	}

	async openDetailedEditor() {
		await this.page.getByRole('button', { name: 'More Details' }).click()
		return new EditFullDialog(this.page)
	}

	async fillTitle(title: string) {
		await this.locator.getByRole('textbox', { name: 'Title' }).click()
		await this.locator.getByRole('textbox', { name: 'Title' }).fill(title)
	}

	async save() {
		await this.locator.getByRole('button', { name: 'Save' }).click()
	}
}
