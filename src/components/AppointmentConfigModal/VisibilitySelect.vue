<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<SelectWrapper :label="label"
		:value="value"
		:disabled="disabled"
		:options="options"
		@update:value="$emit('update:value', $event)" />
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
		value: {
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
}
</script>
