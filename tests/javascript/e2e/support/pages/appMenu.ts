/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Page } from '@playwright/test'

import { EditFullDialog } from './EditFullDialog.ts'

/**
 * Major version of Nextcloud from which on the app menu offers to create events,
 * see AppMenuActionListener::APP_MENU_ACTION_VERSION.
 */
const APP_MENU_ACTION_VERSION = 35

/**
 * Whether the server offers to create events from the app menu. Skip tests using the app menu otherwise.
 *
 * @param serverMajorVersion Major version of the server, see the `serverMajorVersion` fixture
 */
export function supportsCreatingEventsFromAppMenu(serverMajorVersion: number): boolean {
	return serverMajorVersion >= APP_MENU_ACTION_VERSION
}

/**
 * Show a page outside of the Calendar app, where the app menu is the way to create events.
 * Which page does not matter, it is the settings of the user as every user can open them.
 * Requires a logged in user.
 *
 * @param page The page to navigate
 */
export async function gotoPageOutsideCalendar(page: Page) {
	await page.goto('./index.php/settings/user')
}

/**
 * Create a new event with the action in the app menu, which opens the full editor.
 *
 * @param page The page showing a page outside of the Calendar app, see `gotoPageOutsideCalendar`
 */
export async function createEventFromAppMenu(page: Page): Promise<EditFullDialog> {
	await page.getByRole('button', { name: 'Open apps menu', exact: true }).click()
	await page.getByRole('group', { name: 'Actions' }).getByRole('menuitem', { name: 'Event' }).click()
	return new EditFullDialog(page)
}
