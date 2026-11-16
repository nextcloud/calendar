/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Locator, Page } from '@playwright/test'

import { expect } from '@playwright/test'
import { EditFullDialog } from './EditFullDialog.ts'

/**
 * Encapsulate interactions with the simple event editor dialog.
 */
export class EditSimpleDialog {
	locator: Locator

	constructor(private readonly page: Page) {
		this.locator = page.getByRole('dialog', { name: 'Simple event editor' })
	}

	async addAttendee(name: string) {
		const attendeesInput = this.locator.getByRole('combobox', { name: 'Search for attendees' })
		await attendeesInput.fill(name)
		await this.page.getByRole('option', { name }).click()
	}

	async openDetailedEditor() {
		await this.locator.getByRole('button', { name: 'More Details' }).click()
		return new EditFullDialog(this.page)
	}

	async fillTitle(title: string) {
		await this.locator.getByRole('textbox', { name: 'Title' }).click()
		await this.locator.getByRole('textbox', { name: 'Title' }).fill(title)
	}

	async save() {
		await this.locator.getByRole('button', { name: 'Save' }).click()
	}

	/**
	 * Switch from viewing to editing an existing event.
	 */
	async edit() {
		await this.locator.getByRole('button', { name: 'Edit', exact: true }).click()
	}

	/**
	 * Save the changes to an existing event, and wait until they are saved on the server.
	 *
	 * @param scope For an occurrence of a recurring event, which occurrences to update.
	 * The editor shows a button for the scope if it is the only one possible, e.g. `entire series` for the first occurrence,
	 * and a menu to pick it otherwise.
	 */
	async update(scope?: UpdateScope) {
		await this.clickUpdate(scope)
		// The editor disables the button while saving, already from the click that starts saving (see `EditorMixin.save`).
		await expect(this.locator.getByRole('button', { name: 'More details', exact: true })).toBeEnabled()
	}

	/**
	 * Click the button or menu item to update the event with the scope.
	 *
	 * @param scope See `update`
	 */
	private async clickUpdate(scope?: UpdateScope) {
		const updateButton = this.locator.getByRole('button', { name: 'Update', exact: true })
		if (scope === undefined) {
			await updateButton.click()
			return
		}

		const scopeButton = this.locator.getByRole('button', { name: `Update ${scope}`, exact: true })
		await expect(scopeButton.or(updateButton)).toBeVisible()
		if (await scopeButton.isVisible()) {
			await scopeButton.click()
			return
		}
		await updateButton.click()
		await this.page.getByRole('menuitem', { name: `Update ${scope}`, exact: true }).click()
	}
}

/**
 * Which occurrences of a recurring event to update.
 */
export type UpdateScope = 'entire series' | 'this and future occurrences' | 'this occurrence'
