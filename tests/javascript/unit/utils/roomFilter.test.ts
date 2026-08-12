/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { RoomFilterState, RoomOption } from '@/types/models/roomFilter'

import {
	buildBuildingOptions,
	buildFeatureOptions,
	buildRoomLocation,
	buildStoryOptions,
	compareRoomsByBookingState,
	deriveBuildingName,
	filterRooms,
	formatRoomFeature,
	groupRoomsByBuilding,
	matchesRoomFilters,
} from '@/utils/roomFilter'

/**
 * Build a room option with sensible defaults
 *
 * @param overrides Properties to override
 * @return Room option to use in a test
 */
function room(overrides: Partial<RoomOption> = {}): RoomOption {
	return {
		id: 'principals/calendar-rooms/room-1',
		displayname: 'Room 1',
		emailAddress: 'room1@example.com',
		calendarUserType: 'ROOM',
		isAvailable: true,
		roomType: 'meeting-room',
		roomSeatingCapacity: null,
		roomBuildingAddress: null,
		roomBuildingStory: null,
		roomBuildingRoomNumber: null,
		roomFeatures: null,
		roomAddress: null,
		...overrides,
	}
}

/**
 * Build a filter state with everything disabled
 *
 * @param overrides Filters to enable
 * @return Filter state to use in a test
 */
function filters(overrides: Partial<RoomFilterState> = {}): RoomFilterState {
	return {
		searchText: '',
		building: null,
		story: null,
		minimumSeatingCapacity: 0,
		features: [],
		...overrides,
	}
}

describe('Test suite: Room filter (utils/roomFilter.ts)', () => {
	describe('formatRoomFeature', () => {
		it.for([
			['PROJECTOR', 'Projector'],
			['projector', 'Projector'],
			['WHEELCHAIR-ACCESSIBLE', 'Wheelchair accessible'],
			['Espresso machine', 'Espresso machine'],
		])('should format %s', ([input, expected]) => {
			expect(formatRoomFeature(input)).toBe(expected)
		})
	})

	describe('deriveBuildingName', () => {
		it.for([
			['Poppodium, Kerkstraat 10, 1098 XG, Amsterdam', 'Poppodium'],
			// Imported data with an empty building column: degrades to the street
			[', Science Park 140, 1098 XG, Amsterdam', 'Science Park 140'],
			// Without a building and a street: degrades to the city, never the
			// postal code, which is no use as a group heading
			['1098 XG, Amsterdam', 'Amsterdam'],
			['01324 Dresden', '01324 Dresden'],
			['  Poppodium  ', 'Poppodium'],
			['1098 XG', null],
			['', null],
			['  ', null],
			[null, null],
		])('should derive %s', ([address, expected]) => {
			expect(deriveBuildingName(room({ roomBuildingAddress: address }))).toBe(expected)
		})
	})

	describe('buildRoomLocation', () => {
		it('should keep the address as published and append the room number', () => {
			const location = buildRoomLocation(room({
				roomBuildingAddress: 'Poppodium, Kerkstraat 10, 1098 XG, Amsterdam',
				roomBuildingRoomNumber: '2.17',
			}))

			expect(location).toBe('Poppodium, Kerkstraat 10, 1098 XG Amsterdam (Room 2.17)')
		})

		it('should join a postal code with the city that follows it', () => {
			const location = buildRoomLocation(room({
				roomBuildingAddress: 'Poppodium, Kerkstraat 10, 1098 XG, Amsterdam',
			}))

			expect(location).toBe('Poppodium, Kerkstraat 10, 1098 XG Amsterdam')
		})

		it('should handle an address that is only a postal code and a city', () => {
			const location = buildRoomLocation(room({
				roomBuildingAddress: '1098 XG, Amsterdam',
				roomBuildingRoomNumber: '0.01',
			}))

			expect(location).toBe('1098 XG Amsterdam (Room 0.01)')
		})

		it('should fall back to the room number without an address', () => {
			const location = buildRoomLocation(room({ roomBuildingRoomNumber: '2.17' }))

			expect(location).toBe('Room 2.17')
		})

		it('should handle an address of a single segment', () => {
			const location = buildRoomLocation(room({ roomBuildingAddress: 'Kerkstraat 10' }))

			expect(location).toBe('Kerkstraat 10')
		})

		it('should return null without any address data', () => {
			expect(buildRoomLocation(room())).toBeNull()
		})

		it('should treat a blank address as absent', () => {
			expect(buildRoomLocation(room({ roomBuildingAddress: '   ' }))).toBeNull()
		})
	})

	describe('buildBuildingOptions', () => {
		it('should return unique buildings sorted by name', () => {
			const options = buildBuildingOptions([
				room({ roomBuildingAddress: 'Utrecht, Straat 1' }),
				room({ roomBuildingAddress: 'Amsterdam, Straat 2' }),
				room({ roomBuildingAddress: 'Utrecht, Straat 3' }),
				room({ roomBuildingAddress: null }),
			])

			expect(options).toEqual([
				{ id: 'Amsterdam', label: 'Amsterdam' },
				{ id: 'Utrecht', label: 'Utrecht' },
			])
		})
	})

	describe('buildStoryOptions', () => {
		it('should sort stories numerically', () => {
			const options = buildStoryOptions([
				room({ roomBuildingStory: '10' }),
				room({ roomBuildingStory: '2' }),
				room({ roomBuildingStory: '1' }),
			])

			expect(options.map((option) => option.id)).toEqual(['1', '2', '10'])
		})
	})

	describe('buildFeatureOptions', () => {
		it('should return unique features with localized labels', () => {
			const options = buildFeatureOptions([
				room({ roomFeatures: ['PROJECTOR', 'WHITEBOARD'] }),
				room({ roomFeatures: ['PROJECTOR'] }),
				room({ roomFeatures: null }),
			])

			expect(options).toEqual([
				{ id: 'PROJECTOR', label: 'Projector' },
				{ id: 'WHITEBOARD', label: 'Whiteboard' },
			])
		})
	})

	describe('matchesRoomFilters', () => {
		it('should match the search text against name, building, address and room number', () => {
			const target = room({
				displayname: 'Aula',
				roomBuildingAddress: 'Poppodium, Kerkstraat 10',
				roomBuildingRoomNumber: '2.17',
			})

			expect(matchesRoomFilters(target, filters({ searchText: 'aul' }))).toBe(true)
			expect(matchesRoomFilters(target, filters({ searchText: 'poppodium' }))).toBe(true)
			expect(matchesRoomFilters(target, filters({ searchText: 'kerkstraat' }))).toBe(true)
			expect(matchesRoomFilters(target, filters({ searchText: '2.17' }))).toBe(true)
			expect(matchesRoomFilters(target, filters({ searchText: 'bibliotheek' }))).toBe(false)
		})

		it('should require every selected feature', () => {
			const target = room({ roomFeatures: ['PROJECTOR', 'WHITEBOARD'] })

			expect(matchesRoomFilters(target, filters({ features: ['PROJECTOR'] }))).toBe(true)
			expect(matchesRoomFilters(target, filters({ features: ['PROJECTOR', 'WHITEBOARD'] }))).toBe(true)
			expect(matchesRoomFilters(target, filters({ features: ['PROJECTOR', 'TV'] }))).toBe(false)
		})

		it('should exclude rooms without a known capacity when a minimum is set', () => {
			expect(matchesRoomFilters(room({ roomSeatingCapacity: 12 }), filters({ minimumSeatingCapacity: 10 }))).toBe(true)
			expect(matchesRoomFilters(room({ roomSeatingCapacity: 4 }), filters({ minimumSeatingCapacity: 10 }))).toBe(false)
			expect(matchesRoomFilters(room({ roomSeatingCapacity: null }), filters({ minimumSeatingCapacity: 10 }))).toBe(false)
			expect(matchesRoomFilters(room({ roomSeatingCapacity: null }), filters())).toBe(true)
		})

		it('should filter on building and story', () => {
			const target = room({
				roomBuildingAddress: 'Poppodium, Kerkstraat 10',
				roomBuildingStory: '2',
			})

			expect(matchesRoomFilters(target, filters({ building: 'Poppodium' }))).toBe(true)
			expect(matchesRoomFilters(target, filters({ building: 'Bibliotheek' }))).toBe(false)
			expect(matchesRoomFilters(target, filters({ story: '2' }))).toBe(true)
			expect(matchesRoomFilters(target, filters({ story: '3' }))).toBe(false)
		})
	})

	describe('filterRooms', () => {
		it('should keep pinned rooms whatever the filters say', () => {
			const booked = room({ emailAddress: 'booked@example.com', displayname: 'Booked' })
			const other = room({ emailAddress: 'other@example.com', displayname: 'Other' })

			const result = filterRooms(
				[booked, other],
				filters({ searchText: 'nothing matches this' }),
				['booked@example.com'],
			)

			expect(result).toEqual([booked])
		})
	})

	describe('compareRoomsByBookingState', () => {
		it('should sort booked first, then available, then by name', () => {
			const rooms = [
				room({ emailAddress: 'c@example.com', displayname: 'C', isAvailable: false }),
				room({ emailAddress: 'a@example.com', displayname: 'A', isAvailable: true }),
				room({ emailAddress: 'b@example.com', displayname: 'B', isAvailable: true }),
				room({ emailAddress: 'booked@example.com', displayname: 'Z', isAvailable: false }),
			]

			const sorted = [...rooms].sort(compareRoomsByBookingState(['booked@example.com']))

			expect(sorted.map((entry) => entry.displayname)).toEqual(['Z', 'A', 'B', 'C'])
		})
	})

	describe('groupRoomsByBuilding', () => {
		it('should group by building and put rooms without one last', () => {
			const groups = groupRoomsByBuilding([
				room({ displayname: 'A', roomBuildingAddress: 'Utrecht, Straat 1' }),
				room({ displayname: 'B', roomBuildingAddress: null }),
				room({ displayname: 'C', roomBuildingAddress: 'Amsterdam, Straat 2', isAvailable: false }),
				room({ displayname: 'D', roomBuildingAddress: 'Amsterdam, Straat 3' }),
			])

			expect(groups.map((group) => group.name)).toEqual(['Amsterdam', 'Utrecht', 'Other rooms'])
			expect(groups[0].rooms.map((entry) => entry.displayname)).toEqual(['D', 'C'])
			expect(groups[0].availableCount).toBe(1)
		})
	})
})
