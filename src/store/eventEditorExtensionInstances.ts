/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { EventEditor, EventEditorExtension } from '@nextcloud/calendar'
import type { ExtensionInstance } from '@/services/eventEditorExtensions/instance'

import { defineStore } from 'pinia'
import { computed, shallowReactive, watch } from 'vue'
import { dispose, notifyBeforeSave, notifyViewChange, setUp } from '@/services/eventEditorExtensions/instance'
import useEventEditorExtensionsStore from '@/store/eventEditorExtensions'
import logger from '@/utils/logger.js'

/**
 * Access of the current user to the edited event, which determines how they may change it.
 * Defined by `@nextcloud/calendar`, see `EventEditor.access` there.
 */
export type EventEditorEventAccess = EventEditor['access']

/**
 * How the editor is shown.
 * Defined by `@nextcloud/calendar`, see `EventEditor.view` there.
 */
export type EventEditorView = EventEditor['view']

/**
 * Calendar object of the edited event (see `src/models/calendarObject.js`),
 * typed only as far as it is used here.
 */
export interface EventEditorCalendarObject {
	id?: string | null
	uid: string
	calendarId: string
}

/**
 * Event component of `@nextcloud/calendar-js` of the edited occurrence,
 * typed only as far as it is used here.
 */
export interface EventEditorEventComponent {
	/**
	 * Set a property, replacing the first property with the same name, and mark the event as changed.
	 *
	 * @param propertyName - Name of the property
	 * @param value - Value of the property
	 */
	updatePropertyWithValue(propertyName: string, value: string): void
}

/**
 * State of the open event editor.
 */
export interface EventEditorExtensionState {
	/**
	 * Calendar object of the edited event, the editor changes it in place.
	 */
	calendarObject: EventEditorCalendarObject
	/** Event component of the edited occurrence, the editor changes it in place */
	eventComponent: EventEditorEventComponent
	/** Access of the current user to the event, which determines how they may change it */
	access: EventEditorEventAccess
	/** How the editor is shown */
	view: EventEditorView
}

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
	let editorState: EventEditorExtensionState | null = null
	// Shallow: the instances are only tracked to render their fields.
	const instances = shallowReactive(new Map<EventEditorExtension, ExtensionInstance>())

	/** Fields of all extensions shown in the open editor, in the order the extensions were registered */
	const fields = computed(() => [...instances.values()].flatMap((instance) => instance.fields.value))

	/**
	 * Dispose the instances of all extensions, and set up all registered extensions again if an editor is open.
	 *
	 * @param state - The state of the open editor, or `null` if no editor is open
	 */
	function recreateExtensions(state: EventEditorExtensionState | null): void {
		for (const instance of instances.values()) {
			dispose(instance)
		}
		instances.clear()
		if (state === null) {
			return
		}
		for (const extension of eventEditorExtensionsStore.extensions) {
			instances.set(extension, setUp(extension, state))
		}
	}

	/**
	 * Dispose the instances of unregistered extensions and set up newly registered extensions in the open editor.
	 * The instances of the other extensions are kept.
	 *
	 * @param extensions - The registered extensions, in registration order
	 */
	function updateExtensions(extensions: readonly EventEditorExtension[]): void {
		if (editorState === null) {
			return
		}
		const registered = new Set(extensions)
		for (const [extension, instance] of instances) {
			if (!registered.has(extension)) {
				dispose(instance)
			}
		}
		const state = editorState
		const updatedInstances = extensions.map((extension) => [extension, instances.get(extension) ?? setUp(extension, state)] as const)
		// Inserted again to keep the fields in registration order.
		instances.clear()
		for (const [extension, instance] of updatedInstances) {
			instances.set(extension, instance)
		}
	}

	watch(() => eventEditorExtensionsStore.extensions, updateExtensions)

	/**
	 * Report that the editor was opened, changed or closed.
	 *
	 * The extensions keep their instances while the same event stays open, e.g. while the event is saved,
	 * and are notified when the view of the editor changes.
	 * Otherwise, the extensions of the previous event are disposed, and set up again once another event is shown.
	 *
	 * @param state - The state of the open editor, or `null` if it was closed
	 */
	function setEventEditorState(state: EventEditorExtensionState | null): void {
		const previousState = editorState
		editorState = state

		// Opened or closed.
		if (previousState === null || state === null) {
			recreateExtensions(state)
			return
		}

		// Another event.
		// The editor changes both objects in place, e.g. a new event gets its id when it is saved.
		// The event component is compared as well, as the occurrences of a recurring event share their calendar object.
		if (previousState.calendarObject !== state.calendarObject || previousState.eventComponent !== state.eventComponent) {
			recreateExtensions(state)
			return
		}

		// Same event, but the access changed.
		// It is not expected for the `access` to change.
		// If this ever becomes possible, the extension context should provide means to subscribe to it.
		if (previousState.access !== state.access) {
			logger.error('Unexpected behavior: the access to the open event changed. Please report this as a bug.', {
				previousAccess: previousState.access,
				access: state.access,
			})
			recreateExtensions(state)
			return
		}

		// Same event and view: nothing to do.
		if (previousState.view === state.view) {
			return
		}

		// Same event, but the view changed: keep the instances and notify them.
		notifyInstancesOnViewChange(state.view)
	}

	/**
	 * Notify extension instances that the view of the editor changed.
	 *
	 * @param view - The new view of the editor
	 */
	function notifyInstancesOnViewChange(view: EventEditorView): void {
		for (const instance of instances.values()) {
			notifyViewChange(instance, view)
		}
	}

	/**
	 * Notify extension instances before event is saved.
	 */
	function notifyInstancesBeforeSave(): void {
		for (const instance of instances.values()) {
			notifyBeforeSave(instance)
		}
	}

	return {
		setEventEditorState,
		notifyBeforeSave: notifyInstancesBeforeSave,
		fields,
	}
})
