<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<DateTimePicker
		v-model="timePickerValue"
		type="time"
		:hideLabel="true"
		v-bind="$attrs"
		@blur="restoreLastValidDate" />
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

	data(): { timePickerValue: Date | null } {
		return {
			timePickerValue: this.date,
		}
	},

	watch: {
		timePickerValue(date) {
			if (date === null) {
				return
			}
			this.$emit('change', date)
		},
	},

	methods: {
		restoreLastValidDate() {
			this.timePickerValue = this.date
		},
	},
}
</script>
