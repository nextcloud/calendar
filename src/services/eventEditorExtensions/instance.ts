/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IEventEditorEventSaveDetails, IEventEditorExtension } from '@nextcloud/calendar'
import type { ShallowRef } from 'vue'

import { shallowRef } from 'vue'
import { callSafely } from '@/services/eventEditorExtensions/callSafely'
import { createEventEditorExtensionContext } from '@/services/eventEditorExtensions/context'

/**
 * A field an extension added to the editor.
 */
export interface ExtensionField {
	/** Unique id of the field, e.g. to key it when rendering */
	id: number
	/** Icon shown in front of the field */
	icon: HTMLElement
	/** The field itself */
	field: HTMLElement
}

/**
 * An event editor extension set up in the open editor.
 */
export interface ExtensionInstance {
	extension: IEventEditorExtension
	saveCallbacks: ((details: IEventEditorEventSaveDetails) => void)[]
	disposeCallbacks: (() => void)[]
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
 * @return The set up instance of the extension
 */
export function setUp(extension: IEventEditorExtension): ExtensionInstance {
	const instance: ExtensionInstance = {
		extension,
		saveCallbacks: [],
		disposeCallbacks: [],
		fields: shallowRef([]),
		isDisposed: false,
	}
	const context = createEventEditorExtensionContext(instance)
	callSafely(extension, 'setup', () => extension.setup(context))
	return instance
}

/**
 * Dispose an instance of an extension.
 * Its dispose callbacks are called before its fields are removed,
 * so that they can still clean up the elements of its fields.
 *
 * @param instance - The instance to dispose
 */
export function dispose(instance: ExtensionInstance): void {
	instance.isDisposed = true
	instance.saveCallbacks = []
	const disposeCallbacks = instance.disposeCallbacks
	instance.disposeCallbacks = []
	for (const callback of disposeCallbacks) {
		callSafely(instance.extension, 'onDispose', callback)
	}
	instance.fields.value = []
}

/**
 * Call the save callbacks of an instance of an extension before the event is saved.
 *
 * @param instance - The instance to notify
 * @param details - Details of the save, shared by all callbacks
 */
export function notifySave(instance: ExtensionInstance, details: IEventEditorEventSaveDetails): void {
	for (const callback of instance.saveCallbacks) {
		callSafely(instance.extension, 'onSave', () => callback(details))
	}
}
