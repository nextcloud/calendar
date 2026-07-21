<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<DateTimePicker
		:modelValue="date"
		type="time"
		:hideLabel="true"
		v-bind="$attrs"
		@update:modelValue="change" />
</template>

<script lang="ts">
import { NcDateTimePickerNative as DateTimePicker } from '@nextcloud/vue'

export default {
	name: 'TimePicker',
	components: {
		DateTimePicker,
	},

	props: {
		date: {
			type: Date,
			required: true,
		},
	},

	emits: ['change'],

	data() {
		return {
		}
	},

	methods: {
		/**
		 * Emits a change event for the Date
		 *
		 * @param date - The new Date object, or `null` if the date is cleared by the user.
		 */
		change(date: Date | null) {
			this.$emit('change', date)
		},
	},
}
</script>
