/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { InternalExtensionRegistry } from '@/nextcloud-calendar/registry'
import type { EventEditorExtensionId, IEventEditorExtension } from '@/nextcloud-calendar/ui/event-editor'

interface InternalGlobalScope {
	extensionRegistry?: InternalExtensionRegistry
	eventEditorExtension?: Map<EventEditorExtensionId, IEventEditorExtension<unknown>>
}

window._nc_calendar_scope ??= {}
window._nc_calendar_scope.v0_0 ??= {}

/**
 * Get the global scope for the calendar library.
 * This is used to store global variables scoped to prevent breaking changes in the future.
 *
 * @internal
 */
export const scopedGlobals = window._nc_calendar_scope.v0_0 as InternalGlobalScope
