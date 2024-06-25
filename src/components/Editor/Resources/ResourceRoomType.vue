<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="resource-room-type">
		<div class="resource-room-type__input">
			<NcSelect :value="getOption(value)"
				:options="options"
				:placeholder="placeholder"
				:clearable="false"
				:label-outside="true"
				input-id="value"
				label="label"
				@option:selected="changeValue">
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
		value: {
			type: String,
			required: true,
		},
	},
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
	},
	methods: {
		getOption(value) {
			// Selecting 'Any' will reset the input
			if (value === '') {
				return undefined
			}

			return this.options.find(option => option.value === value)
		},
		changeValue(option) {
			this.$emit('update:value', option.value)
		},
	},
}
</script>

<style scoped>
:deep(#value) {
  width: 0;
}
</style>
