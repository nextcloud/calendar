/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { RoomPrincipal } from './principal.ts'

/**
 * A room principal enriched with the outcome of a free/busy request.
 *
 * @remarks
 * Availability is not a property of the principal itself: it only exists
 * relative to a time range, so it is attached after the free/busy check
 * rather than mapped from dav.
 */
export interface RoomOption extends RoomPrincipal {
	/** Whether the room is free for the time range that was checked. */
	isAvailable: boolean
}

/**
 * A single choice in one of the room filter dropdowns.
 */
export interface RoomFilterOption {
	/** Raw value to filter on. */
	id: string
	/** Human readable and localized label. */
	label: string
}

/**
 * The state of all room filters combined.
 */
export interface RoomFilterState {
	/** Free text to match against name, building, address and room number. */
	searchText: string
	/** Building name to restrict to, or `null` for all buildings. */
	building: string | null
	/** Building story to restrict to, or `null` for all stories. */
	story: string | null
	/** Minimum number of seats, `0` to not filter on capacity. */
	minimumSeatingCapacity: number
	/** Features a room must all have, `[]` to not filter on features. */
	features: string[]
}

/**
 * Rooms of one building, as rendered in a collapsible section.
 */
export interface RoomGroup {
	/** Building name, or a fallback label for rooms without one. */
	name: string
	/** Rooms in this building, already filtered and sorted. */
	rooms: RoomOption[]
	/** How many of {@link rooms} are free for the checked time range. */
	availableCount: number
}
