<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<DateTimePicker
		v-model="internalValue"
		type="time"
		:hideLabel="true"
		v-bind="$attrs"
		@blur="restoreClearedInput" />
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
			cleared: false,
		}
	},

	computed: {
		/**
		 * Value displayed and manipulated by the wrapped NcDateTimePickerNative.
		 * Coordinates passing the `date` and emitting changes to it
		 * while tracking an intermediate state where NcDateTimePickerNative is cleared.
		 */
		internalValue: {
			get() {
				if (this.cleared) {
					return null
				}
				return this.date
			},

			set(newValue) {
				if (newValue === null) {
					this.cleared = true
					return
				}
				this.cleared = false
				if (this.date.getHours() !== newValue.getHours() || this.date.getMinutes() !== newValue.getMinutes()) {
					this.$emit('change', newValue)
				}
			},
		},
	},

	methods: {
		/**
		 * Restores last valid date into a input, if input is cleared.
		 */
		restoreClearedInput() {
			this.cleared = false
		},
	},
}
</script>
