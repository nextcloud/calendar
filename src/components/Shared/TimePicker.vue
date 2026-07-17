<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<DateTimePicker
		:value="date"
		type="time"
		:hideLabel="true"
		v-bind="$attrs"
		@input="change" />
</template>

<script>
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
		 * @param {Date} date The new Date object
		 */
		change(date) {
			this.$emit('change', date)
		},
	},
}
</script>
