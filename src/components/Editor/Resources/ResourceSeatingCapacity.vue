<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="resource-capacity">
		<NcTextField :label="placeholder"
			type="number"
			min="0"
			:placeholder="placeholder"
			:value="value"
			@input="changeValue" />
	</div>
</template>

<script>
import NcTextField from '@nextcloud/vue/dist/Components/NcTextField.js'
export default {
	name: 'ResourceSeatingCapacity',
	components: {
		NcTextField,
	},
	props: {
		value: {
			type: Number,
			required: true,
		},
	},
	computed: {
		placeholder() {
			return this.$t('calendar', 'Minimum seating capacity')
		},
	},
	methods: {
		changeValue(event) {
			this.$emit('update:value', parseInt(event.target.value))
		},
	},
}
</script>

<style lang="scss" scoped>
.resource-capacity {
	padding-bottom: 2px;
}
</style>
