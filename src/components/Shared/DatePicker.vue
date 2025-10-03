<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<DateTimePicker
		id="date-time-picker-input"
		:min="minimumDate"
		:max="maximumDate"
		:value="date"
		:type="type"
		:hide-label="true"
		class="date-time-picker"
		@blur="onBlur"
		@input="onInput" />
</template>

<script>
import {
	NcDateTimePickerNative as DateTimePicker,
} from '@nextcloud/vue'
import { mapStores } from 'pinia'
import useDavRestrictionsStore from '../../store/davRestrictions.js'

export default {
	name: 'DatePicker',
	components: {
		DateTimePicker,
	},

	props: {
		date: {
			type: Date,
			required: true,
		},

		prefix: {
			type: String,
			default: null,
		},

		min: {
			type: Date,
			default: null,
		},

		max: {
			type: Date,
			default: null,
		},

		type: {
			type: String,
			default: 'date',
		},
	},

	data() {
		return {
			pendingDate: null,
		}
	},

	computed: {
		...mapStores(useDavRestrictionsStore),
		/**
		 * The earliest date a user is allowed to pick in the timezone
		 *
		 * @return {Date}
		 */
		minimumDate() {
			return this.min || new Date(this.davRestrictionsStore.minimumDate)
		},

		/**
		 * The latest date a user is allowed to pick in the timezone
		 *
		 * @return {Date}
		 */
		maximumDate() {
			return this.max || new Date(this.davRestrictionsStore.maximumDate)
		},
	},

	methods: {
		/**
		 * Emits a change event for the Date
		 *
		 * @param {Date} date The new Date object
		 */
		onInput(date) {
			// Buffer the input; only emit when the user leaves the field
			if (this.disabledDate(date)) {
				return
			}
			this.pendingDate = date
		},

		onBlur(event) {
			// When focus leaves the picker, commit the pending date
			if (this.pendingDate === undefined || this.pendingDate === null) {
				return
			}
			const pending = this.pendingDate
			this.pendingDate = null
			if (this.disabledDate(pending)) {
				return
			}
			this.$emit('change', pending)
		},

		/**
		 * Whether or not the date is acceptable
		 *
		 * @param {Date} date The date to compare to
		 * @return {boolean}
		 */
		disabledDate(date) {
			return date < this.minimumDate || date > this.maximumDate
		},
	},
}
</script>
