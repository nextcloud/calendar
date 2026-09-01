<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="resource-capacity">
		<NcTextField
			:label="placeholder"
			type="number"
			min="0"
			:placeholder="placeholder"
			:modelValue="modelValue"
			@update:modelValue="changeValue" />
	</div>
</template>

<script>
import NcTextField from '@nextcloud/vue/components/NcTextField'
export default {
	name: 'ResourceSeatingCapacity',
	components: {
		NcTextField,
	},

	props: {
		modelValue: {
			type: Number,
			required: true,
		},
	},

	emits: ['update:modelValue'],

	computed: {
		placeholder() {
			return this.$t('calendar', 'Minimum seating capacity')
		},
	},

	methods: {
		changeValue(value) {
			const parsedValue = parseInt(value, 10)
			this.$emit('update:modelValue', Number.isNaN(parsedValue) ? NaN : parsedValue)
		},
	},
}
</script>

<style lang="scss" scoped>
.resource-capacity {
	width: 300px;
	padding-bottom: 2px;
}
</style>
