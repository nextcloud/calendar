/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Loaded through BeforeEventEditorLoadedEvent.
// Registers an event editor extension adding a field, which the E2E tests look for in the editor.

import { registerEventEditorExtension } from '@nextcloud/calendar'

registerEventEditorExtension({
	app: 'event_editor_extension',
	name: 'field',
	setup({ editor }) {
		// The borders and the cross spanning the icon show in screenshots how the editor lays out the icon and the field.
		// The icon is smaller than the space the editor reserves for it (20x20) to show that the editor centers it.
		const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		icon.setAttribute('viewBox', '0 0 20 20')
		icon.setAttribute('width', '20')
		icon.setAttribute('height', '20')
		icon.innerHTML = '<path d="M0 0L20 20M20 0L0 20" stroke="red" stroke-width="1" />'
		icon.style.boxSizing = 'border-box'
		icon.style.border = '1px solid blue'

		const field = document.createElement('div')
		field.textContent = 'Field of the event editor extension'
		field.style.border = '1px solid blue'

		editor.addField({ icon, field })
	},
})
