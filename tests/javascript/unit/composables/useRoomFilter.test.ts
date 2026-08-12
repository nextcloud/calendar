/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { RoomOption } from '@/types/models/roomFilter'

import { ref } from 'vue'
import { useRoomFilter } from '@/composables/useRoomFilter'

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

const rooms: RoomOption[] = [
	room({
		displayname: 'Aula',
		emailAddress: 'aula@example.com',
		roomBuildingAddress: 'Poppodium, Kerkstraat 10',
		roomBuildingStory: '1',
		roomSeatingCapacity: 100,
		roomFeatures: ['PROJECTOR'],
	}),
	room({
		displayname: 'Vergaderzaal',
		emailAddress: 'vergaderzaal@example.com',
		roomBuildingAddress: 'Poppodium, Kerkstraat 10',
		roomBuildingStory: '2',
		roomSeatingCapacity: 8,
		roomFeatures: ['PROJECTOR', 'WHITEBOARD'],
	}),
	room({
		displayname: 'Bibliotheek',
		emailAddress: 'bibliotheek@example.com',
		roomBuildingAddress: 'Stadskantoor, Marktplein 1',
		roomSeatingCapacity: 20,
		isAvailable: false,
	}),
]

describe('Test suite: useRoomFilter (composables/useRoomFilter.ts)', () => {
	it('should return every room when no filter is set', () => {
		const { roomsFiltered, hasActiveFilters } = useRoomFilter(rooms)

		expect(roomsFiltered.value).toHaveLength(3)
		expect(hasActiveFilters.value).toBe(false)
	})

	it('should derive filter options from all rooms', () => {
		const { buildingOptions, storyOptions, featureOptions } = useRoomFilter(rooms)

		expect(buildingOptions.value.map((option) => option.id)).toEqual(['Poppodium', 'Stadskantoor'])
		expect(storyOptions.value.map((option) => option.id)).toEqual(['1', '2'])
		expect(featureOptions.value.map((option) => option.label)).toEqual(['Projector', 'Whiteboard'])
	})

	it('should keep the options stable while a filter is applied', () => {
		const { buildingOptions, selectedBuilding, roomsFiltered } = useRoomFilter(rooms)

		selectedBuilding.value = 'Poppodium'

		expect(roomsFiltered.value.map((entry) => entry.displayname)).toEqual(['Aula', 'Vergaderzaal'])
		expect(buildingOptions.value).toHaveLength(2)
	})

	it('should combine filters', () => {
		const { selectedBuilding, minimumSeatingCapacity, roomsFiltered } = useRoomFilter(rooms)

		selectedBuilding.value = 'Poppodium'
		minimumSeatingCapacity.value = 50

		expect(roomsFiltered.value.map((entry) => entry.displayname)).toEqual(['Aula'])
	})

	it('should search case-insensitively', () => {
		const { searchText, roomsFiltered, hasActiveFilters } = useRoomFilter(rooms)

		searchText.value = 'BIBLIO'

		expect(roomsFiltered.value.map((entry) => entry.displayname)).toEqual(['Bibliotheek'])
		expect(hasActiveFilters.value).toBe(true)
	})

	it('should keep pinned rooms visible while filtering', () => {
		const { searchText, roomsFiltered } = useRoomFilter(rooms, ['bibliotheek@example.com'])

		searchText.value = 'aula'

		expect(roomsFiltered.value.map((entry) => entry.displayname)).toEqual(['Aula', 'Bibliotheek'])
	})

	it('should group the filtered rooms by building', () => {
		const { groupedRooms } = useRoomFilter(rooms)

		expect(groupedRooms.value.map((group) => group.name)).toEqual(['Poppodium', 'Stadskantoor'])
		expect(groupedRooms.value[0].availableCount).toBe(2)
		expect(groupedRooms.value[1].availableCount).toBe(0)
	})

	it('should react to a changing room list', () => {
		const source = ref<RoomOption[]>([])
		const { buildingOptions, roomsFiltered } = useRoomFilter(source)

		expect(roomsFiltered.value).toHaveLength(0)

		source.value = rooms

		expect(roomsFiltered.value).toHaveLength(3)
		expect(buildingOptions.value).toHaveLength(2)
	})

	it('should clear every filter on reset', () => {
		const filter = useRoomFilter(rooms)

		filter.searchText.value = 'aula'
		filter.selectedBuilding.value = 'Poppodium'
		filter.selectedStory.value = '1'
		filter.minimumSeatingCapacity.value = 10
		filter.selectedFeatures.value = ['PROJECTOR']

		filter.resetFilters()

		expect(filter.hasActiveFilters.value).toBe(false)
		expect(filter.roomsFiltered.value).toHaveLength(3)
	})
})
