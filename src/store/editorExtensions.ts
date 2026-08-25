/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { ExtensionRegistryEvents } from '@/nextcloud-calendar/registry'
import type { EventEditorExtensionId, IEventEditorExtension } from '@/nextcloud-calendar/ui/event-editor'

import { useEventListener } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getEventEditorExtensions, getRegistry } from '@/nextcloud-calendar'

export default defineStore('editorExtensions', () => {
	const regsitry = getRegistry()

	// Just a typesafe wrapper.
	function useRegistryListener<EventT extends keyof ExtensionRegistryEvents>(
		type: EventT,
		handler: (e: ExtensionRegistryEvents[EventT]) => void,
	) {
		return useEventListener(regsitry, type, handler as (e: Event) => void)
	}

	const lifecycleExtensionMap = ref(new Map())
	function addLifecycleExtension(extension: IEventEditorExtension<unknown>) {
		lifecycleExtensionMap.value.set(extension.id, extension)
	}
	function removeLifecycleExtension(extensionId: EventEditorExtensionId) {
		lifecycleExtensionMap.value.delete(extensionId)
	}

	getEventEditorExtensions().forEach(addLifecycleExtension)

	useRegistryListener('register:eventEditorExtension', ({ detail: extension }) => {
		addLifecycleExtension(extension)
	})
	useRegistryListener('unregister:eventEditorExtension', ({ detail: extensionId }) => {
		removeLifecycleExtension(extensionId)
	})

	const extensions = computed(() => [...lifecycleExtensionMap.value.values()])

	return {
		extensions,
	}
})
