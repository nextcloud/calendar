/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IEventEditorEventSaveDetails, IEventEditorExtension } from '@nextcloud/calendar'
import type { EventEditorState } from '@/services/eventEditorExtensions/editorState'
import type { ExtensionInstance } from '@/services/eventEditorExtensions/instance'

import { defineStore } from 'pinia'
import { computed, shallowReactive, watch } from 'vue'
import { isSameEvent, toOpenEditorState } from '@/services/eventEditorExtensions/editorState'
import { dispose, notifySave, setUp } from '@/services/eventEditorExtensions/instance'
import useEventEditorExtensionsStore from '@/store/eventEditorExtensions'

/**
 * Keeps track of the registered event editor extensions set up in the open event editor.
 *
 * At most one editor is open at a time.
 * The editors report each change of their state with `setEventEditorState`,
 * and the store decides whether the extensions keep their instances or are set up again.
 */
export default defineStore('eventEditorExtensionInstances', () => {
	const eventEditorExtensionsStore = useEventEditorExtensionsStore()

	// Not reactive: it is only used to call into the extensions.
	let editorState: Readonly<EventEditorState> | null = null
	// `undefined` if no transition is pending, `null` for a pending close.
	let pendingEditorState: Readonly<EventEditorState> | null | undefined
	// Shallow: the instances are only tracked to render their fields.
	const instances = shallowReactive(new Map<IEventEditorExtension, ExtensionInstance>())

	/** Fields of all extensions shown in the open editor, in the order the extensions were set up */
	const fields = computed(() => [...instances.values()].flatMap((instance) => instance.fields.value))

	/**
	 * Dispose the instances of extensions that are no longer registered or of all extensions if no editor is open,
	 * and set up the newly registered extensions if an editor is open.
	 */
	function syncInstances(): void {
		const extensions = editorState ? eventEditorExtensionsStore.extensions : []
		for (const [extension, instance] of instances) {
			if (!extensions.includes(extension)) {
				instances.delete(extension)
				dispose(instance)
			}
		}
		for (const extension of extensions) {
			if (!instances.has(extension)) {
				instances.set(extension, setUp(extension))
			}
		}
	}

	watch(() => eventEditorExtensionsStore.extensions, syncInstances)

	/**
	 * Apply the pending transition of the editor, if any.
	 * The extensions keep their instances if the same event stays open,
	 * e.g. when switching from the popover to the full editor, while the event is saved,
	 * or while the popover is hidden after changing the view of the calendar, as it is shown again when navigating back.
	 * Otherwise, the extensions of the previous event are disposed and set up again for the new one.
	 * They are only disposed if loading another event fails.
	 */
	function applyPendingTransition(): void {
		if (pendingEditorState === undefined) {
			return
		}
		const nextEditorState = pendingEditorState
		pendingEditorState = undefined

		if (editorState && (!nextEditorState || !isSameEvent(editorState, nextEditorState))) {
			editorState = null
			syncInstances()
		}
		editorState = nextEditorState
		syncInstances()
	}

	/**
	 * Report that the editor was opened, changed or closed.
	 *
	 * The transition is applied in a microtask, merged with the transitions reported until then.
	 * Thereby, an editor component that is unmounted and mounted again for the same event,
	 * e.g. after navigating the calendar, closes and opens the editor without disposing the extensions.
	 *
	 * @param state - The state of the open editor, or `null` if it was closed
	 */
	function setEventEditorState(state: EventEditorState | null): void {
		const isScheduled = pendingEditorState !== undefined
		pendingEditorState = toOpenEditorState(state)
		if (!isScheduled) {
			queueMicrotask(applyPendingTransition)
		}
	}

	/**
	 * Call the save callbacks of the extensions before the event is saved.
	 * Does nothing if no editor is open.
	 */
	function notifyBeforeSave(): void {
		applyPendingTransition()
		if (!editorState) {
			return
		}
		const details: IEventEditorEventSaveDetails = {}
		for (const instance of instances.values()) {
			notifySave(instance, details)
		}
	}

	return {
		setEventEditorState,
		notifyBeforeSave,
		fields,
	}
})
