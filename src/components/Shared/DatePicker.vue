<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<!--
	`format` is specified as a workaround for https://github.com/nextcloud/calendar/issues/8307
	until the issue is fixed in `@nextcloud/vue`.

	This works because `@vuepic/vue-datepicker` can use it to parse text inputs from the user
	when providing a format as pattern string (and not a one-way function).
	-->
	<DateTimePicker
		:ariaLabel="ariaLabel"
		:min="minimumDate"
		:max="maximumDate"
		:modelValue="date"
		:type="type"
		class="date-time-picker"
		:format="formatStr"
		@blur="onBlur"
		@update:modelValue="onInput" />
</template>

<script>
import { getCanonicalLocale } from '@nextcloud/l10n'
import {
	NcDateTimePicker as DateTimePicker,
} from '@nextcloud/vue'
import { getDateLocalePattern, getDateTimeLocalePattern, getTimeLocalePattern } from 'datetime-locale-patterns'
import { mapStores } from 'pinia'
import useDavRestrictionsStore from '../../store/davRestrictions.js'

const canonicalLocale = getCanonicalLocale()

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

		ariaLabel: {
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

	emits: ['change'],

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
			if (!this.min && this.type === 'time') {
				return null
			}

			return this.min || new Date(this.davRestrictionsStore.minimumDate)
		},

		/**
		 * The latest date a user is allowed to pick in the timezone
		 *
		 * @return {Date}
		 */
		maximumDate() {
			if (!this.max && this.type === 'time') {
				return null
			}

			return this.max || new Date(this.davRestrictionsStore.maximumDate)
		},

		/**
		 * Returns the date format pattern for the current picker type.
		 *
		 * See https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
		 *
		 * @return {string | undefined} A format pattern or `undefined` to use the default `NcDateTimePicker` formatting.
		 */
		formatStr() {
			// Match logic from https://github.com/nextcloud-libraries/nextcloud-vue/blob/v9.8.0/src/components/NcDateTimePicker/NcDateTimePicker.vue#L549
			if (this.type === 'date' || this.type === 'date-range') {
				return getDateLocalePattern(canonicalLocale, { dateStyle: 'medium' })
			} else if (this.type === 'time' || this.type === 'time-range') {
				return getTimeLocalePattern(canonicalLocale, { timeStyle: 'short' })
			} else if (this.type === 'datetime' || this.type === 'datetime-range') {
				return getDateTimeLocalePattern(canonicalLocale, { dateStyle: 'medium', timeStyle: 'short' })
			} else {
				// 'datetime-locale-patterns' does not support `month` and `year`.
				// So fall back to default formatting.
				return undefined
			}
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

		onBlur() {
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
			if (!this.max && !this.min && this.type === 'time') {
				return false
			}

			return date < this.minimumDate || date > this.maximumDate
		},
	},
}
</script>
