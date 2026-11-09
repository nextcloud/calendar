/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IEventEditor, IEventEditorEvent, IEventEditorExtensionContext } from '@nextcloud/calendar'
import type { ExtensionField, ExtensionInstance } from '@/services/eventEditorExtensions/instance'

import { callSafely } from '@/services/eventEditorExtensions/callSafely'

// Unique across instances, as the fields of all extensions are rendered together.
let nextFieldId = 0

/**
 * Event passed to an extension.
 *
 * Implements the event of `@nextcloud/calendar`,
 * and is the place to prototype new functionality before it is added there.
 */
export interface EventEditorEvent extends IEventEditorEvent {
	onSave: IEventEditorEvent['onSave']
}

/**
 * A field to add to the editor.
 */
export interface EventEditorFieldOptions {
	/** Icon shown in front of the field, like the icons of the other properties of the event */
	icon: HTMLElement
	/** The field itself */
	field: HTMLElement
}

/**
 * A field added to the editor.
 */
export interface EventEditorField {
	/**
	 * Remove the field from the editor.
	 * Does nothing if it was already removed.
	 * The fields of an extension are removed when it is disposed.
	 */
	remove(): void
}

/**
 * Editor passed to an extension.
 *
 * Implements the editor of `@nextcloud/calendar`,
 * and is the place to prototype new functionality before it is added there.
 */
export interface EventEditor extends IEventEditor {
	/**
	 * Add a field to the editor, shown below the description.
	 * Does nothing if the extension was already disposed.
	 *
	 * @param options - The field to add
	 * @return The added field
	 */
	addField(options: EventEditorFieldOptions): EventEditorField
}

/**
 * Create the event passed to an extension,
 * through which it registers its event callbacks with its instance.
 *
 * @param instance - The instance of the extension being set up
 * @return The event for the extension
 */
export function createEventEditorEvent(instance: ExtensionInstance): EventEditorEvent {
	return {
		onSave(callback) {
			// An async setup might still register callbacks after the instance was disposed.
			if (!instance.isDisposed) {
				instance.saveCallbacks.push(callback)
			}
		},
	}
}

/**
 * Create the editor passed to an extension,
 * through which it registers its editor callbacks with its instance.
 *
 * @param instance - The instance of the extension being set up
 * @return The editor for the extension
 */
export function createEventEditor(instance: ExtensionInstance): EventEditor {
	return {
		onDispose(callback) {
			if (instance.isDisposed) {
				callSafely(instance.extension, 'onDispose', callback)
			} else {
				instance.disposeCallbacks.push(callback)
			}
		},

		addField({ icon, field }) {
			// An async setup might still add fields after the instance was disposed.
			if (instance.isDisposed) {
				return { remove() {} }
			}
			const addedField: ExtensionField = { id: nextFieldId++, icon, field }
			instance.fields.value = [...instance.fields.value, addedField]
			return {
				remove() {
					instance.fields.value = instance.fields.value.filter((f) => f !== addedField)
				},
			}
		},
	}
}

/**
 * Context passed to the setup of an extension.
 *
 * Implements the context of `@nextcloud/calendar`,
 * and is the place to prototype new functionality before it is added there.
 */
export interface EventEditorExtensionContext extends IEventEditorExtensionContext {
	event: EventEditorEvent
	editor: EventEditor
}

/**
 * Create the context passed to the setup of an extension.
 *
 * @param instance - The instance of the extension being set up
 * @return The context for the extension
 */
export function createEventEditorExtensionContext(instance: ExtensionInstance): EventEditorExtensionContext {
	return {
		event: createEventEditorEvent(instance),
		editor: createEventEditor(instance),
	}
}
