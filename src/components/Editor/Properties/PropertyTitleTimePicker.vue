<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="property-title-time-picker"
		:class="{ 'property-title-time-picker--readonly': isReadOnly }">
		<CalendarIcon v-if="isReadOnly"
			class="property-title-time-picker__icon"
			:size="20" />

		<div v-if="!isReadOnly"
			class="property-title-time-picker__time-pickers">
			<DatePicker :date="startDate"
				:timezone-id="startTimezone"
				prefix="from"
				:is-all-day="isAllDay"
				:append-to-body="appendToBody"
				:user-timezone-id="userTimezone"
				@change="changeStart"
				@change-timezone="changeStartTimezone" />

			<DatePicker :date="endDate"
				:timezone-id="endTimezone"
				prefix="to"
				:is-all-day="isAllDay"
				:append-to-body="appendToBody"
				:user-timezone-id="userTimezone"
				@change="changeEnd"
				@change-timezone="changeEndTimezone" />
		</div>
		<div v-if="isReadOnly"
			class="property-title-time-picker__time-pickers property-title-time-picker__time-pickers--readonly">
			<div class="property-title-time-picker-read-only-wrapper property-title-time-picker-read-only-wrapper--start-date">
				<div class="property-title-time-picker-read-only-wrapper__label">
					{{ formattedStart }}
				</div>
				<IconTimezone v-if="!isAllDay"
					:name="endTimezone"
					:class="{ 'highlighted-timezone-icon': highlightStartTimezone }"
					:size="20" />
			</div>
			<template v-if="!isAllDayOneDayEvent">
				<div>-</div>
				<div class="property-title-time-picker-read-only-wrapper property-title-time-picker-read-only-wrapper--end-date">
					<div class="property-title-time-picker-read-only-wrapper__label">
						{{ formattedEnd }}
					</div>
					<IconTimezone v-if="!isAllDay"
						:title="endTimezone"
						:class="{ 'highlighted-timezone-icon': highlightStartTimezone }"
						:size="20" />
				</div>
			</template>
		</div>

		<div v-if="!isReadOnly" class="property-title-time-picker__all-day">
			<NcCheckboxRadioSwitch :checked="isAllDay"
				:disabled="!canModifyAllDay"
				@update:checked="toggleAllDay">
				{{ $t('calendar', 'All day') }}
			</NcCheckboxRadioSwitch>
		</div>
	</div>
</template>

<script>
import moment from '@nextcloud/moment'
import DatePicker from '../../Shared/DatePicker.vue'
import IconTimezone from 'vue-material-design-icons/Web.vue'
import CalendarIcon from 'vue-material-design-icons/Calendar.vue'
import { NcCheckboxRadioSwitch } from '@nextcloud/vue'
import { mapState } from 'pinia'
import useSettingsStore from '../../../store/settings.js'

export default {
	name: 'PropertyTitleTimePicker',
	components: {
		DatePicker,
		IconTimezone,
		CalendarIcon,
		NcCheckboxRadioSwitch,
	},
	props: {
		/**
		 * Whether or not the editor is viewed in read-only
		 */
		isReadOnly: {
			type: Boolean,
			required: true,
		},
		/**
		 * Start date of the event
		 */
		startDate: {
			type: Date,
			required: true,
		},
		/**
		 * Timezone of the start date
		 */
		startTimezone: {
			type: String,
			required: true,
		},
		/**
		 * End date of the event
		 */
		endDate: {
			type: Date,
			required: true,
		},
		/**
		 * Timezone of the end date
		 */
		endTimezone: {
			type: String,
			required: true,
		},
		/**
		 * Whether or not the event is all-day
		 */
		isAllDay: {
			type: Boolean,
			required: true,
		},
		/**
		 * Whether or not the user can toggle the all-day property
		 * This is set to false, whenever this event is part of a recurrence-set
		 */
		canModifyAllDay: {
			type: Boolean,
			required: true,
		},
		/**
		 * The current timezone of the user
		 * This is used to highlight if the event is in a different timezone
		 */
		userTimezone: {
			type: String,
			required: true,
		},
		/**
		 * Whether to append the datepickers to body or not.
		 * Necessary in the AppSidebar, otherwise it will be cut off be the
		 * AppSidebar edges.
		 */
		appendToBody: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			showStartTimezone: false,
			showEndTimezone: false,
		}
	},
	computed: {
		...mapState(useSettingsStore, {
			locale: 'momentLocale',
		}),
		/**
		 * Tooltip for the All-day checkbox.
		 * If the all-day checkbox is disabled, this tooltip gives an explanation to the user
		 * why it is disabled
		 *
		 * @return {string|null}
		 */
		allDayTooltip() {
			if (this.canModifyAllDay) {
				return null
			}
			if (this.isReadOnly) {
				return null
			}

			return this.$t('calendar', 'Cannot modify all-day setting for events that are part of a recurrence-set.')
		},
		/**
		 *
		 * @return {string}
		 */
		formattedStart() {
			if (this.isAllDay) {
				return moment(this.startDate).locale(this.locale).format('ll')
			}

			return moment(this.startDate).locale(this.locale).format('lll')
		},
		/**
		 *
		 * @return {string}
		 */
		formattedEnd() {
			if (this.isAllDay) {
				return moment(this.endDate).locale(this.locale).format('ll')
			}

			return moment(this.endDate).locale(this.locale).format('lll')
		},
		/**
		 * @return {boolean}
		 */
		highlightStartTimezone() {
			return this.startTimezone !== this.userTimezone
		},
		/**
		 * @return {boolean}
		 */
		highlightEndTimezone() {
			return this.endTimezone !== this.userTimezone
		},
		/**
		 * True if the event is an all day event, starts and ends on the same date
		 *
		 * @return {boolean}
		 */
		isAllDayOneDayEvent() {
			return this.isAllDay
				&& this.startDate.getDate() === this.endDate.getDate()
				&& this.startDate.getMonth() === this.endDate.getMonth()
				&& this.startDate.getFullYear() === this.endDate.getFullYear()
		},
	},
	methods: {
		/**
		 * Update the start date
		 *
		 * @param {Date} value The new start date
		 */
		changeStart(value) {
			this.$emit('update-start-date', value)
		},
		/**
		 * Updates the timezone of the start date
		 *
		 * @param {string} value The new start timezone
		 */
		changeStartTimezone(value) {
			// If the value didn't change, value is null
			if (!value) {
				return
			}

			this.$emit('update-start-timezone', value)
		},
		/**
		 * Update the end date
		 *
		 * @param {Date} value The new end date
		 */
		changeEnd(value) {
			this.$emit('update-end-date', value)
		},
		/**
		 * Updates the timezone of the end date
		 *
		 * @param {string} value The new end timezone
		 */
		changeEndTimezone(value) {
			// If the value didn't change, value is null
			if (!value) {
				return
			}

			this.$emit('update-end-timezone', value)
		},
		/**
		 * Toggles the all-day state of an event
		 */
		toggleAllDay() {
			if (!this.canModifyAllDay) {
				return
			}

			this.$emit('toggle-all-day')
		},
	},
}
</script>
