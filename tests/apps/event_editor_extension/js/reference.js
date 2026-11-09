/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Renders the reference provided by ReferenceController with the widget registered for it,
// like apps do with `NcReferenceWidget` of `@nextcloud/vue`, which this script cannot import,
// as the test app has no build step.

/**
 * Read the initial state of this app, like `loadState` of `@nextcloud/initial-state`.
 *
 * @param {string} key The key of the state
 * @return {object} The state
 */
function loadState(key) {
	const input = document.getElementById(`initial-state-event_editor_extension-${key}`)
	return JSON.parse(atob(input.value))
}

/**
 * Wait until a widget is registered with `registerWidget` of `@nextcloud/vue`.
 *
 * @param {string} id The id of the widget, i.e. the type of the rich object it renders
 * @return {Promise<object>} The registered widget
 */
async function waitForWidget(id) {
	while (!window._vue_richtext_widgets?.[id]) {
		await new Promise((resolve) => setTimeout(resolve, 50))
	}
	return window._vue_richtext_widgets[id]
}

/**
 * Render the reference into the element of the template.
 */
async function renderReference() {
	const reference = loadState('reference')
	const widget = await waitForWidget(reference.richObjectType)
	widget.callback(document.getElementById('event-editor-extension-reference'), {
		richObjectType: reference.richObjectType,
		richObject: reference.richObject,
		accessible: reference.accessible,
		interactive: true,
	})
}

renderReference()
