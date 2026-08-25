/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { EventSaveScope, IEvent } from '@/nextcloud-calendar/event'

import { scopedGlobals } from '@/nextcloud-calendar/globalScope'
import { getInternalRegistry } from '@/nextcloud-calendar/registry'

export type RegisterEventEditorExtension = CustomEvent<IEventEditorExtension<unknown>>
export type UnregisterEventEditorExtension = CustomEvent<EventEditorExtensionId>

export interface EventEditorExtensionRegistryEvents {
	'register:eventEditorExtension': RegisterEventEditorExtension
	'unregister:eventEditorExtension': UnregisterEventEditorExtension
}

export type EventEditorFieldId = string

export interface IEventEditorField {
	id: EventEditorFieldId
	order: number
	element: HTMLElement
}

export interface IEventEditor {
	view: 'simple' | 'full'
	isReadOnly: boolean
	addEditorField(field: IEventEditorField): void
}

export interface IEventEditorExtensionContext {
	event: IEvent
	editor: IEventEditor
}

export type EventEditorExtensionId = string

export interface IEventEditorExtension<StateT> {
	id: EventEditorExtensionId
	init(ctx: IEventEditorExtensionContext): StateT
	onEditorChanged?(ctx: IEventEditorExtensionContext, state: StateT): void
	onBeforeSave?(ctx: IEventEditorExtensionContext, state: StateT, details: {
		scope: EventSaveScope
	}): void
	dispose?(ctx: IEventEditorExtensionContext, state: StateT): void
}

export function registerEventEditorExtension<StateT>(extension: IEventEditorExtension<StateT>): void {
	scopedGlobals.eventEditorExtension ??= new Map()
	if (scopedGlobals.eventEditorExtension.has(extension.id)) {
		throw new Error(`Extension \`${extension.id}\` already registered.`)
	}

	scopedGlobals.eventEditorExtension.set(extension.id, extension)
	getInternalRegistry()
		.dispatchTypedEvent('register:eventEditorExtension', new CustomEvent('register:eventEditorExtension', { detail: extension }))
}

export function unregisterEventEditorExtension(extensionId: EventEditorExtensionId): void {
	if (scopedGlobals.eventEditorExtension && scopedGlobals.eventEditorExtension.has(extensionId)) {
		scopedGlobals.eventEditorExtension.delete(extensionId)
	}
	getInternalRegistry()
		.dispatchTypedEvent('unregister:eventEditorExtension', new CustomEvent('unregister:eventEditorExtension', { detail: extensionId }))
}

export function getEventEditorExtensions(): IEventEditorExtension<unknown>[] {
	if (scopedGlobals.eventEditorExtension) {
		return [...scopedGlobals.eventEditorExtension.values()]
	}
	return []
}
