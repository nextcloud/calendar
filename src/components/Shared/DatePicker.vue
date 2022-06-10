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
	<DatetimePicker :lang="lang"
		:first-day-of-week="firstDay"
		:format="'YYYY-MM-DD HH:mm'"
		:formatter="formatter"
		:value="date"
		:type="type"
		:clearable="false"
		:minute-step="5"
		:disabled-date="disabledDate"
		:show-second="false"
		:show-time-panel="showTimePanel"
		:show-week-number="showWeekNumbers"
		:use12h="showAmPm"
		:append-to-body="appendToBody"
		v-bind="$attrs"
		confirm
		v-on="$listeners"
		@close="close"
		@change="change"
		@pick="pickDate">
		<template #icon-calendar>
			<Button type="tertiary-no-background"
				@click.stop.prevent="toggleTimezonePopover"
				@mousedown.stop.prevent="() => {}">
				<template #icon>
					<IconNewCalendar v-if="isAllDay"
						:size="20" />
					<IconTimezone v-else
						:class="{ 'highlighted-timezone-icon': highlightTimezone }"
						:size="20" />
				</template>
			</Button>
			<Popover :open.sync="showTimezonePopover"
				open-class="timezone-popover-wrapper">
				<div class="timezone-popover-wrapper__title">
					<strong>
						{{ $t('calendar', 'Please select a time zone:') }}
					</strong>
				</div>
				<TimezonePicker class="timezone-popover-wrapper__timezone-select"
					:value="timezoneId"
					@input="changeTimezone" />
			</Popover>
		</template>
		<template v-if="!isAllDay"
			#footer>
			<Button v-if="!showTimePanel"
				class="mx-btn mx-btn-text"
				@click="toggleTimePanel">
				{{ $t('calendar', 'Pick a time') }}
			</Button>
			<Button v-else
				class="mx-btn mx-btn-text"
				@click="toggleTimePanel">
				{{ $t('calendar', 'Pick a date') }}
			</Button>
		</template>
	</DatetimePicker>
</template>

<script>
import Button from '@nextcloud/vue/dist/Components/Button'
import DatetimePicker from '@nextcloud/vue/dist/Components/DatetimePicker'
import IconTimezone from 'vue-material-design-icons/Web'
import IconNewCalendar from 'vue-material-design-icons/CalendarBlankOutline'
import Popover from '@nextcloud/vue/dist/Components/Popover'
import {
	getFirstDay,
} from '@nextcloud/l10n'
import moment from '@nextcloud/moment'
import { mapState } from 'vuex'
import {
	showError,
} from '@nextcloud/dialogs'

import TimezonePicker from '@nextcloud/vue/dist/Components/TimezonePicker'
import { getLangConfigForVue2DatePicker } from '../../utils/localization.js'

export default {
	name: 'DatePicker',
	components: {
		Button,
		DatetimePicker,
		Popover,
		TimezonePicker,
	  IconTimezone,
	  IconNewCalendar,
	},
	props: {
		date: {
			type: Date,
			required: true,
		},
		timezoneId: {
			type: String,
			default: 'floating',
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
		appendToBody: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			firstDay: getFirstDay() === 0 ? 7 : getFirstDay(),
			showTimezonePopover: false,
			formatter: {
				stringify: this.stringify,
				parse: this.parse,
			},
			showTimePanel: true,
		}
	},
	computed: {
		...mapState({
			locale: (state) => state.settings.momentLocale,
			showWeekNumbers: (state) => state.settings.showWeekNumbers,
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
		 * Whether or not to highlight the timezone-icon.
		 * The icon is highlighted when the selected timezone
		 * does not equal the current user's timezone
		 *
		 * @return {boolean}
		 */
		highlightTimezone() {
			if (this.isAllDay) {
				return true
			}

			return this.timezoneId !== this.userTimezoneId
		},
		/**
		 * Type of the DatePicker.
		 * Ether date if allDay or datetime
		 *
		 * @return {string}
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
		 * @return {Date}
		 */
		minimumDate() {
			return this.min || new Date(this.$store.state.davRestrictions.minimumDate)
		},
		/**
		 * The latest date a user is allowed to pick in the timezone
		 *
		 * @return {Date}
		 */
		maximumDate() {
			return this.max || new Date(this.$store.state.davRestrictions.maximumDate)
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
		 * Changes the view to time-picker,
		 * when user picked a date and date-time-picker is not all-day
		 *
		 * @param {Date} date The selected Date object
		 * @param {string} type The type of selected date (Date, Time, ...)
		 */
		pickDate(date, type) {
			if (!this.isAllDay && type === 'date') {
				this.showTimePanel = true
			}
		},
		/**
		 * Emits a change event for the Timezone
		 *
		 * @param {string} timezoneId The new timezoneId
		 */
		changeTimezone(timezoneId) {
			this.$emit('change-timezone', timezoneId)
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
		/**
		 * Reset to time-panel on close of datepicker
		 */
		close() {
			this.showTimePanel = true
			this.$emit('close')
		},
		/**
		 * Toggles the time-picker
		 */
		toggleTimePanel() {
			this.showTimePanel = !this.showTimePanel
		},
		/**
		 * Formats the date string
		 *
		 * @param {Date} date The date for format
		 * @return {string}
		 */
		stringify(date) {
			const formattedDate = moment(date).locale(this.locale).format('L')
			const formattedTime = moment(date).locale(this.locale).format('LT')

			if (this.isAllDay) {
				switch (this.prefix) {
				case 'from':
					return this.$t('calendar', 'from {formattedDate}', { formattedDate })

				case 'to':
					return this.$t('calendar', 'to {formattedDate}', { formattedDate })

				case 'on':
					return this.$t('calendar', 'on {formattedDate}', { formattedDate })

				default:
					return formattedDate
				}
			} else {
				switch (this.prefix) {
				case 'from':
					return this.$t('calendar', 'from {formattedDate} at {formattedTime}', { formattedDate, formattedTime })

				case 'to':
					return this.$t('calendar', 'to {formattedDate} at {formattedTime}', { formattedDate, formattedTime })

				case 'on':
					return this.$t('calendar', 'on {formattedDate} at {formattedTime}', { formattedDate, formattedTime })

				default:
					return this.$t('calendar', '{formattedDate} at {formattedTime}', { formattedDate, formattedTime })
				}
			}
		},
		/**
		 * Parses the user input from the input field
		 *
		 * @param {string} value The user-input to be parsed
		 * @return {Date}
		 */
		parse(value) {
			if (this.isAllDay) {
				let format

				switch (this.prefix) {
				case 'from':
					format = this.$t('calendar', 'from {formattedDate}')
					break

				case 'to':
					format = this.$t('calendar', 'to {formattedDate}')
					break

				case 'on':
					format = this.$t('calendar', 'on {formattedDate}')
					break

				default:
					format = '{formattedDate}'
					break
				}

				const regexString = format
					.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
					.replace(/(?:^|\\})([^{}]+)(?:$|\\{)/g, (fullMatch, groupMatch) => {
						return fullMatch.replace(groupMatch, '(?:' + groupMatch + ')?')
					})
					.replace('\\{formattedDate\\}', '(.*)')
				const regex = new RegExp(regexString)
				const matches = value.match(regex)

				if (!matches) {
					showError(this.$t('calendar', 'Please enter a valid date'))
					// Just return the previous date
					return this.date
				}

				return moment(matches[1], 'L', this.locale).toDate()
			} else {
				let format

				switch (this.prefix) {
				case 'from':
					format = this.$t('calendar', 'from {formattedDate} at {formattedTime}')
					break

				case 'to':
					format = this.$t('calendar', 'to {formattedDate} at {formattedTime}')
					break

				case 'on':
					format = this.$t('calendar', 'on {formattedDate} at {formattedTime}')
					break

				default:
					format = this.$t('calendar', '{formattedDate} at {formattedTime}')
					break
				}

				const escapedFormat = format
					.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
					.replace(/(?:^|\\})([^{}]+)(?:$|\\{)/g, (fullMatch, groupMatch) => {
						return fullMatch.replace(groupMatch, '(?:' + groupMatch + ')?')
					})
				const dateRegexString = escapedFormat
					.replace('\\{formattedDate\\}', '(.*)')
					.replace('\\{formattedTime\\}', '.*')
				const dateRegex = new RegExp(dateRegexString)
				const timeRegexString = escapedFormat
					.replace('\\{formattedDate\\}', '.*')
					.replace('\\{formattedTime\\}', '(.*)')
				const timeRegex = new RegExp(timeRegexString)
				const dateMatches = value.match(dateRegex)
				const timeMatches = value.match(timeRegex)

				if (!dateMatches || !timeMatches) {
					showError(this.$t('calendar', 'Please enter a valid date and time'))
					// Just return the previous date
					return this.date
				}

				return moment(dateMatches[1] + ' ' + timeMatches[1], 'L LT', this.locale).toDate()
			}
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
<style lang="scss" scoped>
::v-deep .button-vue__icon {
		margin-top: 16px;
}
.highlighted-timezone-icon {
opacity: .7;
}
</style>
