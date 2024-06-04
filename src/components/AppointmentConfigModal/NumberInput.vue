<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="number-input">
		<label :for="id">{{ label }}</label>
		<input :id="id"
			type="number"
			min="0"
			:value="realValue"
			@input="change">
	</div>
</template>

<script>
import { randomId } from '../../utils/randomId.js'

export default {
	name: 'NumberInput',
	props: {
		label: {
			type: String,
			required: true,
		},
		value: {
			type: Number,
			default: undefined,
		},
		allowEmpty: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			id: randomId(),
		}
	},
	computed: {
		realValue() {
			if (this.allowEmpty) {
				return this.value
			}

			return this.value ?? 0
		},
	},
	methods: {
		change(e) {
			this.$emit('update:value', parseInt(e.target.value))
		},
	},
}
</script>

<style lang="scss" scoped>
// TODO: move to global scss file
.number-input {
	input {
		width: 100%;
	}
}
</style>
