<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  - @copyright Copyright (c) 2019 Jakob Röhrl <jakob.roehrl@web.de>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Jakob Röhrl <jakob.roehrl@web.de>
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
	<div class="property-title-time-picker">
		<div
			v-if="!isReadOnly"
			class="property-title-time-picker__time-pickers">
			<DatetimePicker
				v-if="!isReadOnly"
				lang="en"
				:format="startDateFormat"
				:value="startDate"
				:type="timeType"
				@change="changeStart">
				<template v-if="!isAllDay" slot="calendar-icon">
					<button
						class="datetime-picker-inline-icon icon icon-timezone"
						@click.stop.prevent="showTimezonePickerForStartDate" />
					<Popover
						:open.sync="showStartTimezone"
						open-class="timezone-popover-wrapper">
						<div class="timezone-popover-wrapper__title">
							<strong>
								{{ $t('calendar', 'Please select a timezone for the start-date:') }}
							</strong>
						</div>
						<timezone-select
							v-if="!isReadOnly"
							class="timezone-popover-wrapper__timezone-select"
							:value="startTimezone"
							@change="changeStartTimezone" />
					</Popover>
				</template>
			</DatetimePicker>

			<DatetimePicker
				v-if="!isReadOnly"
				lang="en"
				:format="endDateFormat"
				:value="endDate"
				:type="timeType"
				@change="changeEnd">
				<template v-if="!isAllDay" slot="calendar-icon">
					<button
						class="datetime-picker-inline-icon icon icon-timezone"
						@click.stop.prevent="showTimezonePickerForEndDate" />
					<Popover
						:open.sync="showEndTimezone"
						open-class="timezone-popover-wrapper">
						<div class="timezone-popover-wrapper__title">
							<strong>
								{{ $t('calendar', 'Please select a timezone for the end-date:') }}
							</strong>
						</div>
						<timezone-select
							v-if="!isReadOnly"
							class="timezone-popover-wrapper__timezone-select"
							:value="endTimezone"
							@change="changeEndTimezone" />
					</Popover>
				</template>
			</DatetimePicker>
		</div>
		<div
			v-if="isReadOnly"
			class="property-title-time-picker__time-pickers">
			TODO
		</div>

		<div class="property-title-time-picker__all-day">
			<input
				id="allDay"
				:checked="isAllDay"
				type="checkbox"
				class="checkbox"
				:disabled="!canModifyAllDay || isReadOnly"
				@change="toggleAllDay">
			<label
				for="allDay"
				v-tooltip="allDayTooltip">
				{{ $t('calendar', 'All day') }}
			</label>
		</div>
		<!--<div class="row">-->
		<!--	<DatetimePicker-->
		<!--		v-if="!isReadOnly"-->
		<!--		lang="en"-->
		<!--		:format="timeFormat"-->
		<!--		:value="startDate"-->
		<!--		:type="timeType"-->
		<!--		@change="changeStart">-->
		<!--		<template slot="calendar-icon">-->
		<!--			<div class="icon icon-timezone" @click.stop.prevent="showTimezoneOfStartDate" />-->
		<!--			<Popover :open="showStartTimezone" open-class="timezone-popover-wrapper" @update:open="updateShowStartTimezone">-->
		<!--				<h3>Please select a timezone</h3>-->
		<!--				<timezone-select v-if="!isReadOnly" :value="startTimezone" @change="changeStartTimezone" />-->
		<!--			</Popover>-->
		<!--		</template>-->
		<!--	</DatetimePicker>-->
		<!--	<div v-if="isReadOnly" class="fake-input-box">-->
		<!--		{{ startDate | formatDate(isAllDay) }}-->
		<!--	</div>-->
		<!--	<span>-->
		<!--		{{ toLabel }}-->
		<!--	</span>-->
		<!--	<DatetimePicker-->
		<!--		v-if="!isReadOnly"-->
		<!--		lang="en"-->
		<!--		:format="timeFormat"-->
		<!--		:value="endDate"-->
		<!--		:type="timeType"-->
		<!--		@change="changeEnd" />-->
		<!--	<div v-if="isReadOnly" class="fake-input-box">-->
		<!--		{{ endDate | formatDate(isAllDay) }}-->
		<!--	</div>-->
		<!--</div>-->
		<!--<div v-if="displayTimezones" class="row">-->
		<!--	<timezone-select v-if="!isReadOnly" :value="startTimezone" @change="changeStartTimezone" />-->
		<!--	<div v-if="isReadOnly" class="fake-input-box">{{ startTimezone | formatTimezone }}</div>-->
		<!--	<span style="visibility: hidden">-->
		<!--		{{ toLabel }}-->
		<!--	</span>-->
		<!--	<timezone-select v-if="!isReadOnly" :value="endTimezone" @change="changeEndTimezone" />-->
		<!--	<div v-if="isReadOnly" class="fake-input-box">{{ endTimezone | formatTimezone }}</div>-->
		<!--</div>-->

		<!--<div class="row-checkboxes">-->
		<!--	<div>-->

		<!--	</div>-->
		<!--</div>-->
	</div>
</template>

<script>
import { DatetimePicker, Popover } from 'nextcloud-vue'
import TimezoneSelect from '../../Shared/TimezoneSelect'
import {
	getReadableTimezoneName,
} from '../../../utils/timezone.js'
import moment from '@nextcloud/moment'

export default {
	name: 'PropertyTitleTimePicker',
	components: {
		DatetimePicker,
		TimezoneSelect,
		Popover
	},
	props: {
		/**
		 * Whether or not the editor is viewed in read-only
		 */
		isReadOnly: {
			type: Boolean,
			required: true
		},
		/**
		 * Start date of the event
		 */
		startDate: {
			type: Date,
			required: true
		},
		/**
		 * Timezone of the start date
		 */
		startTimezone: {
			type: String,
			required: true
		},
		/**
		 * End date of the event
		 */
		endDate: {
			type: Date,
			required: true
		},
		/**
		 * Timezone of the end date
		 */
		endTimezone: {
			type: String,
			required: true
		},
		/**
		 * Whether or not the event is all-day
		 */
		isAllDay: {
			type: Boolean,
			required: true
		},
		/**
		 * Whether or not the user can toggle the all-day property
		 * This is set to false, whenever this event is part of a recurrence-set
		 */
		canModifyAllDay: {
			type: Boolean,
			required: true
		},
		/**
		 * The current timezone of the user
		 * This is used to highlight if the event is in a different timezone
		 */
		userTimezone: {
			Type: String,
			required: true
		}
	},
	data() {
		return {
			showStartTimezone: false,
			showEndTimezone: false
		}
	},
	filters: {
		formatDate(value, isAllDay) {
			if (!value) {
				return ''
			}
			if (isAllDay) {
				return moment(value).format('ll')
			} else {
				return moment(value).format('lll')
			}
		},
		formatTimezone(value) {
			if (!value) {
				return ''
			}

			return getReadableTimezoneName(value)
		}
	},
	computed: {
		/**
		 * Tooltip for the All-day checkbox.
		 * If the all-day checkbox is disabled, this tooltip gives an explanation to the user
		 * why it is disabled
		 *
		 * @returns {string|null}
		 */
		allDayTooltip() {
			if (this.canModifyAllDay) {
				return null
			}
			if (this.isReadOnly) {
				return null
			}

			return this.$t('calendar', 'Can not modify all-day setting for events that are part of a recurrence-set.')
		},
		/**
		 * Format of start date
		 *
		 * @returns {string}
		 */
		startDateFormat() {
			const parts = [
				'[',
				this.$t('calendar', 'from'),
				'] ',
				moment.localeData().longDateFormat('L')
			]

			if (this.isAllDay) {
				return parts.join('')
			}

			parts.push(
				' [',
				this.$t('calendar', 'at'),
				'] ',
				moment.localeData().longDateFormat('LT')
			)

			return parts.join('')
		},
		/**
		 * Format of end date
		 *
		 * @returns {string}
		 */
		endDateFormat() {
			const parts = [
				'[',
				this.$t('calendar', 'to'),
				'] ',
				moment.localeData().longDateFormat('L')
			]

			if (this.isAllDay) {
				return parts.join('')
			}

			parts.push(
				' [',
				this.$t('calendar', 'at'),
				'] ',
				moment.localeData().longDateFormat('LT')
			)

			return parts.join('')
		},
		/**
		 * Type of date-picker to open
		 *
		 * @returns {string}
		 */
		timeType() {
			if (this.isAllDay) {
				return 'date'
			}

			return 'datetime'
		},
	},
	methods: {
		/**
		 * Update the start date
		 *
		 * @param {Date} value The new start date
		 */
		changeStart(value) {
			this.$emit('updateStartDate', value)
		},
		/**
		 * Updates the timezone of the start date
		 *
		 * @param {String} value The new start timezone
		 */
		changeStartTimezone(value) {
			// If the value didn't change, value is null
			if (!value) {
				return
			}

			this.$emit('updateStartTimezone', value)
		},
		/**
		 * Opens the dialog to pick the timezone for the start date
		 */
		showTimezonePickerForStartDate() {
			this.showStartTimezone = true

			// TODO - autofocus the timezone-picker
		},
		/**
		 * Update the end date
		 *
		 * @param {Date} value The new end date
		 */
		changeEnd(value) {
			this.$emit('updateEndDate', value)
		},
		/**
		 * Updates the timezone of the end date
		 *
		 * @param {String} value The new end timezone
		 */
		changeEndTimezone(value) {
			// If the value didn't change, value is null
			if (!value) {
				return
			}

			this.$emit('updateEndTimezone', value)
		},
		/**
		 * Opens the dialog to pick the timezone for the end date
		 */
		showTimezonePickerForEndDate() {
			this.showEndTimezone = true

			// TODO - autofocus the timezone-picker
		},
		/**
		 * Toggles the all-day state of an event
		 */
		toggleAllDay() {
			if (!this.canModifyAllDay) {
				return
			}

			this.$emit('toggleAllDay')
		}
	}
}
</script>

<style scoped>
.row > div.mx-datepicker,
.row > div.multiselect,
.row > .fake-input-box {
	flex-grow: 2;
}

.row > span {
	margin: 0 10px;
}

.fake-input-box {
	margin: 3px 3px 3px 0;
	padding: 8px 7px;
	background-color: var(--color-main-background);
	color: var(--color-main-text);
	outline: none;
}

</style>
