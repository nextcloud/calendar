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
		:type="type"
		:clearable="false"
		:minute-step="5"
		:not-before="minimumDate"
		:not-after="maximumDate"
		@change="change">
		<template
			slot="calendar-icon">
			<button
				class="datetime-picker-inline-icon icon"
				:class="{'icon-timezone': !isAllDay, 'icon-new-calendar': isAllDay, 'datetime-picker-inline-icon--highlighted': highlightTimezone}"
				@click.stop.prevent="toggleTimezonePopover"
				@mousedown.stop.prevent="() => {}" />
			<Popover
				:open.sync="showTimezonePopover"
				open-class="timezone-popover-wrapper">
				<div class="timezone-popover-wrapper__title">
					<strong>
						{{ $t('calendar', 'Please select a timezone:') }}
					</strong>
				</div>
				<TimezoneSelect
					class="timezone-popover-wrapper__timezone-select"
					:value="timezoneId"
					@change="changeTimezone" />
			</Popover>
		</template>
	</DatetimePicker>
</template>

<script>
import { DatetimePicker } from '@nextcloud/vue/dist/Components/DatetimePicker'
import { Popover } from '@nextcloud/vue/dist/Components/Popover'
import { getDayNamesShort, getMonthNamesShort, getFirstDay } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'

import TimezoneSelect from './TimezoneSelect'
import loadMomentLocalization from '../../utils/moment.js'

export default {
	name: 'DatePicker',
	components: {
		DatetimePicker,
		Popover,
		TimezoneSelect,
	},
	props: {
		date: {
			type: Date,
			required: true,
		},
		hasTimezone: {
			type: Boolean,
			default: false,
		},
		timezoneId: {
			type: String,
			default: null,
		},
		prefix: {
			type: String,
			default: null,
		},
		isAllDay: {
			type: Boolean,
			required: true,
		},
		userTimezoneId: {
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
	},
	data() {
		return {
			locale: 'en',
			lang: {
				days: getDayNamesShort(),
				months: getMonthNamesShort(),
				placeholder: {
					date: this.$t('calendar', 'Select Date'),
				},
			},
			firstDay: getFirstDay() === 0 ? 7 : getFirstDay(),
			showTimezonePopover: false,
		}
	},
	computed: {
		/**
		 * Whether or not to highlight the timezone-icon.
		 * The icon is highlighted when the selected timezone
		 * does not equal the current user's timezone
		 *
		 * @returns {Boolean}
		 */
		highlightTimezone() {
			if (this.isAllDay) {
				return true
			}

			return this.timezoneId !== this.userTimezoneId
		},
		/**
		 * Formats the date string
		 *
		 * @returns {String}
		 */
		format() {
			const dateFormat = moment.localeData(this.locale).longDateFormat('L')
			const timeFormat = moment.localeData(this.locale).longDateFormat('LT')

			if (this.isAllDay) {
				switch (this.prefix) {
				case 'from':
					return this.$t('calendar', '[from] {dateFormat}', { dateFormat })

				case 'to':
					return this.$t('calendar', '[to] {dateFormat}', { dateFormat })

				case 'on':
					return this.$t('calendar', '[on] {dateFormat}', { dateFormat })

				default:
					return dateFormat
				}
			} else {
				switch (this.prefix) {
				case 'from':
					return this.$t('calendar', '[from] {dateFormat} [at] {timeFormat}', { dateFormat, timeFormat })

				case 'to':
					return this.$t('calendar', '[to] {dateFormat} [at] {timeFormat}', { dateFormat, timeFormat })

				case 'on':
					return this.$t('calendar', '[on] {dateFormat} [at] {timeFormat}', { dateFormat, timeFormat })

				default:
					return this.$t('calendar', '{dateFormat} [at] {timeFormat}', { dateFormat, timeFormat })
				}
			}
		},
		/**
		 * Type of the DatePicker.
		 * Ether date if allDay or datetime
		 *
		 * @returns {String}
		 */
		type() {
			if (this.isAllDay) {
				return 'date'
			}

			return 'datetime'
		},
		/**
		 * The earliest date a user is allowed to pick in the timezone
		 *
		 * @returns {Date}
		 */
		minimumDate() {
			return this.min || new Date(this.$store.state.davRestrictions.minimumDate)
		},
		/**
		 * The latest date a user is allowed to pick in the timezone
		 *
		 * @returns {Date}
		 */
		maximumDate() {
			return this.max || new Date(this.$store.state.davRestrictions.maximumDate)
		},
	},
	async mounted() {
		this.locale = await loadMomentLocalization()
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
		 * Emits a change event for the Timezone
		 *
		 * @param {String} timezoneId The new timezoneId
		 */
		changeTimezone(timezoneId) {
			this.$emit('changeTimezone', timezoneId)
		},
		/**
		 * Toggles the visibility of the timezone popover
		 */
		toggleTimezonePopover() {
			if (this.isAllDay) {
				return
			}

			this.showTimezonePopover = !this.showTimezonePopover
		},
	},
}
</script>
