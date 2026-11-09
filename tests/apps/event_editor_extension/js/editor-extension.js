/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Loaded through BeforeEventEditorLoadedEvent.
// Registers an event editor extension adding a field, which the E2E tests look for in the editor.

/**
 * Register an event editor extension.
 *
 * Does the same as `registerEventEditorExtension` of `@nextcloud/calendar`,
 * which this script cannot import, as the test app has no build step.
 *
 * @param {object} extension The extension to register
 */
function registerEventEditorExtension(extension) {
	globalThis._nc_calendar_scope ??= {}
	const scope = (globalThis._nc_calendar_scope.v0_0 ??= {})
	scope.eventEditorExtension ??= new Map()
	scope.extensionRegistry ??= new EventTarget()

	scope.eventEditorExtension.set(JSON.stringify([extension.app, extension.name]), extension)
	scope.extensionRegistry.dispatchEvent(new CustomEvent('register:eventEditorExtension', { detail: extension }))
}

registerEventEditorExtension({
	app: 'event_editor_extension',
	name: 'field',
	setup({ editor }) {
		// The borders and the cross spanning the icon show in screenshots how the editor lays out the icon and the field.
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
