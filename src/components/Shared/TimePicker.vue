<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<DateTimePicker ::clearable="false"
		:first-day-of-week="firstDay"
		:format="format"
		:lang="lang"
		:minute-step="5"
		:show-second="false"
		type="time"
		:use12h="showAmPm"
		:value="date"
		v-bind="$attrs"
		v-on="$listeners"
		@change="change" />
</template>

<script>
import { NcDateTimePicker as DateTimePicker } from '@nextcloud/vue'
import moment from '@nextcloud/moment'
import { mapState } from 'vuex'
import {
	getFirstDay,
} from '@nextcloud/l10n'
import { getLangConfigForVue2DatePicker } from '../../utils/localization.js'

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
	data() {
		return {
			firstDay: getFirstDay() === 0 ? 7 : getFirstDay(),
			format: {
				stringify: this.stringify,
				parse: this.parse,
			},
		}
	},
	computed: {
		...mapState({
			locale: (state) => state.settings.momentLocale,
		}),
		/**
		 * Returns the lang config for vue2-datepicker
		 *
		 * @return {object}
		 */
		lang() {
			return getLangConfigForVue2DatePicker(this.locale)
		},
		/**
		 * Whether or not to offer am/pm in the timepicker
		 *
		 * @return {boolean}
		 */
		showAmPm() {
			const localeData = moment().locale(this.locale).localeData()
			const timeFormat = localeData.longDateFormat('LT').toLowerCase()

			return timeFormat.indexOf('a') !== -1
		},
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
		/**
		 * Formats the date string
		 *
		 * @param {Date} date The date for format
		 * @return {string}
		 */
		stringify(date) {
			return moment(date).locale(this.locale).format('LT')
		},
		/**
		 * Parses the user input from the input field
		 *
		 * @param {string} value The user-input to be parsed
		 * @return {Date}
		 */
		parse(value) {
			return moment(value, 'LT', this.locale).toDate()
		},
	},
}
</script>
