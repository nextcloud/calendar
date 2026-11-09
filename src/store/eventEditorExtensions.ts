/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IEventEditorExtension } from '@nextcloud/calendar'

import {
	getEventEditorExtensions,
	onEventEditorExtensionRegistered,
	onEventEditorExtensionUnregistered,
} from '@nextcloud/calendar'
import { defineStore } from 'pinia'
import { onScopeDispose, shallowRef } from 'vue'

/**
 * Keeps track of the event editor extensions registered with `@nextcloud/calendar`.
 */
export default defineStore('eventEditorExtensions', () => {
	// The extensions are owned by other apps, so they are kept raw instead of deeply reactive.
	const extensions = shallowRef<readonly IEventEditorExtension[]>([])

	/**
	 * Read the registered extensions again from `@nextcloud/calendar`,
	 * which keeps them in registration order.
	 */
	function refresh(): void {
		extensions.value = getEventEditorExtensions()
	}

	const removeRegisteredListener = onEventEditorExtensionRegistered(refresh)
	const removeUnregisteredListener = onEventEditorExtensionUnregistered(refresh)
	onScopeDispose(() => {
		removeRegisteredListener()
		removeUnregisteredListener()
	})

	refresh()

	return {
		extensions,
	}
})
