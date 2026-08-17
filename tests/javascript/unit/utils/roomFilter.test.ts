/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { RoomPrincipal } from '@/types/models/principal'
import type { RoomFilterState, RoomOption } from '@/utils/roomFilter'

import {
	buildBuildingOptions,
	buildFeatureOptions,
	buildStoryOptions,
	compareRoomsByBookingState,
	deriveBuildingName,
	filterRooms,
	groupRoomsByBuilding,
	matchesRoomFilters,
} from '@/utils/roomFilter'

/**
 * Build a room option with sensible defaults
 *
 * @param overrides room properties to override
 * @param isAvailable Availibility status
 * @return Room option to use in a test
 */
function room(overrides: Partial<RoomPrincipal> = {}, isAvailable = true): RoomOption {
	return {
		principal: {
			id: 'principals/calendar-rooms/room-1',
			displayname: 'Room 1',
			emailAddress: 'room1@example.com',
			calendarUserType: 'ROOM',
			roomType: 'meeting-room',
			roomSeatingCapacity: null,
			roomBuildingAddress: null,
			roomBuildingStory: null,
			roomBuildingRoomNumber: null,
			roomFeatures: null,
			roomAddress: null,
			...overrides,
		},
		isAvailable,
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
				room({ emailAddress: 'c@example.com', displayname: 'C' }, false),
				room({ emailAddress: 'a@example.com', displayname: 'A' }, true),
				room({ emailAddress: 'b@example.com', displayname: 'B' }, true),
				room({ emailAddress: 'booked@example.com', displayname: 'Z' }, false),
			]

			const sorted = [...rooms].sort(compareRoomsByBookingState(['booked@example.com']))

			expect(sorted.map((entry) => entry.principal.displayname)).toEqual(['Z', 'A', 'B', 'C'])
		})
	})

	describe('groupRoomsByBuilding', () => {
		it('should group by building and put rooms without one last', () => {
			const groups = groupRoomsByBuilding([
				room({ displayname: 'A', roomBuildingAddress: 'Utrecht, Straat 1' }),
				room({ displayname: 'B', roomBuildingAddress: null }),
				room({ displayname: 'C', roomBuildingAddress: 'Amsterdam, Straat 2' }, false),
				room({ displayname: 'D', roomBuildingAddress: 'Amsterdam, Straat 3' }),
			])

			expect(groups.map((group) => group.name)).toEqual(['Amsterdam', 'Utrecht', 'Other rooms'])
			expect(groups[0].rooms.map((entry) => entry.principal.displayname)).toEqual(['D', 'C'])
			expect(groups[0].availableCount).toBe(1)
		})
	})
})
