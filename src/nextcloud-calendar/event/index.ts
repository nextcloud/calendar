/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type EventSaveScope = 'this' | 'thisAndFuture'

export type EventPropertyName = string

export interface IEvent {
	hasProperty(name: EventPropertyName): boolean
	getFirstPropertyValue(name: EventPropertyName): string | null
	updateCustomPropertyWithValue(name: EventPropertyName, value: string): void
	deleteAllCustomProperties(name: EventPropertyName): void
	get masterEvent(): IEvent
}
