/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { RoomPrincipal } from '@/types/models/principal'

import { t } from '@nextcloud/l10n'
import { formatRoomFeature } from '@/models/resourceProps'

/**
 * A room principal enriched with the outcome of a free/busy request.
 */
export interface RoomOption {
	principal: RoomPrincipal
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

/**
 * Trim a room property and treat a blank value as absent
 *
 * @param value Raw property value
 * @return Trimmed value, or null if it is absent or blank
 */
function normalizeText(value: string | null | undefined): string | null {
	if (typeof value !== 'string') {
		return null
	}

	const trimmed = value.trim()
	return trimmed === '' ? null : trimmed
}

/**
 * Split an address into its segments, dropping empty ones
 *
 * Imported room data regularly carries empty fields, which surface as leading
 * or doubled commas, e.g. ", Science Park 140, 1098 XG, Amsterdam".
 *
 * @param address Comma separated address
 * @return Non-empty address segments in their original order
 */
function splitAddress(address: string): string[] {
	return address
		.split(',')
		.map((segment) => segment.trim())
		.filter((segment) => segment !== '')
}

/**
 * Check whether an address segment is a postal code
 *
 * @param segment Address segment to check
 * @return True if the segment looks like a postal code
 */
function isPostalCode(segment: string): boolean {
	return /^\d{4,6}(\s*[A-Z]{1,2})?$/i.test(segment)
}

/**
 * Derive the name of the building a room is in
 *
 * @remarks
 * A heuristic, not data: rooms have no building name of their own, so the
 * first segment of the building address is used. It holds for backends that
 * publish "Building, Street, Postal code, City" and degrades to the street,
 * or to the city, for those that do not. Postal codes are skipped: they are
 * never a building name, and grouping rooms under "1098 XG" helps nobody.
 *
 * @param room Room to derive the building name of
 * @return Building name, or null if the room has no usable address
 */
export function deriveBuildingName(room: RoomOption): string | null {
	// TODO https://github.com/nextcloud/calendar/issues/8734 Use the newly introduced building name after it becomes available.
	const address = normalizeText(room.principal.roomBuildingAddress)
	if (address === null) {
		return null
	}

	return splitAddress(address).find((segment) => !isPostalCode(segment)) ?? null
}

/**
 * Build the options of the building filter
 *
 * @param rooms Rooms to collect buildings from
 * @return Unique building options, sorted by label
 */
export function buildBuildingOptions(rooms: RoomOption[]): RoomFilterOption[] {
	const buildings = new Set<string>()
	for (const room of rooms) {
		const building = deriveBuildingName(room)
		if (building !== null) {
			buildings.add(building)
		}
	}

	return [...buildings]
		.sort((a, b) => a.localeCompare(b))
		.map((building) => ({ id: building, label: building }))
}

/**
 * Build the options of the building story filter
 *
 * @param rooms Rooms to collect stories from
 * @return Unique story options, sorted numerically where possible
 */
export function buildStoryOptions(rooms: RoomOption[]): RoomFilterOption[] {
	const stories = new Set<string>()
	for (const room of rooms) {
		const story = normalizeText(room.principal.roomBuildingStory)
		if (story !== null) {
			stories.add(story)
		}
	}

	return [...stories]
		.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
		.map((story) => ({ id: story, label: story }))
}

/**
 * Build the options of the feature filter
 *
 * @param rooms Rooms to collect features from
 * @return Unique feature options, sorted by label
 */
export function buildFeatureOptions(rooms: RoomOption[]): RoomFilterOption[] {
	const features = new Set<string>()
	for (const room of rooms) {
		for (const feature of room.principal.roomFeatures ?? []) {
			features.add(feature)
		}
	}

	return [...features]
		.map((feature) => ({ id: feature, label: formatRoomFeature(feature) }))
		.sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Check whether a room matches the free text filter
 *
 * @param room Room to check
 * @param searchText Text to search for
 * @return True if the room matches
 */
function matchesSearchText(room: RoomOption, searchText: string): boolean {
	const needle = searchText.trim().toLowerCase()
	if (needle === '') {
		return true
	}

	const haystack = [
		room.principal.displayname,
		deriveBuildingName(room),
		room.principal.roomBuildingAddress,
		room.principal.roomBuildingRoomNumber,
	]

	return haystack.some((value) => value?.toLowerCase().includes(needle) ?? false)
}

/**
 * Check whether a room matches all given filters
 *
 * @param room Room to check
 * @param filters Filters to apply
 * @return True if the room matches every filter
 */
export function matchesRoomFilters(room: RoomOption, filters: RoomFilterState): boolean {
	if (!matchesSearchText(room, filters.searchText)) {
		return false
	}

	if (filters.building !== null && deriveBuildingName(room) !== filters.building) {
		return false
	}

	if (filters.story !== null && normalizeText(room.principal.roomBuildingStory) !== filters.story) {
		return false
	}

	if (filters.minimumSeatingCapacity > 0
		&& (room.principal.roomSeatingCapacity ?? 0) < filters.minimumSeatingCapacity) {
		return false
	}

	if (filters.features.length > 0) {
		const features = room.principal.roomFeatures ?? []
		if (!filters.features.every((feature) => features.includes(feature))) {
			return false
		}
	}

	return true
}

/**
 * Filter a list of rooms
 *
 * @param rooms Rooms to filter
 * @param filters Filters to apply
 * @param pinnedEmails Emails of rooms that stay visible whatever the filters say
 * @return Rooms matching the filters, plus the pinned ones
 */
export function filterRooms(
	rooms: RoomOption[],
	filters: RoomFilterState,
	pinnedEmails: string[] = [],
): RoomOption[] {
	return rooms.filter((room) => {
		// A room that is already booked must remain visible, otherwise it
		// cannot be deselected without first clearing the filters.
		if (room.principal.emailAddress !== null && pinnedEmails.includes(room.principal.emailAddress)) {
			return true
		}

		return matchesRoomFilters(room, filters)
	})
}

/**
 * Build a comparator that sorts booked rooms first, then available ones
 *
 * @param pinnedEmails Emails of rooms that were already booked
 * @return Comparator for {@link Array.prototype.sort}
 */
export function compareRoomsByBookingState(pinnedEmails: string[] = []): (a: RoomOption, b: RoomOption) => number {
	const isPinned = (room: RoomOption) => room.principal.emailAddress !== null
		&& pinnedEmails.includes(room.principal.emailAddress)

	return (a, b) => {
		if (isPinned(a) !== isPinned(b)) {
			return isPinned(a) ? -1 : 1
		}

		if (a.isAvailable !== b.isAvailable) {
			return a.isAvailable ? -1 : 1
		}

		return (a.principal.displayname ?? '').localeCompare(b.principal.displayname ?? '')
	}
}

/**
 * Group rooms by the building they are in
 *
 * @param rooms Rooms to group, already filtered
 * @param pinnedEmails Emails of rooms that were already booked
 * @return Groups sorted by building name, with rooms without a building last
 */
export function groupRoomsByBuilding(
	rooms: RoomOption[],
	pinnedEmails: string[] = [],
): RoomGroup[] {
	// Translators: heading above rooms that have no building address
	const fallbackName = t('calendar', 'Other rooms')
	const groups = new Map<string, RoomOption[]>()

	for (const room of rooms) {
		const name = deriveBuildingName(room) ?? fallbackName
		const group = groups.get(name)
		if (group === undefined) {
			groups.set(name, [room])
			continue
		}

		group.push(room)
	}

	const compare = compareRoomsByBookingState(pinnedEmails)

	return [...groups.entries()]
		.sort(([a], [b]) => {
			if (a === fallbackName || b === fallbackName) {
				return a === fallbackName ? 1 : -1
			}

			return a.localeCompare(b)
		})
		.map(([name, groupedRooms]) => ({
			name,
			rooms: [...groupedRooms].sort(compare),
			availableCount: groupedRooms.filter((room) => room.isAvailable).length,
		}))
}
