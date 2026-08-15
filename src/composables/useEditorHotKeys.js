/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useHotKey } from '@nextcloud/vue/composables/useHotKey'
import { getCurrentInstance } from 'vue'

/**
 * Registers the editor keyboard shortcuts (Escape / Ctrl+Enter / Ctrl+Delete / Ctrl+D,
 * using Cmd instead of Ctrl on MacOS) shared by EditFull and EditSimple.
 *
 * Must be called synchronously from `setup()`: it resolves the component instance once,
 * up front, and closes over it. Calling `getCurrentInstance()` again inside the hotkey
 * callbacks themselves would return `null`, since those callbacks fire later on a
 * `keydown` event, outside of Vue's active-instance context.
 */
export function useEditorHotKeys() {
	const { proxy } = getCurrentInstance()

	useHotKey('Escape', () => {
		proxy.cancel(false)
	}, { allowInModal: true })

	useHotKey('Enter', () => {
		if (!proxy.isReadOnly && !proxy.canCreateRecurrenceException) {
			proxy.saveAndLeave(false)
		}
	}, { ctrl: true, allowInModal: true })

	useHotKey('Delete', () => {
		if (proxy.canDelete && !proxy.canCreateRecurrenceException) {
			proxy.deleteAndLeave(false)
		}
	}, { ctrl: true, allowInModal: true })

	useHotKey('d', () => {
		if (!proxy.isNew && !proxy.isReadOnly && !proxy.canCreateRecurrenceException) {
			proxy.duplicateEvent()
		}
	}, { ctrl: true, prevent: true, allowInModal: true })
}
