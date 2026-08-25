/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { EventEditorExtensionRegistryEvents } from '@/nextcloud-calendar/ui/event-editor'

import { TypedEventTarget } from 'typescript-event-target'
import { scopedGlobals } from '@/nextcloud-calendar/globalScope'

export type ExtensionRegistryEvents = EventEditorExtensionRegistryEvents

/**
 * @internal
 */
export class InternalExtensionRegistry extends TypedEventTarget<ExtensionRegistryEvents> {}
export type ExtensionRegistry = Pick<InternalExtensionRegistry, 'addEventListener' | 'removeEventListener'>

/**
 * @internal
 */
export function getInternalRegistry(): InternalExtensionRegistry {
	scopedGlobals.extensionRegistry ??= new InternalExtensionRegistry()
	return scopedGlobals.extensionRegistry
}

export function getRegistry(): ExtensionRegistry {
	return getInternalRegistry()
}
