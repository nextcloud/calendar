/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Default } from './ExtensionsCustomFields.story'

import { expect, test } from '@playwright/test'

const SIMPLE_EDITOR = 'Simple event editor'
const FULL_EDITOR = 'Detailed event editor'

const cases = [
	{ view: 'simple', isReadOnly: false, editorName: SIMPLE_EDITOR },
	{ view: 'simple', isReadOnly: true, editorName: SIMPLE_EDITOR },
	// The preview only shows events, so it is always read-only.
	{ view: 'preview', isReadOnly: true, editorName: SIMPLE_EDITOR },
	{ view: 'full', isReadOnly: false, editorName: FULL_EDITOR },
	{ view: 'full', isReadOnly: true, editorName: FULL_EDITOR },
] as const

for (const { view, isReadOnly, editorName } of cases) {
	test(`renders in the ${view} view ${isReadOnly ? 'read-only' : 'editable'}`, async ({ mount, page }) => {
		await mount<typeof Default>('components/Editor/ExtensionsCustomFields/Default', {
			view,
			isReadOnly,
		})

		// The editors render outside the story: the popover is appended to the body and the full editor is a modal.
		const editor = page.getByRole('dialog', { name: editorName })
		await expect(editor.getByText('Field of the event editor extension')).toBeVisible()
		await expect(editor).toHaveScreenshot()
	})
}
