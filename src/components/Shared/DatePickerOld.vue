<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<DateTimePicker :lang="lang"
		:first-day-of-week="firstDay"
		:format="'YYYY-MM-DD HH:mm'"
		:formatter="formatter"
		:value="date"
		:type="actualType"
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
		class="date-time-picker"
		v-on="$listeners"
		@close="close"
		@change="change"
		@pick="pickDate">
		<template #icon-calendar>
			<IconNewCalendar v-if="isAllDay" :size="20" class="date-time-picker__icon" />
			<NcPopover v-else open-class="timezone-popover-wrapper">
				<template #trigger>
					<NcButton type="tertiary-no-background"
						:aria-label="t('calendar', 'Select a time zone')"
						@mousedown="(e) => e.stopPropagation()">
						<template #icon>
							<IconTimezone :size="20"
								class="date-time-picker__icon"
								:class="{ 'date-time-picker__icon--highlight': highlightTimezone }" />
						</template>
					</NcButton>
				</template>
				<template>
					<div class="timezone-popover-wrapper__title">
						<strong>
							{{ $t('calendar', 'Please select a time zone:') }}
						</strong>
					</div>
					<TimezonePicker class="timezone-popover-wrapper__timezone-select"
						:value="timezoneId"
						@input="changeTimezone" />
				</template>
			</NcPopover>
		</template>
		<template v-if="!isAllDay"
			#footer>
			<NcButton v-if="!showTimePanel"
				class="mx-btn mx-btn-text"
				@click="toggleTimePanel">
				{{ $t('calendar', 'Pick a time') }}
			</NcButton>
			<NcButton v-else
				class="mx-btn mx-btn-text"
				@click="toggleTimePanel">
				{{ $t('calendar', 'Pick a date') }}
			</NcButton>
		</template>
	</DateTimePicker>
</template>

<script>
import {
	NcButton,
	NcDateTimePicker as DateTimePicker,
	NcPopover,
	NcTimezonePicker as TimezonePicker,
} from '@nextcloud/vue'
import IconTimezone from 'vue-material-design-icons/Web.vue'
import IconNewCalendar from 'vue-material-design-icons/CalendarBlankOutline.vue'
import {
	getFirstDay,
} from '@nextcloud/l10n'
import moment from '@nextcloud/moment'
import { mapStores, mapState } from 'pinia'
import {
	showError,
} from '@nextcloud/dialogs'

import { getLangConfigForVue2DatePicker } from '../../utils/localization.js'
import useSettingsStore from '../../store/settings.js'
import useDavRestrictionsStore from '../../store/davRestrictions.js'

export default {
	name: 'DatePickerOld',
	components: {
		NcButton,
		DateTimePicker,
		NcPopover,
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
		type: {
			type: String,
			default: 'datetime',
		},
	},
	data() {
		return {
			firstDay: getFirstDay() === 0 ? 7 : getFirstDay(),
			formatter: {
				stringify: this.stringify,
				parse: this.parse,
			},
			showTimePanel: true,
		}
	},
	computed: {
		...mapStores(useDavRestrictionsStore),
		...mapState(useSettingsStore, {
			locale: 'momentLocale',
			showWeekNumbers: 'showWeekNumbers',
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
		actualType() {
			if (this.type === 'datetime' && this.isAllDay) {
				return 'date'
			}

			return this.type
		},
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
.date-time-picker {
	&__icon {
		opacity: 0.7;

		&--highlight {
			opacity: 1;
		}
	}

	:deep(.multiselect__content-wrapper) {
		border: none !important;
		position: relative !important;
	}
}
</style>
