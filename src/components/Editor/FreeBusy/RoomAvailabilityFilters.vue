<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div class="availability-filters">
		<NcTextField
			class="availability-filters__search"
			:label="$t('calendar', 'Search by name')"
			:placeholder="$t('calendar', 'Search by name')"
			:modelValue="filters.searchTerm ?? ''"
			@update:modelValue="setFilter('searchTerm', $event)" />

		<NcSelect
			class="availability-filters__building"
			:options="buildingOptions"
			:modelValue="selectedOption('building', buildingOptions)"
			:placeholder="$t('calendar', 'Building')"
			:labelOutside="true"
			label="label"
			@update:modelValue="setSelect('building', $event)" />

		<div class="availability-filters__controls">
			<NcSelect
				class="availability-filters__control"
				:options="roomTypeOptions"
				:modelValue="selectedOption('roomType', roomTypeOptions)"
				:placeholder="$t('calendar', 'Room type')"
				:labelOutside="true"
				label="label"
				@update:modelValue="setSelect('roomType', $event)" />
			<NcSelect
				class="availability-filters__control"
				:options="storyOptions"
				:modelValue="selectedOption('story', storyOptions)"
				:placeholder="$t('calendar', 'Story')"
				:labelOutside="true"
				label="label"
				@update:modelValue="setSelect('story', $event)" />
			<NcSelect
				class="availability-filters__control"
				:options="roomNumberOptions"
				:modelValue="selectedOption('roomNumber', roomNumberOptions)"
				:placeholder="$t('calendar', 'Room number')"
				:labelOutside="true"
				label="label"
				@update:modelValue="setSelect('roomNumber', $event)" />
			<NcSelect
				class="availability-filters__control"
				:options="featureOptions"
				:modelValue="selectedOptions('features', featureOptions)"
				:placeholder="$t('calendar', 'Features')"
				:multiple="true"
				:labelOutside="true"
				label="label"
				@update:modelValue="setMultiSelect('features', $event)" />
			<NcTextField
				class="availability-filters__control"
				type="number"
				min="0"
				:label="$t('calendar', 'Minimum seating capacity')"
				:modelValue="String(filters.minSeatingCapacity ?? '')"
				@update:modelValue="setMinimum('minSeatingCapacity', $event)" />
		</div>
	</div>
</template>

<script>
import { NcSelect, NcTextField } from '@nextcloud/vue'
import availabilityFiltersMixin from '../../../mixins/availabilityFiltersMixin.js'
import { getAllRoomFeatures } from '../../../models/resourceProps.js'

export default {
	name: 'RoomAvailabilityFilters',
	components: {
		NcSelect,
		NcTextField,
	},

	mixins: [availabilityFiltersMixin],

	props: {
		/**
		 * The distinct room types present, sorted
		 */
		roomTypes: {
			type: Array,
			default: () => [],
		},

		/**
		 * The distinct buildings present, sorted
		 */
		buildings: {
			type: Array,
			default: () => [],
		},

		/**
		 * The distinct stories present, sorted
		 */
		stories: {
			type: Array,
			default: () => [],
		},

		/**
		 * The distinct room numbers present, sorted
		 */
		roomNumbers: {
			type: Array,
			default: () => [],
		},
	},

	emits: ['update:filters'],

	computed: {
		/**
		 * @return {{value: string, label: string}[]} The room type options
		 */
		roomTypeOptions() {
			return this.toOptions(this.roomTypes)
		},

		/**
		 * @return {{value: string, label: string}[]} The building options
		 */
		buildingOptions() {
			return this.toOptions(this.buildings)
		},

		/**
		 * @return {{value: string, label: string}[]} The story options
		 */
		storyOptions() {
			return this.toOptions(this.stories)
		},

		/**
		 * @return {{value: string, label: string}[]} The room number options
		 */
		roomNumberOptions() {
			return this.toOptions(this.roomNumbers)
		},

		/**
		 * @return {{value: string, label: string}[]} Every room feature the server knows, with localized labels
		 */
		featureOptions() {
			return getAllRoomFeatures()
		},
	},
}
</script>

<style lang="scss" scoped>
.availability-filters {
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-bottom: 16px;

	&__building {
		width: 100%;
	}

	&__controls {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	&__control {
		min-width: 180px;
	}
}
</style>
