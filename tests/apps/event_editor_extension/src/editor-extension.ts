/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Loaded through BeforeEventEditorLoadedEvent.
// Registers an event editor extension adding a field, which the E2E tests look for in the editor.

import { registerEventEditorExtension } from '@nextcloud/calendar-integration'

registerEventEditorExtension({
	app: 'event_editor_extension',
	name: 'field',
	setup({ editor }) {
		// The border shows in screenshots how the editor lays out the field.
		const field = document.createElement('div')
		field.textContent = 'Field of the event editor extension'
		field.style.border = '1px solid blue'

		editor.addCustomField({ element: field })
	},
})
