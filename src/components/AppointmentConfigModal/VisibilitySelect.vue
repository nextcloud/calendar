<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<SelectWrapper
		v-model="selection"
		:label="label"
		:disabled="disabled"
		:options="options" />
</template>

<script>
import SelectWrapper from './SelectWrapper.vue'

export default {
	name: 'VisibilitySelect',
	components: {
		SelectWrapper,
	},

	props: {
		label: {
			type: String,
			default: '',
		},

		modelValue: {
			type: String,
			default: 'PUBLIC',
		},

		disabled: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			options: [
				{
					value: 'PUBLIC',
					label: this.t('calendar', 'Public – shown on the profile page'),
				},
				{
					value: 'PRIVATE',
					label: this.t('calendar', 'Private – only accessible via secret link'),
				},
			],
		}
	},

	computed: {
		selection: {
			get() {
				return this.modelValue
			},

			set(value) {
				this.$emit('update:modelValue', value)
			},
		},
	},
}
</script>
