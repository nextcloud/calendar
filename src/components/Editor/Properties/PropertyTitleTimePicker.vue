<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div
		class="property-title-time-picker"
		:class="{ 'property-title-time-picker--readonly': isReadOnly, 'property-title-time-picker__wrap': wrap }">
		<CalendarIcon
			v-if="isReadOnly"
			class="property-title-time-picker__icon"
			:size="20" />

		<div
			v-if="!isReadOnly"
			class="property-title-time-picker__time-pickers">
			<div
				:class="{ 'property-title-time-picker__time-pickers--all-day': isAllDay }"
				class="property-title-time-picker__time-pickers__inner">
				<NcButton
					v-if="!showTimezoneSelect && (!isAllDay || isMobile)"
					variant="tertiary"
					@click="showTimezoneSelect = !showTimezoneSelect">
					<template>
						<span class="property-title-time-picker__button">
							<IconTimezone :size="20" />
							{{ startTimezone }}
						</span>
					</template>
				</NcButton>
				<div class="property-title-time-picker__time-pickers-from">
					<!-- TRANSLATORS Start of an event -->
					<div class="datepicker-label">
						{{ $t('calendar', 'From') }}
					</div>
					<div class="property-title-time-picker__time-pickers-from-inner">
						<div class="property-title-time-picker__time-pickers-from-inner__selectors">
							<DatePicker
								:date="startDate"
								prefix="from"
								@change="changeStartDate" />
							<DatePicker
								v-if="!isAllDay"
								:date="startDate"
								type="time"
								@change="changeStartTime" />
						</div>
						<div v-if="showTimezoneSelect && !isAllDay" class="property-title-time-picker__time-pickers-from-inner__timezone">
							<NcTimezonePicker
								v-if="showTimezoneSelect && !isAllDay"
								:value="startTimezone"
								@input="changeStartTimezone" />
							<NcButton
								v-if="!showTimezoneSelect && !isAllDay && !isMobile"
								variant="tertiary"
								@click="showTimezoneSelect = !showTimezoneSelect">
								<template>
									<span class="property-title-time-picker__button">
										<IconTimezone :size="20" />
										{{ startTimezone }}
									</span>
								</template>
							</NcButton>
						</div>
					</div>
				</div>

				<div class="property-title-time-picker__time-pickers-to">
					<!-- TRANSLATORS End of an event -->
					<div class="datepicker-label">
						{{ $t('calendar', 'To') }}
					</div>
					<div class="property-title-time-picker__time-pickers-to-inner">
						<div class="property-title-time-picker__time-pickers-from-inner__selectors">
							<DatePicker
								:date="endDate"
								prefix="to"
								@change="changeEndDate" />
							<DatePicker
								v-if="!isAllDay"
								:date="endDate"
								type="time"
								@change="changeEndTime" />
						</div>
						<div v-if="showTimezoneSelect && !isAllDay" class="property-title-time-picker__time-pickers-to-inner__timezone">
							<NcTimezonePicker v-if="showTimezoneSelect && !isAllDay" :value="endTimezone" @input="changeEndTimezone" />
						</div>
					</div>
				</div>
			</div>
		</div>
		<div
			v-if="isReadOnly"
			class="property-title-time-picker__time-pickers property-title-time-picker__time-pickers--readonly">
			<div class="property-title-time-picker-read-only-wrapper property-title-time-picker-read-only-wrapper--start-date">
				<div class="property-title-time-picker-read-only-wrapper__main-info">
					<div class="property-title-time-picker-read-only-wrapper__label">
						{{ formattedStart }}
					</div>
					<IconTimezone
						v-if="!isAllDay"
						:title="startTimezone"
						:class="{ 'highlighted-timezone-icon': highlightTimezones }"
						:size="20" />
					<div v-if="highlightTimezones && startTimezone !== 'floating'" class="property-title-time-picker-read-only-wrapper__timezone" :title="startTimezone">
						{{ startTimezone }}
					</div>
				</div>
				<div v-if="subtitleStart" class="property-title-time-picker-read-only-wrapper__subtitle">
					{{ subtitleStart }} {{ t('calendar', 'Your Time') }}
				</div>
			</div>
			<template v-if="!isAllDayOneDayEvent">
				<div class="property-title-time-picker-read-only-wrapper property-title-time-picker-read-only-wrapper--end-date">
					<div class="property-title-time-picker-read-only-wrapper__main-info">
						<div class="property-title-time-picker-read-only-wrapper__label">
							{{ formattedEnd }}
						</div>
						<IconTimezone
							v-if="!isAllDay"
							:title="endTimezone"
							:class="{ 'highlighted-timezone-icon': highlightTimezones }"
							:size="20" />
						<div v-if="highlightTimezones && endTimezone !== 'floating'" class="property-title-time-picker-read-only-wrapper__timezone" :title="endTimezone">
							{{ endTimezone }}
						</div>
					</div>
					<div v-if="subtitleEnd" class="property-title-time-picker-read-only-wrapper__subtitle">
						{{ subtitleEnd }} {{ t('calendar', 'Your Time') }}
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
import { DateTimeValue } from '@nextcloud/calendar-js'
import moment from '@nextcloud/moment'
import { NcButton, NcTimezonePicker } from '@nextcloud/vue'
import { mapState } from 'pinia'
import CalendarIcon from 'vue-material-design-icons/CalendarOutline.vue'
import IconTimezone from 'vue-material-design-icons/Web.vue'
import DatePicker from '../../Shared/DatePicker.vue'
import getTimezoneManager from '../../../services/timezoneDataProviderService.js'
import useSettingsStore from '../../../store/settings.js'
import { getDateFromDateTimeValue } from '@/utils/date'

export default {
	name: 'PropertyTitleTimePicker',
	components: {
		DatePicker,
		IconTimezone,
		CalendarIcon,
		NcButton,
		NcTimezonePicker,
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

		wrap: {
			type: Boolean,
			default: true,
		},
	},

	data() {
		return {
			/**
			 * Whether to show the timezone selector
			 */
			showTimezoneSelect: false,
			windowWidth: window.innerWidth,
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
		highlightTimezones() {
			return this.startTimezone !== this.userTimezone || this.endTimezone !== this.userTimezone
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

		isMobile() {
			return this.windowWidth <= 840
		},

		subtitleStart() {
			if (this.isAllDay) {
				return null
			}
			const localDate = this.getDateInUserTimezone(this.startDate, this.startTimezone)

			if (localDate.getTime() === this.startDate.getTime()) {
				return null
			}

			return moment(localDate).locale(this.locale).format('LT')
		},

		subtitleEnd() {
			if (this.isAllDay) {
				return null
			}
			const localDate = this.getDateInUserTimezone(this.endDate, this.endTimezone)
			if (localDate.getTime() === this.endDate.getTime()) {
				return null
			}

			return moment(localDate).locale(this.locale).format('LT')
		},
	},

	mounted() {
		if (this.startTimezone !== this.endTimezone) {
			this.showTimezoneSelect = true
		}

		window.addEventListener('resize', this.updateWindowWidth)
	},

	beforeDestroy() {
		window.removeEventListener('resize', this.updateWindowWidth)
	},

	methods: {
		/**
		 * Update the start date
		 *
		 * @param {Date} value The new start date
		 */
		changeStartDate(value) {
			this.$emit('update-start-date', value)
		},

		/**
		 * Update the start time
		 *
		 * @param {Date} value The new start time
		 */
		changeStartTime(value) {
			this.$emit('update-start-time', value)
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
			this.$emit('update-end-timezone', value)
		},

		/**
		 * Update the end date
		 *
		 * @param {Date} value The new end date
		 */
		changeEndDate(value) {
			this.$emit('update-end-date', value)
		},

		/**
		 * Update the end time
		 *
		 * @param {Date} value The new end time
		 */
		changeEndTime(value) {
			this.$emit('update-end-time', value)
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

		getDateInUserTimezone(date, timezone) {
			const tzManager = getTimezoneManager()
			const dateTimezone = tzManager.getTimezoneForId(timezone)
			const userTimezone = tzManager.getTimezoneForId(this.userTimezone)

			const dateTimeValue = DateTimeValue.fromJSDate(date)
			dateTimeValue.replaceTimezone(dateTimezone)
			return getDateFromDateTimeValue(dateTimeValue.getInTimezone(userTimezone))
		},

		updateWindowWidth() {
			this.windowWidth = window.innerWidth
		},
	},
}
</script>

<style lang="scss" scoped>
:deep(.button-vue--icon-only), :deep(.button-vue__icon) {
	width: 7rem !important;
}

/* Needed because the timezone picker has old styling */
:deep(.vs__dropdown-toggle), :deep(.v-select) {
	height: var(--default-clickable-area);
	overflow-y: clip !important;
	flex-grow: 2;
	flex-shrink: 1;
	width: 180px;
	margin: 0;
	min-width: unset;
}

:deep(.v-select.select) {
	min-width: 180px !important;
}

.property-title-time-picker__time-pickers {
	flex-direction: column;
	align-items: stretch !important;
	flex-wrap: nowrap !important;
}

.property-title-time-picker__time-pickers__inner {
	display: flex;
	gap: var(--default-grid-baseline);
	flex-direction: column;
	flex-grow: 1;
}

.property-title-time-picker__time-pickers-from, .property-title-time-picker__time-pickers-to {
	display: flex;
	flex-wrap: nowrap;
	justify-content: flex-start;
	width: 100%;
	align-items: center;

	&-inner {
		display: flex;
		gap: var(--default-grid-baseline);
		align-content: stretch;
		align-items: stretch;
		justify-content: stretch;
		width: 100%;
	}

	&-inner__selectors {
		flex-basis: calc(var(--total-width) * 2 / 3 - var(--column-gap) / 2 - (20px + var(--default-grid-baseline) * 4));
		display: flex;
		justify-content: stretch;
		gap: var(--default-grid-baseline);
	}

	:deep(input) {
		flex-grow: 1;
	}

	:deep(input[type="time"]) {
		min-width: calc(var(--clickable-area-large) * 2.2);
	}

	:deep(input[type="date"]) {
		min-width: calc(var(--clickable-area-large) * 3);
	}

	.native-datetime-picker {
		display: inline-block;
		flex-grow: 1;
	}

	.datepicker-label {
		flex: 0 0 calc(var(--default-grid-baseline) * 6);
		width: calc(var(--default-grid-baseline) * 6);
		max-width: calc(var(--default-grid-baseline) * 6);
		display: flex;
		justify-content: flex-end;
		text-align: end;
		padding-inline-end: calc(var(--default-grid-baseline) * 2);
		white-space: nowrap;
		overflow: visible;
	}

	.property-title-time-picker__time-pickers-from-inner__timezone span {
		width: unset;
	}
}

.property-title-time-picker__button {
	display: flex;
	gap: var(--default-grid-baseline);
	font-weight: normal;
}

.property-title-time-picker__time-pickers-from-inner__selectors {
	padding-inline-start: calc(var(--default-grid-baseline) * 1);
}

:deep(button.vs__open-indicator-button) {
	padding: 0 !important;
}

.property-title-time-picker__wrap {
	.property-title-time-picker__time-pickers-from, .property-title-time-picker__time-pickers-to {
		flex-shrink: 0;

		&-inner {
			flex-wrap: wrap;
			justify-content: space-between;
		}
	}

	:deep(.vs__dropdown-toggle), :deep(.v-select) {
		width: unset;
		display: flex;
		flex-basis: 200px;
	}
}

.property-title-time-picker__time-pickers-from-inner__timezone, .property-title-time-picker__time-pickers-to-inner__timezone {
	width: calc(var(--total-width) * 1 / 3 - var(--column-gap) / 2);
}

.app-full .property-title-time-picker__time-pickers-from-inner__timezone, .app-full .property-title-time-picker__time-pickers-to-inner__timezone {
	.button-vue {
		margin-inline-start: calc(var(--default-grid-baseline) * -2);
	}
}

@media (max-width: 1000px) {
	.property-title-time-picker__time-pickers-from, .property-title-time-picker__time-pickers-to {
		flex-wrap: wrap;
	}

	.datepicker-label {
		flex: 0 0 auto !important;
		width: auto !important;
		max-width: 100% !important;
		padding-inline-end: var(--default-grid-baseline) !important;
		justify-content: flex-start !important;
		text-align: start !important;
	}

	.app-full {
		.property-title-time-picker__time-pickers-from,
		.property-title-time-picker__time-pickers-to,
		.property-title-time-picker__time-pickers__inner button {
			padding-inline-start: calc(20px + var(--default-grid-baseline) * 4);
		}

		.property-title-time-picker__time-pickers-from,
		.property-title-time-picker__time-pickers-to {
			width: unset !important;
		}
	}

}

.edit-simple {
	.property-title-time-picker__time-pickers {
		flex-grow: 0 !important;
		flex-shrink: 1;
		margin-inline-start: calc(var(--default-grid-baseline) * 2);
	}

	.property-title-time-picker__time-pickers-from-inner__selectors, .property-title-time-picker__time-pickers-to-inner__selectors {
		width: 100% !important;
	}

	.property-title-time-picker__time-pickers-from-inner__timezone, .property-title-time-picker__time-pickers-to-inner__timezone {
		width: unset !important;
	}

	.property-title-time-picker--readonly {
		flex-direction: row !important;
		gap: calc(var(--default-grid-baseline) * 4);
		justify-content: flex-start !important;

		.property-title-time-picker__icon {
			align-self: start;
			padding-top: calc(var(--default-grid-baseline) / 2);
		}
	}

	.property-title-time-picker-read-only-wrapper {
		display: flex;
		flex-direction: column;
		gap: calc(var(--default-grid-baseline) * 2);
		max-width: calc(var(--sidebar-max-width) - var(--default-clickable-area) - var(--default-grid-baseline));

		&__label, &__subtitle {
			min-width: calc(var(--navigation-width) * 0.5);
		}
	}

	.property-title-time-picker {
		&__icon {
			margin: 0 !important;
		}
	}

	.property-title-time-picker-read-only-wrapper__timezone {
		text-overflow: ellipsis;
		overflow: hidden;
		flex-shrink: 1;
	}
}

.property-title-time-picker-read-only-wrapper__main-info {
	display: flex;
	gap: calc(var(--default-grid-baseline) * 2);
}

.property-title-time-picker-read-only-wrapper__subtitle {
    opacity: 0.8;
}

.app-full {
	.property-title-time-picker--readonly {
		margin-inline-start: calc(var(--default-grid-baseline) * 9);
	}
}

</style>
