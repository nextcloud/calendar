/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { EventEditor, EventEditorEvent, EventEditorExtension } from '@nextcloud/calendar-integration'
import type { ShallowRef } from 'vue'
import type { EventEditorEventAccess, EventEditorExtensionState, EventEditorView } from '@/store/eventEditorExtensionInstances'

import { shallowRef } from 'vue'
import { callSafely } from '@/services/eventEditorExtensions/callSafely'
import { createEventEditorExtensionContext } from '@/services/eventEditorExtensions/context'

// `@nextcloud/calendar-integration` does not export the types of the callbacks, so they are derived from the methods taking them.
type SaveCallback = Parameters<EventEditorEvent['onSave']>[0]['callback']
type ViewChangeCallback = Parameters<EventEditor['onViewChange']>[0]['callback']
type ViewChangeDetails = Parameters<ViewChangeCallback>[0]

/**
 * A field an extension added to the editor.
 */
export interface ExtensionField {
	/** Unique id of the field, e.g. to key it when rendering */
	id: number
	/** The element rendering the field */
	element: Element
}

/**
 * An event editor extension set up in the open editor.
 */
export interface ExtensionInstance {
	extension: EventEditorExtension
	saveCallbacks: SaveCallback[]
	viewChangeCallbacks: ViewChangeCallback[]
	/** Current view of the editor */
	view: EventEditorView
	/** Access of the current user to the event, fixed while the instance is set up */
	access: EventEditorEventAccess
	/**
	 * Fields the extension added to the editor.
	 * The elements are owned by the extension, so they are kept raw instead of deeply reactive.
	 */
	fields: ShallowRef<readonly ExtensionField[]>
	isDisposed: boolean
}

/**
 * Set up an extension in the open editor.
 *
 * @param extension - The extension to set up
 * @param state - State of the open editor
 * @return The set up instance of the extension
 */
export function setUp(extension: EventEditorExtension, state: EventEditorExtensionState): ExtensionInstance {
	const instance: ExtensionInstance = {
		extension,
		saveCallbacks: [],
		viewChangeCallbacks: [],
		view: state.view,
		access: state.access,
		fields: shallowRef([]),
		isDisposed: false,
	}
	const context = createEventEditorExtensionContext(instance, state.eventComponent)
	callSafely(extension, 'setup', () => extension.setup(context))
	return instance
}

/**
 * Dispose an instance of an extension: stop calling its callbacks and remove its fields.
 *
 * @param instance - The instance to dispose
 */
export function dispose(instance: ExtensionInstance): void {
	instance.isDisposed = true
	instance.saveCallbacks = []
	instance.viewChangeCallbacks = []
	instance.fields.value = []
}

/**
 * Update the view of an instance of an extension and call its view change callbacks.
 *
 * @param instance - The instance to notify
 * @param view - The new view of the editor
 */
export function notifyViewChange(instance: ExtensionInstance, view: EventEditorView): void {
	instance.view = view
	const details: ViewChangeDetails = { view }
	for (const callback of instance.viewChangeCallbacks) {
		callSafely(instance.extension, 'onViewChange', () => callback(details))
	}
}

/**
 * Call the save callbacks of an instance of an extension before the event is saved.
 *
 * @param instance - The instance to notify
 */
export function notifyBeforeSave(instance: ExtensionInstance): void {
	for (const callback of instance.saveCallbacks) {
		callSafely(instance.extension, 'onSave', () => callback())
	}
}
