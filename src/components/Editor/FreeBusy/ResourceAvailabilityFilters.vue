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

		<div class="availability-filters__controls">
			<NcSelect
				class="availability-filters__control"
				:options="resourceTypeOptions"
				:modelValue="selectedOption('resourceType', resourceTypeOptions)"
				:placeholder="$t('calendar', 'Resource type')"
				:labelOutside="true"
				label="label"
				@update:modelValue="setSelect('resourceType', $event)" />
			<NcSelect
				class="availability-filters__control"
				:options="vehicleTypeOptions"
				:modelValue="selectedOption('vehicleType', vehicleTypeOptions)"
				:placeholder="$t('calendar', 'Vehicle type')"
				:labelOutside="true"
				label="label"
				@update:modelValue="setSelect('vehicleType', $event)" />
			<NcSelect
				class="availability-filters__control"
				:options="vehicleMakeOptions"
				:modelValue="selectedOption('vehicleMake', vehicleMakeOptions)"
				:placeholder="$t('calendar', 'Vehicle make')"
				:labelOutside="true"
				label="label"
				@update:modelValue="setSelect('vehicleMake', $event)" />
			<NcSelect
				class="availability-filters__control"
				:options="vehicleModelOptions"
				:modelValue="selectedOption('vehicleModel', vehicleModelOptions)"
				:placeholder="$t('calendar', 'Vehicle model')"
				:labelOutside="true"
				label="label"
				@update:modelValue="setSelect('vehicleModel', $event)" />
			<NcTextField
				class="availability-filters__control"
				type="number"
				min="0"
				:label="$t('calendar', 'Minimum seating capacity')"
				:modelValue="String(filters.minSeatingCapacity ?? '')"
				@update:modelValue="setMinimum('minSeatingCapacity', $event)" />
			<NcTextField
				class="availability-filters__control"
				type="number"
				min="0"
				:label="$t('calendar', 'Minimum range')"
				:modelValue="String(filters.minRange ?? '')"
				@update:modelValue="setMinimum('minRange', $event)" />
			<NcCheckboxRadioSwitch
				class="availability-filters__control"
				:modelValue="filters.isElectric === true"
				@update:modelValue="setFilter('isElectric', $event)">
				{{ $t('calendar', 'Electric') }}
			</NcCheckboxRadioSwitch>
		</div>
	</div>
</template>

<script>
import { NcCheckboxRadioSwitch, NcSelect, NcTextField } from '@nextcloud/vue'
import availabilityFiltersMixin from '../../../mixins/availabilityFiltersMixin.js'

export default {
	name: 'ResourceAvailabilityFilters',
	components: {
		NcCheckboxRadioSwitch,
		NcSelect,
		NcTextField,
	},

	mixins: [availabilityFiltersMixin],

	props: {
		/**
		 * The distinct resource types present, sorted
		 */
		resourceTypes: {
			type: Array,
			default: () => [],
		},

		/**
		 * The distinct vehicle types present, sorted
		 */
		vehicleTypes: {
			type: Array,
			default: () => [],
		},

		/**
		 * The distinct vehicle makes present, sorted
		 */
		vehicleMakes: {
			type: Array,
			default: () => [],
		},

		/**
		 * The distinct vehicle models present, sorted
		 */
		vehicleModels: {
			type: Array,
			default: () => [],
		},
	},

	emits: ['update:filters'],

	computed: {
		/**
		 * @return {{value: string, label: string}[]} The resource type options
		 */
		resourceTypeOptions() {
			return this.toOptions(this.resourceTypes)
		},

		/**
		 * @return {{value: string, label: string}[]} The vehicle type options
		 */
		vehicleTypeOptions() {
			return this.toOptions(this.vehicleTypes)
		},

		/**
		 * @return {{value: string, label: string}[]} The vehicle make options
		 */
		vehicleMakeOptions() {
			return this.toOptions(this.vehicleMakes)
		},

		/**
		 * @return {{value: string, label: string}[]} The vehicle model options
		 */
		vehicleModelOptions() {
			return this.toOptions(this.vehicleModels)
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
