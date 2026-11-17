/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Provides what the server sets up in the page, which some modules of the app rely on already when they are loaded.
// Imported by the gallery before it loads any story.

/**
 * Provide an initial state like `IInitialState::provideInitialState` of the server.
 *
 * @param app The app providing the state
 * @param key The key of the state
 * @param value The state
 */
function provideInitialState(app: string, key: string, value: unknown): void {
	const id = `initial-state-${app}-${key}`
	if (document.getElementById(id)) {
		return
	}
	const input = document.createElement('input')
	input.type = 'hidden'
	input.id = id
	input.value = btoa(JSON.stringify(value))
	document.body.appendChild(input)
}

provideInitialState('core', 'capabilities', {})

Object.assign(window, {
	// The newest version of the server the app supports, see `appinfo/info.xml`.
	OC: { config: { version: '36.0.0.0' } },
})
