<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="resource-room-type">
		<div class="resource-room-type__input">
			<NcSelect
				v-model="selectedOption"
				:options="options"
				:placeholder="placeholder"
				:clearable="false"
				:labelOutside="true"
				inputId="value"
				label="label">
				<template #option="option">
					<div>{{ option.label !== null ? option.label : "" }}</div>
				</template>
			</NcSelect>
		</div>
	</div>
</template>

<script>
import { NcSelect } from '@nextcloud/vue'
import { getAllRoomTypes } from '../../../models/resourceProps.js'

export default {
	name: 'ResourceRoomType',
	components: {
		NcSelect,
	},

	props: {
		modelValue: {
			type: String,
			required: true,
		},
	},

	emits: ['update:modelValue'],

	computed: {
		placeholder() {
			return this.$t('calendar', 'Room type')
		},

		options() {
			return [
				{ value: '', label: this.$t('calendar', 'Any') },
				...getAllRoomTypes(),
			]
		},

		selectedOption: {
			get() {
				return this.getOption(this.modelValue)
			},

			set(option) {
				const value = option?.value ?? ''
				this.$emit('update:modelValue', value)
			},
		},
	},

	methods: {
		getOption(value) {
			// Selecting 'Any' will reset the input
			if (value === '') {
				return undefined
			}

			return this.options.find((option) => option.value === value)
		},
	},
}
</script>

<style scoped>
:deep(#value) {
  width: 0;
}
</style>
