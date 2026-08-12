/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { RoomPrincipalProperties } from '@/types/models/principal'
import type {
	RoomFilterOption,
	RoomFilterState,
	RoomGroup,
	RoomOption,
} from '@/types/models/roomFilter'

import { t } from '@nextcloud/l10n'

/**
 * Known room features and their localized labels.
 *
 * Unknown features are shown as-is: room backends are free to publish their
 * own, and an untranslated raw value beats a mangled one.
 *
 * Evaluated lazily so that t() is not called at module import time.
 *
 * @return Map of raw feature value to human readable and localized label
 */
function getFeatureLabels(): Record<string, string> {
	return {
		PROJECTOR: t('calendar', 'Projector'),
		WHITEBOARD: t('calendar', 'Whiteboard'),
		'WHEELCHAIR-ACCESSIBLE': t('calendar', 'Wheelchair accessible'),
		'AV-EQUIPMENT': t('calendar', 'Audio-visual equipment'),
		PHONE: t('calendar', 'Phone'),
		'VIDEO-CONFERENCING': t('calendar', 'Video conferencing'),
		TV: t('calendar', 'TV'),
	}
}

/**
 * Format a room feature as a human readable and localized string
 *
 * @param feature Raw feature value as published by the room backend
 * @return Localized label, or the raw value if the feature is not known
 */
export function formatRoomFeature(feature: string): string {
	return getFeatureLabels()[feature.toUpperCase()] ?? feature
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
 * Derive the name of the building a room is in
 *
 * @remarks
 * A heuristic, not data: rooms have no building name of their own, so the
 * first segment of the building address is used. It holds for backends that
 * publish "Building, Street, Postal code, City" and degrades to the street
 * for those that do not.
 *
 * @param room Room to derive the building name of
 * @return Building name, or null if the room has no usable address
 */
export function deriveBuildingName(room: RoomPrincipalProperties): string | null {
	const address = normalizeText(room.roomBuildingAddress)
	if (address === null) {
		return null
	}

	return splitAddress(address)[0] ?? null
}

/**
 * Join address segments, merging a postal code with the city that follows it
 *
 * @param segments Address segments without the building name
 * @return Human readable address, or an empty string if there are no segments
 */
function joinAddressSegments(segments: string[]): string {
	const parts: string[] = []

	for (let index = 0; index < segments.length; index++) {
		const segment = segments[index]
		const next = segments[index + 1]
		// A postal code belongs with its city: "1098 XG, Amsterdam" reads as
		// "1098 XG Amsterdam" on an envelope, and in a map application.
		if (next !== undefined && /^\d{4,6}\s*[A-Z]{0,2}$/i.test(segment)) {
			parts.push(`${segment} ${next}`)
			index++
			continue
		}

		parts.push(segment)
	}

	return parts.join(', ')
}

/**
 * Build a location string for the event LOCATION property
 *
 * @remarks
 * Deliberately not the `roomAddress` of the dav principal: that one joins
 * room number, story and address in that order, which reads as "2.17, 2,
 * Kerkstraat 10" and is of little use to a map or navigation application.
 * Street first, building and room number in trailing parentheses.
 *
 * @param room Room to build a location for
 * @return Location string, or null if the room carries no usable address data
 */
export function buildRoomLocation(room: RoomPrincipalProperties): string | null {
	const roomNumber = normalizeText(room.roomBuildingRoomNumber)
	const roomLabel = roomNumber === null
		? null
		: t('calendar', 'Room {roomNumber}', { roomNumber })
	const address = normalizeText(room.roomBuildingAddress)

	if (address === null) {
		return roomLabel
	}

	const segments = splitAddress(address)
	const building = segments[0] ?? null
	const street = joinAddressSegments(segments.slice(1))
	const details = [building, roomLabel].filter((part) => part !== null).join(', ')

	if (street === '') {
		return details === '' ? null : details
	}

	return details === '' ? street : `${street} (${details})`
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
		const story = normalizeText(room.roomBuildingStory)
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
		for (const feature of room.roomFeatures ?? []) {
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
		room.displayname,
		deriveBuildingName(room),
		room.roomBuildingAddress,
		room.roomBuildingRoomNumber,
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

	if (filters.story !== null && normalizeText(room.roomBuildingStory) !== filters.story) {
		return false
	}

	if (filters.minimumSeatingCapacity > 0
		&& (room.roomSeatingCapacity ?? 0) < filters.minimumSeatingCapacity) {
		return false
	}

	if (filters.features.length > 0) {
		const features = room.roomFeatures ?? []
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
		if (room.emailAddress !== null && pinnedEmails.includes(room.emailAddress)) {
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
	const isPinned = (room: RoomOption) => room.emailAddress !== null
		&& pinnedEmails.includes(room.emailAddress)

	return (a, b) => {
		if (isPinned(a) !== isPinned(b)) {
			return isPinned(a) ? -1 : 1
		}

		if (a.isAvailable !== b.isAvailable) {
			return a.isAvailable ? -1 : 1
		}

		return (a.displayname ?? '').localeCompare(b.displayname ?? '')
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
