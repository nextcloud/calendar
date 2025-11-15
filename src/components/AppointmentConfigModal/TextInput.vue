<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="text-input">
		<NcTextField
			:modelValue="modelValue"
			:label="label"
			:disabled="disabled"
			@update:modelValue="change" />
	</div>
</template>

<script>
import { NcTextField } from '@nextcloud/vue'

export default {
	name: 'TextInput',
	components: {
		NcTextField,
	},

	props: {
		label: {
			type: String,
			required: true,
		},

		modelValue: {
			type: String,
			default: '',
		},

		disabled: {
			type: Boolean,
			default: false,
		},
	},

	methods: {
		change(value) {
			this.$emit('update:modelValue', value)
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
