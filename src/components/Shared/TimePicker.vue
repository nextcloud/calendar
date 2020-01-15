<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  -
  - @license GNU AGPL version 3 or any later version
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
  -->

<template>
	<DatetimePicker
		:lang="lang"
		:first-day-of-week="firstDay"
		:format="format"
		:value="date"
		type="time"
		:clearable="false"
		:minute-step="5"
		@change="change" />
</template>

<script>
import { DatetimePicker } from '@nextcloud/vue/dist/Components/DatetimePicker'
import moment from '@nextcloud/moment'
import { mapState } from 'vuex'
import { getDayNamesShort, getFirstDay, getMonthNamesShort } from '@nextcloud/l10n'

export default {
	name: 'TimePicker',
	components: {
		DatetimePicker,
	},
	props: {
		date: {
			type: Date,
			required: true,
		},
	},
	data() {
		return {
			lang: {
				days: getDayNamesShort(),
				months: getMonthNamesShort(),
				placeholder: {
					date: this.$t('calendar', 'Select Date'),
				},
			},
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
		 * @returns {String}
		 */
		stringify(date) {
			return moment(date).locale(this.locale).format('LT')
		},
		/**
		 * Parses the user input from the input field
		 *
		 * @param {String} value The user-input to be parsed
		 * @returns {Date}
		 */
		parse(value) {
			return moment(value, 'LT', this.locale).toDate()
		},
	},
}
</script>
