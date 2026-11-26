/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { EventEditorExtension } from '@nextcloud/calendar-integration'

import {
	getEventEditorExtensions,
	onEventEditorExtensionRegistered,
	onEventEditorExtensionUnregistered,
} from '@nextcloud/calendar-integration'
import { defineStore } from 'pinia'
import { onScopeDispose, shallowRef } from 'vue'

/**
 * Keeps track of the event editor extensions registered with `@nextcloud/calendar-integration`.
 */
export default defineStore('eventEditorExtensions', () => {
	// The extensions are owned by other apps, so they are kept raw instead of deeply reactive.
	const extensions = shallowRef<readonly EventEditorExtension[]>([])

	/**
	 * Read the registered extensions again which keeps them in registration order.
	 */
	function refresh(): void {
		extensions.value = getEventEditorExtensions().extensions
	}

	const registeredSubscription = onEventEditorExtensionRegistered({ callback: refresh })
	const unregisteredSubscription = onEventEditorExtensionUnregistered({ callback: refresh })
	onScopeDispose(() => {
		registeredSubscription.unsubscribe()
		unregisteredSubscription.unsubscribe()
	})

	refresh()

	return {
		extensions,
	}
})
