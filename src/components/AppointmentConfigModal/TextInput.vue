<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="text-input">
		<label :for="id">{{ label }}</label>
		<input :id="id"
			type="text"
			:value="value"
			:disabled="disabled"
			@input="change">
	</div>
</template>

<script>
import { randomId } from '../../utils/randomId.js'

export default {
	name: 'TextInput',
	props: {
		label: {
			type: String,
			required: true,
		},
		value: {
			type: String,
			default: '',
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			id: randomId(),
		}
	},
	methods: {
		change(e) {
			this.$emit('update:value', e.target.value)
		},
	},
}
</script>

<style lang="scss" scoped>
// TODO: move to global scss file
.text-input {
	input {
		width: 100%;
	}
}
</style>
