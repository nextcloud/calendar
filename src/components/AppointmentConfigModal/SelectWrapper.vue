<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div>
		<label v-if="label" :for="id">{{ label }}</label>
		<select :id="id"
			:disabled="disabled"
			@change="onSelect">
			<option v-for="option in options"
				:key="option.value"
				:value="option.value"
				v-bind="{ selected: option.value === value }">
				{{ option.label }}
			</option>
		</select>
	</div>
</template>

<script>
import { randomId } from '../../utils/randomId.js'

export default {
	name: 'SelectWrapper',
	props: {
		label: {
			type: String,
			default: '',
		},
		value: {
			type: [String, Number],
			required: true,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		options: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
			id: randomId(),
		}
	},
	methods: {
		onSelect(e) {
			this.$emit('update:value', e.target.value)
		},
	},
}
</script>

<style lang="scss" scoped>
select {
	width: 100%;
}
</style>
