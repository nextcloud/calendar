/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { MaybeRefOrGetter } from 'vue'
import type {
	RoomFilterOption,
	RoomFilterState,
	RoomGroup,
	RoomOption,
} from '@/utils/roomFilter'

import { computed, ref, toValue } from 'vue'
import {
	buildBuildingOptions,
	buildFeatureOptions,
	buildStoryOptions,
	filterRooms,
	groupRoomsByBuilding,
} from '@/utils/roomFilter'

/**
 * Search and filter state for a list of rooms
 *
 * @remarks
 * Filter options are derived from the full room list, not from the filtered
 * one, so selecting a building does not empty the other dropdowns.
 *
 * @param rooms All rooms to search through
 * @param pinnedEmails Emails of rooms that stay visible whatever the filters say
 * @return Filter state, the options to render, and the filtered results
 */
export function useRoomFilter(
	rooms: MaybeRefOrGetter<RoomOption[]>,
	pinnedEmails: MaybeRefOrGetter<string[]> = [],
) {
	const searchText = ref('')
	const selectedBuilding = ref<string | null>(null)
	const selectedStory = ref<string | null>(null)
	const minimumSeatingCapacity = ref(0)
	const selectedFeatures = ref<string[]>([])

	const buildingOptions = computed<RoomFilterOption[]>(() => buildBuildingOptions(toValue(rooms)))
	const storyOptions = computed<RoomFilterOption[]>(() => buildStoryOptions(toValue(rooms)))
	const featureOptions = computed<RoomFilterOption[]>(() => buildFeatureOptions(toValue(rooms)))

	const filters = computed<RoomFilterState>(() => ({
		searchText: searchText.value,
		building: selectedBuilding.value,
		story: selectedStory.value,
		minimumSeatingCapacity: minimumSeatingCapacity.value,
		features: selectedFeatures.value,
	}))

	const hasActiveFilters = computed<boolean>(() => {
		return searchText.value.trim() !== ''
			|| selectedBuilding.value !== null
			|| selectedStory.value !== null
			|| minimumSeatingCapacity.value > 0
			|| selectedFeatures.value.length > 0
	})

	const roomsFiltered = computed<RoomOption[]>(() => {
		return filterRooms(toValue(rooms), filters.value, toValue(pinnedEmails))
	})

	const groupedRooms = computed<RoomGroup[]>(() => {
		return groupRoomsByBuilding(roomsFiltered.value, toValue(pinnedEmails))
	})

	/**
	 * Clear every filter
	 */
	function resetFilters(): void {
		searchText.value = ''
		selectedBuilding.value = null
		selectedStory.value = null
		minimumSeatingCapacity.value = 0
		selectedFeatures.value = []
	}

	return {
		searchText,
		selectedBuilding,
		selectedStory,
		minimumSeatingCapacity,
		selectedFeatures,
		buildingOptions,
		storyOptions,
		featureOptions,
		hasActiveFilters,
		roomsFiltered,
		groupedRooms,
		resetFilters,
	}
}
