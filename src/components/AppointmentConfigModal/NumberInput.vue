<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="number-input">
		<NcTextField
			:modelValue="String(realValue ?? '')"
			:label="label"
			type="number"
			@update:modelValue="change" />
	</div>
</template>

<script>
import { NcTextField } from '@nextcloud/vue'

export default {
	name: 'NumberInput',
	components: {
		NcTextField,
	},

	props: {
		label: {
			type: String,
			required: true,
		},

		modelValue: {
			type: Number,
			default: undefined,
		},

		allowEmpty: {
			type: Boolean,
			default: false,
		},
	},

	computed: {
		realValue() {
			if (this.allowEmpty) {
				return this.modelValue
			}

			return this.modelValue ?? 0
		},
	},

	methods: {
		change(value) {
			this.$emit('update:modelValue', parseInt(value))
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
