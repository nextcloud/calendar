<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<!-- Yes, technically an alarm is a component, not a property, but for the matter of CSS names it really doesn't matter -->
	<div class="property-alarm-item">
		<div v-if="!isEditing" class="property-alarm-item__front">
			<div class="property-alarm-item__label">
				{{ formatAlarm(alarm, isAllDay, currentUserTimezone, locale) }}
			</div>
		</div>
		<div
			v-if="isEditing && isRelativeAlarm && !isAllDay"
			class="property-alarm-item__edit property-alarm-item__edit--timed">
			<NcTextField
				type="number"
				:label="$t('calendar', 'Amount')"
				:labelOutside="true"
				:modelValue="String(alarm.relativeAmountTimed)"
				@update:modelValue="changeRelativeAmountTimed" />
			<AlarmTimeUnitSelect
				:isAllDay="isAllDay"
				:count="alarm.relativeAmountTimed"
				:unit="alarm.relativeUnitTimed"
				:disabled="false"
				@change="changeRelativeUnitTimed" />
		</div>
		<div
			v-if="isEditing && isRelativeAlarm && isAllDay"
			class="property-alarm-item__edit property-alarm-item__edit--all-day">
			<div class="property-alarm-item__edit--all-day__distance">
				<NcTextField
					type="number"
					:label="$t('calendar', 'Amount')"
					:labelOutside="false"
					:modelValue="String(alarm.relativeAmountAllDay)"
					@update:modelValue="changeRelativeAmountAllDay" />
				<AlarmTimeUnitSelect
					:isAllDay="isAllDay"
					:count="alarm.relativeAmountAllDay"
					:unit="alarm.relativeUnitAllDay"
					:disabled="false"
					class="time-unit-select"
					@change="changeRelativeUnitAllDay" />
			</div>
			<div class="property-alarm-item__edit--all-day__time">
				<span class="property-alarm-item__edit--all-day__time__before-at-label">
					{{ $t('calendar', 'before at') }}
				</span>
				<TimePicker
					:date="relativeAllDayDate"
					@change="changeRelativeHourMinuteAllDay" />
			</div>
		</div>
		<div
			v-if="isEditing && isAbsoluteAlarm"
			class="property-alarm-item__edit property-alarm-item__edit--absolute">
			<DatePicker
				prefix="on"
				:date="alarm.absoluteDate"
				:timezoneId="alarm.absoluteTimezoneId"
				:isAllDay="false"
				@change="changeAbsoluteDate"
				@changeTimezone="changeAbsoluteTimezoneId" />
		</div>
		<div
			v-if="!isReadOnly"
			class="property-alarm-item__options">
			<Actions
				:open="showMenu"
				@update:open="(open) => showMenu = open">
				<ActionRadio
					v-if="canChangeAlarmType || (!isAlarmTypeDisplay && forceEventAlarmType === 'DISPLAY')"
					:name="alarmTypeName"
					value="DISPLAY"
					:modelValue="alarmType"
					@update:modelValue="changeType('DISPLAY')">
					{{ $t('calendar', 'Notification') }}
				</ActionRadio>
				<ActionRadio
					v-if="canChangeAlarmType || (!isAlarmTypeEmail && forceEventAlarmType === 'EMAIL')"
					:name="alarmTypeName"
					value="EMAIL"
					:modelValue="alarmType"
					@update:modelValue="changeType('EMAIL')">
					{{ $t('calendar', 'Email') }}
				</ActionRadio>
				<ActionRadio
					v-if="canChangeAlarmType && isAlarmTypeAudio"
					:name="alarmTypeName"
					value="AUDIO"
					:modelValue="alarmType"
					@update:modelValue="changeType('AUDIO')">
					{{ $t('calendar', 'Audio notification') }}
				</ActionRadio>
				<ActionRadio
					v-if="canChangeAlarmType && isAlarmTypeOther"
					:name="alarmTypeName"
					:value="isAlarmTypeOther ?? alarmType"
					:modelValue="alarmType"
					@update:modelValue="changeType(alarmType)">
					{{ $t('calendar', 'Other notification') }}
				</ActionRadio>

				<ActionSeparator v-if="canChangeAlarmType && !isRecurring" />

				<ActionRadio
					v-if="!isRecurring"
					:name="alarmTriggerName"
					value="RELATIVE"
					:modelValue="alarmRelationType"
					@update:modelValue="switchToRelativeAlarm">
					{{ $t('calendar', 'Relative to event') }}
				</ActionRadio>
				<ActionRadio
					v-if="!isRecurring"
					:name="alarmTriggerName"
					value="ABSOLUTE"
					:modelValue="alarmRelationType"
					@update:modelValue="switchToAbsoluteAlarm">
					{{ $t('calendar', 'On date') }}
				</ActionRadio>

				<ActionSeparator />

				<ActionButton
					v-if="canEdit && !isEditing"
					@click.stop="toggleEditAlarm">
					<template #icon>
						<Pencil :size="20" decorative />
					</template>
					{{ $t('calendar', 'Edit time') }}
				</ActionButton>
				<ActionButton
					v-if="canEdit && isEditing"
					@click="toggleEditAlarm">
					<template #icon>
						<Check :size="20" decorative />
					</template>
					{{ $t('calendar', 'Save time') }}
				</ActionButton>

				<ActionButton @click="removeAlarm">
					<template #icon>
						<Delete :size="20" decorative />
					</template>
					{{ $t('calendar', 'Remove reminder') }}
				</ActionButton>
			</Actions>
		</div>
	</div>
</template>

<script>
import moment from '@nextcloud/moment'
import {
	NcActionButton as ActionButton,
	NcActionRadio as ActionRadio,
	NcActions as Actions,
	NcActionSeparator as ActionSeparator,
	NcTextField,
} from '@nextcloud/vue'
import { mapState, mapStores } from 'pinia'
import Check from 'vue-material-design-icons/CheckOutline.vue'
import Pencil from 'vue-material-design-icons/PencilOutline.vue'
import Delete from 'vue-material-design-icons/TrashCanOutline.vue'
import DatePicker from '../../Shared/DatePicker.vue'
import TimePicker from '../../Shared/TimePicker.vue'
import AlarmTimeUnitSelect from './AlarmTimeUnitSelect.vue'
import formatAlarm from '../../../filters/alarmFormat.js'
import useCalendarObjectInstanceStore from '../../../store/calendarObjectInstance.js'
import useSettingsStore from '../../../store/settings.js'

export default {
	name: 'AlarmListItem',
	components: {
		DatePicker,
		TimePicker,
		AlarmTimeUnitSelect,
		Actions,
		ActionButton,
		ActionRadio,
		ActionSeparator,
		NcTextField,
		Check,
		Delete,
		Pencil,
	},

	props: {
		alarm: {
			type: Object,
			required: true,
		},

		calendarObjectInstance: {
			type: Object,
			required: true,
		},

		isReadOnly: {
			type: Boolean,
			required: true,
		},

		showIcon: {
			type: Boolean,
			required: true,
		},
	},

	data() {
		return {
			isEditing: false,
			showMenu: false,
		}
	},

	computed: {
		...mapStores(useCalendarObjectInstanceStore, useSettingsStore),
		...mapState(useSettingsStore, {
			locale: 'momentLocale',
			forceEventAlarmType: 'forceEventAlarmType',
		}),

		canEdit() {
			// You can always edit an alarm if it's absolute
			if (!this.isRelativeAlarm) {
				return true
			}

			// We don't allow editing when the alarm is
			// related to the event's end
			if (!this.alarm.relativeIsRelatedToStart) {
				return false
			}

			// We don't allow editing when this event is timed
			// and the trigger time is positive
			if (!this.isAllDay && this.alarm.relativeTrigger > 0) {
				return false
			}

			// We don't allow editing when this event is all-day
			// and the trigger time is bigger than one day
			if (this.isAllDay && this.alarm.relativeTrigger > 86400) {
				return false
			}

			return true
		},

		/**
		 * Changing the alarm type is allowed if the alarm type does
		 * not match the forceEventAlarmType (yet).
		 *
		 * If no alarm type is forced (forceEventAlarmType === false),
		 * this will return true as well.
		 */
		canChangeAlarmType() {
			return this.alarm.type !== this.forceEventAlarmType
		},

		alarmType() {
			return this.alarm.type || 'DISPLAY'
		},

		alarmTypeName() {
			return this.$.uid + '-radio-type-name'
		},

		alarmTriggerName() {
			return this.$.uid + '-radio-trigger-name'
		},

		alarmRelationType() {
			return this.isRelativeAlarm ? 'RELATIVE' : 'ABSOLUTE'
		},

		isAlarmTypeDisplay() {
			return this.alarm.type === 'DISPLAY'
		},

		isAlarmTypeEmail() {
			return this.alarm.type === 'EMAIL'
		},

		isAlarmTypeAudio() {
			return this.alarm.type === 'AUDIO'
		},

		isAlarmTypeOther() {
			return !['AUDIO', 'DISPLAY', 'EMAIL'].includes(this.alarm.type)
		},

		isRelativeAlarm() {
			return this.alarm.relativeTrigger !== null
		},

		isAbsoluteAlarm() {
			return !this.isRelativeAlarm
		},

		currentUserTimezone() {
			return this.settingsStore.getResolvedTimezone
		},

		isAllDay() {
			return this.calendarObjectInstance.isAllDay
		},

		isRecurring() {
			return this.calendarObjectInstance.recurrenceRule.frequency !== 'NONE'
		},

		relativeAllDayDate() {
			const date = new Date()
			date.setHours(this.alarm.relativeHoursAllDay)
			date.setMinutes(this.alarm.relativeMinutesAllDay)

			return date
		},

		timeFormat() {
			return moment.localeData().longDateFormat('LT')
		},

		absoluteDateFormat() {
			return [
				'[',
				this.$t('calendar', 'on'),
				'] ',
				moment.localeData().longDateFormat('L'),
				' [',
				this.$t('calendar', 'at'),
				'] ',
				moment.localeData().longDateFormat('LT'),
			].join('')
		},
	},

	methods: {
		/**
		 * Format the alarm for display
		 *
		 * @param {object} alarm The alarm object
		 * @param {boolean} isAllDay Whether the event is all-day
		 * @param {string} timezone The timezone
		 * @param {string} locale The locale
		 * @return {string} Formatted alarm string
		 */
		formatAlarm(alarm, isAllDay, timezone, locale) {
			return formatAlarm(alarm, isAllDay, timezone, locale)
		},

		/**
		 * This method enables the editing mode
		 */
		toggleEditAlarm() {
			this.isEditing = !this.isEditing

			// Hide menu when starting to edit
			if (this.isEditing) {
				this.showMenu = false
			}
		},

		/**
		 * Changes the type of the reminder
		 *
		 * @param {string} type The new type of the notification
		 */
		changeType(type) {
			this.calendarObjectInstanceStore.changeAlarmType({
				alarm: this.alarm,
				type,
			})

			this.showMenu = false
		},

		/**
		 * Switches from absolute to relative alarm
		 */
		switchToRelativeAlarm() {
			if (this.isRelativeAlarm) {
				return
			}

			this.calendarObjectInstanceStore.changeAlarmFromAbsoluteToRelative({
				calendarObjectInstance: this.calendarObjectInstance,
				alarm: this.alarm,
			})

			this.showMenu = false
		},

		/**
		 * Switches from relative to absolute alarm
		 */
		switchToAbsoluteAlarm() {
			if (this.isAbsoluteAlarm) {
				return
			}

			this.calendarObjectInstanceStore.changeAlarmFromRelativeToAbsolute({
				calendarObjectInstance: this.calendarObjectInstance,
				alarm: this.alarm,
			})

			this.showMenu = false
		},

		/**
		 * This method emits the removeAlarm event
		 */
		removeAlarm() {
			this.$emit('removeAlarm', this.alarm)

			this.showMenu = false
		},

		/**
		 * changes the relative amount entered in timed mode
		 *
		 * @param {string} value The input value
		 */
		changeRelativeAmountTimed(value) {
			const minimumValue = 0
			const maximumValue = 3600
			const selectedValue = parseInt(value, 10)

			if (selectedValue >= minimumValue && selectedValue <= maximumValue) {
				this.calendarObjectInstanceStore.changeAlarmAmountTimed({
					alarm: this.alarm,
					amount: selectedValue,
				})
			}
		},

		/**
		 * changes the relative unit entered in timed mode
		 *
		 * @param {string} unit The new unit
		 */
		changeRelativeUnitTimed(unit) {
			this.calendarObjectInstanceStore.changeAlarmUnitTimed({
				alarm: this.alarm,
				unit,
			})
		},

		/**
		 * changes the relative amount entered in all-day
		 *
		 * @param {string} value The input value
		 */
		changeRelativeAmountAllDay(value) {
			const minimumValue = 0
			const maximumValue = 3600
			const selectedValue = parseInt(value, 10)

			if (selectedValue >= minimumValue && selectedValue <= maximumValue) {
				this.calendarObjectInstanceStore.changeAlarmAmountAllDay({
					alarm: this.alarm,
					amount: selectedValue,
				})
			}
		},

		/**
		 * changes the relative unit entered in all-day mode
		 *
		 * @param {string} unit The new unit
		 */
		changeRelativeUnitAllDay(unit) {
			this.calendarObjectInstanceStore.changeAlarmUnitAllDay({
				alarm: this.alarm,
				unit,
			})
		},

		/**
		 * Changes the time entered in all-day mode
		 *
		 * @param {Date} date The new date object containing hours and minutes
		 */
		changeRelativeHourMinuteAllDay(date) {
			const hours = date.getHours()
			const minutes = date.getMinutes()

			this.calendarObjectInstanceStore.changeAlarmHoursMinutesAllDay({
				alarm: this.alarm,
				hours,
				minutes,
			})
		},

		/**
		 * Changes the date of the absolute alarm
		 *
		 * @param {Date} date The new date of the alarm
		 */
		changeAbsoluteDate(date) {
			this.calendarObjectInstanceStore.changeAlarmAbsoluteDate({
				alarm: this.alarm,
				date,
			})
		},

		/**
		 * Changes the time zone of the absolute alarm
		 *
		 * @param {string} timezoneId The new time zone id of the alarm
		 */
		changeAbsoluteTimezoneId(timezoneId) {
			this.calendarObjectInstanceStore.changeAlarmAbsoluteTimezoneId({
				alarm: this.alarm,
				timezoneId,
			})
		},
	},
}
</script>
