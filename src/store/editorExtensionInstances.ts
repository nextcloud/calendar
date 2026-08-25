/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type ICAL from 'ical.js'
import type { ShallowReactive } from 'vue'
import type { EventPropertyName, EventSaveScope, IEvent } from '@/nextcloud-calendar/event'
import type { EventEditorExtensionId, EventEditorFieldId, IEventEditor, IEventEditorExtension, IEventEditorExtensionContext, IEventEditorField } from '@/nextcloud-calendar/ui/event-editor'

import { defineStore } from 'pinia'
import { computed, shallowReactive, shallowRef, watch } from 'vue'
import useEditorExtensionsStore from '@/store/editorExtensions'

interface EventComponentAbstractValue {
	toICALJs(): ICAL.Binary | ICAL.Duration | ICAL.Period | ICAL.Recur | ICAL.Time | ICAL.UtcOffset
}

type EventComponentPropertyValue = string | number | EventComponentAbstractValue | string[] | number[] | EventComponentAbstractValue[] | null

interface EventComponent {
	hasProperty(name: string): boolean
	getFirstPropertyFirstValue(propertyName: string): EventComponentPropertyValue
	updatePropertyWithValue(propertyName: string, value: EventComponentPropertyValue): void
	deleteAllProperties(propertyName: string): boolean
	isRecurrenceException(): boolean
	isMasterItem(): boolean
	get masterItem(): EventComponent
}

class ExtensionEvent implements IEvent {
	readonly masterEvent: IEvent

	constructor(private eventComponent: EventComponent) {
		if (eventComponent.isMasterItem()) {
			this.masterEvent = this
		} else {
			this.masterEvent = new ExtensionEvent(eventComponent.masterItem)
		}
	}

	hasProperty(name: EventPropertyName): boolean {
		return this.eventComponent.hasProperty(name)
	}

	getFirstPropertyValue(name: EventPropertyName): string | null {
		const value = this.eventComponent.getFirstPropertyFirstValue(name)
		return this.normalizePropertyValue(name, value)
	}

	updateCustomPropertyWithValue(propertyName: string, value: string) {
		this.eventComponent.updatePropertyWithValue(propertyName, value)
	}

	deleteAllCustomProperties(name: EventPropertyName): void {
		console.warn('TODO deleteAllCustomProperties is not implemented.')
	}

	private normalizePropertyValue(name: EventPropertyName, value: string | null | unknown): string | null {
		if (value === null) {
			return null
		}
		if (typeof value === 'string') {
			return value
		}
		throw new Error(`Unsupported type of value \`${value}\` for property \`${name}\`.`)
	}
}

class ExtensionEditor implements IEventEditor {
	constructor(
		public readonly view: 'simple' | 'full',
		public readonly isReadOnly: boolean,
		private editorFields: Map<EventEditorFieldId, IEventEditorField>,
	) { }

	addEditorField(field: IEventEditorField): void {
		if (this.editorFields.has(field.id)) {
			throw new Error('TODO')
		}
		this.editorFields.set(field.id, field)
	}
}

export function getScope(thisAndFuture: boolean): EventSaveScope {
	return thisAndFuture ? 'this' : 'thisAndFuture'
}

export function createContext(
	calendarObjectInstance: { eventComponent: EventComponent },
	view: 'simple' | 'full',
	isReadOnly: boolean,
	editorFields: Map<EventEditorFieldId, IEventEditorField>,
): IEventEditorExtensionContext {
	return {
		event: new ExtensionEvent(calendarObjectInstance.eventComponent),
		editor: new ExtensionEditor(view, isReadOnly, editorFields),
	}
}

interface EditorClosedState {
	state: 'closed'
}
interface EditorOpenStateProperites {
	view: 'simple' | 'full'
	isReadOnly: boolean
	calendarObjectInstance: EventComponent
}
interface EditorOpenState extends EditorOpenStateProperites {
	state: 'open'
}

interface ExtensionInstance<StateT> {
	defintion: IEventEditorExtension<StateT>
	context: IEventEditorExtensionContext
	customState: StateT
	editorFields: ShallowReactive<Map<EventEditorFieldId, IEventEditorField>>
}

type ByIdExtensionInstance = Map<EventEditorExtensionId, ExtensionInstance<unknown>>

type EditorState = EditorClosedState | EditorOpenState
export default defineStore('editorExtensionInstances', () => {
	const editorExtensionsStore = useEditorExtensionsStore()
	const editorState = shallowRef<Readonly<EditorState>>({ state: 'closed' })

	function markEditorOpenedOrUpdated(properties: EditorOpenStateProperites) {
		editorState.value = {
			state: 'open',
			...properties,
		}
	}

	function markEditorClosed() {
		editorState.value = {
			state: 'closed',
		}
	}

	const extensionInstances = shallowReactive<ByIdExtensionInstance>(new Map())

	function executeOnEditorChanged() {
		for (const extensionInstance of extensionInstances.values()) {
			const extension = extensionInstance.defintion
			// TODO try catch
			extension.onEditorChanged?.(extensionInstance.context, extensionInstance.customState)
		}
	}

	function executeOnBeforeSave(thisAndFuture: true) {
		const scope = getScope(thisAndFuture)
		for (const extensionInstance of extensionInstances.values()) {
			const extension = extensionInstance.defintion
			// TODO try catch
			extension.onBeforeSave?.(extensionInstance.context, extensionInstance.customState, {
				scope,
			})
		}
	}

	function initAndDisposeExtensionInstances() {
		// First stage all instances to be disposed initally.
		// Later unstage them from disposing if corresponding extension is still registered.
		const toDispose = new Map(extensionInstances.entries())
		const toInit: Map<EventEditorExtensionId, IEventEditorExtension<unknown>> = new Map()

		if (editorState.value.state === 'open') {
			for (const extension of editorExtensionsStore.extensions) {
				const exists = toDispose.delete(extension.id)
				if (!exists) {
					toInit.set(extension.id, extension)
				}
			}
		}

		for (const extensionInstance of toDispose.values()) {
			const extensionDefinition = extensionInstance.defintion
			// TODO try catch
			extensionDefinition.dispose?.(extensionInstance.context, extensionInstance.customState)
			extensionInstances.delete(extensionDefinition.id)
		}

		for (const extensionDefinition of toInit.values()) {
			const editorStateValue = editorState.value as EditorOpenState
			const editorFields = shallowReactive(new Map<EventEditorFieldId, IEventEditorField>())
			const context = createContext(editorStateValue.calendarObjectInstance, editorStateValue.view, editorStateValue.isReadOnly, editorFields)
			// TODO try catch
			const customState = extensionDefinition.init?.(context)
			extensionInstances.set(extensionDefinition.id, {
				defintion: extensionDefinition,
				context,
				customState,
				editorFields,
			})
		}
	}

	watch(editorState, (newEditorState, oldEditorState) => {
		if (newEditorState.state !== oldEditorState.state) {
			initAndDisposeExtensionInstances()
		} else if (newEditorState.state === 'open') {
			// TODO check for change in object instance
			executeOnEditorChanged()
		}
	})

	watch(() => editorExtensionsStore.extensions, () => {
		initAndDisposeExtensionInstances()
	})

	const editorFields = computed(() => {
		return [...extensionInstances.values()]
			.flatMap((instance) => [...instance.editorFields.values()])
	})

	return {
		markEditorOpenedOrUpdated,
		markEditorClosed,
		executeOnBeforeSave,
		editorFields,
	}
})
