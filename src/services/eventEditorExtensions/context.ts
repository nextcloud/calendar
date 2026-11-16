/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { EventEditor, EventEditorEvent, EventEditorExtensionContext } from '@nextcloud/calendar-integration'
import type { ExtensionField, ExtensionInstance } from '@/services/eventEditorExtensions/instance'
import type { EventEditorEventComponent } from '@/store/eventEditorExtensionInstances'

// Unique across instances, as the fields of all extensions are rendered together.
let nextFieldId = 0

/*
 * Extensions are plain JavaScript in other apps, so the types of what they pass are not guaranteed.
 * The checks below make misuse fail right away with a clear error,
 * instead of failing later with an obscure one, or not at all and corrupting the event or the editor.
 */

/**
 * Throw if a value passed by an extension is not an object.
 *
 * @param value - The value to check
 * @param description - Description of the value for the error
 */
function assertObject(value: unknown, description: string): asserts value is Record<string, unknown> {
	if (typeof value !== 'object' || value === null) {
		throw new TypeError(`${description} must be an object`)
	}
}

/**
 * Throw if a callback passed by an extension is not a function,
 * so that registering it fails instead of every later call.
 *
 * @param value - The value to check
 * @param description - Description of the value for the error
 */
function assertFunction(value: unknown, description: string): asserts value is (...args: never[]) => unknown {
	if (typeof value !== 'function') {
		throw new TypeError(`${description} must be a function`)
	}
}

/**
 * Throw if a value passed by an extension is not a DOM element, as it is mounted into the editor.
 *
 * @param value - The value to check
 * @param description - Description of the value for the error
 */
function assertElement(value: unknown, description: string): asserts value is Element {
	if (!(value instanceof Element)) {
		throw new TypeError(`${description} must be an \`Element\``)
	}
}

/**
 * Throw if a value passed by an extension is not a string.
 *
 * @param value - The value to check
 * @param description - Description of the value for the error
 */
function assertString(value: unknown, description: string): asserts value is string {
	if (typeof value !== 'string') {
		throw new TypeError(`${description} must be a string`)
	}
}

/**
 * Throw if an extension may not set a property with the given name.
 * Extensions may only set non-standard properties (`X-`), except those reserved for Nextcloud (`X-NC-`),
 * so that they cannot break the properties managed by the editor.
 * Property names are case-insensitive in iCalendar, so the check is too.
 *
 * @param name - Name of the property
 */
function assertSettablePropertyName(name: string): void {
	const upperCaseName = name.toUpperCase()
	if (!upperCaseName.startsWith('X-') || upperCaseName.startsWith('X-NC-')) {
		throw new Error(`Cannot set the property \`${name}\`: only properties starting with \`X-\`, but not with \`X-NC-\`, can be set`)
	}
}

/**
 * Create the event passed to an extension,
 * through which it registers its event callbacks with its instance and changes the event.
 *
 * @param instance - The instance of the extension being set up
 * @param eventComponent - Event component of the edited occurrence
 * @return The event for the extension
 */
export function createEventEditorEvent(instance: ExtensionInstance, eventComponent: EventEditorEventComponent): EventEditorEvent {
	return {
		setProperty(property) {
			assertObject(property, 'The property')
			const { name, value } = property
			assertString(name, 'The name of the property')
			assertString(value, `The value of the property \`${name}\``)
			assertSettablePropertyName(name)
			// The extension might keep the context and still set properties after the instance was disposed.
			if (instance.isDisposed) {
				return
			}
			// The event is not saved, so the change would be lost.
			if (instance.access === 'view') {
				throw new Error(`Cannot set the property \`${name}\` of an event the user can only view`)
			}
			eventComponent.updatePropertyWithValue(name, value)
		},

		onSave(options) {
			assertObject(options, 'The options of `onSave`')
			const { callback } = options
			assertFunction(callback, 'The callback of `onSave`')
			// The extension might keep the context and still register callbacks after the instance was disposed.
			if (instance.isDisposed) {
				return { unsubscribe() { } }
			}
			// Wrapped so that unsubscribing removes only this registration, even if the callback is registered twice.
			const saveCallback: typeof callback = () => callback()
			instance.saveCallbacks.push(saveCallback)
			return {
				unsubscribe() {
					instance.saveCallbacks = instance.saveCallbacks.filter((c) => c !== saveCallback)
				},
			}
		},
	}
}

/**
 * Create the editor passed to an extension,
 * through which it adds its fields to its instance and follows the view of the editor.
 *
 * @param instance - The instance of the extension being set up
 * @return The editor for the extension
 */
export function createEventEditor(instance: ExtensionInstance): EventEditor {
	return {
		get view() {
			return instance.view
		},

		access: instance.access,

		onViewChange(options) {
			assertObject(options, 'The options of `onViewChange`')
			const { callback } = options
			assertFunction(callback, 'The callback of `onViewChange`')
			// The extension might keep the context and still register callbacks after the instance was disposed.
			if (instance.isDisposed) {
				return { unsubscribe() { } }
			}
			// Wrapped so that unsubscribing removes only this registration, even if the callback is registered twice.
			const viewChangeCallback: typeof callback = (details) => callback(details)
			instance.viewChangeCallbacks.push(viewChangeCallback)
			return {
				unsubscribe() {
					instance.viewChangeCallbacks = instance.viewChangeCallbacks.filter((c) => c !== viewChangeCallback)
				},
			}
		},

		addCustomField(options) {
			assertObject(options, 'The options of `addCustomField`')
			const { element } = options
			assertElement(element, 'The element of the field')
			// The extension might keep the context and still add fields after the instance was disposed.
			if (instance.isDisposed) {
				return { remove() { } }
			}
			const addedField: ExtensionField = { id: nextFieldId++, element }
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
 * Create the context passed to the setup of an extension.
 *
 * @param instance - The instance of the extension being set up
 * @param eventComponent - Event component of the edited occurrence
 * @return The context for the extension
 */
export function createEventEditorExtensionContext(instance: ExtensionInstance, eventComponent: EventEditorEventComponent): EventEditorExtensionContext {
	return {
		event: createEventEditorEvent(instance, eventComponent),
		editor: createEventEditor(instance),
	}
}
