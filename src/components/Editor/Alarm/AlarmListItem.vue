<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<!-- Yes, technically an alarm is a component, not a property, but for the matter of CSS names it really doesn't matter -->
	<div v-click-outside="closeAlarmEditor"
		class="property-alarm-item">
		<div class="property-alarm-item__icon"
			:class="{ 'property-alarm-item__icon--hidden': !showIcon }">
			<Bell :size="20"
				:name="t('calendar', 'Reminder')"
				class="icon" />
		</div>
		<div v-if="!isEditing"
			class="property-alarm-item__label">
			{{ alarm | formatAlarm(isAllDay, currentUserTimezone, locale) }}
		</div>
		<div v-if="isEditing && isRelativeAlarm && !isAllDay"
			class="property-alarm-item__edit property-alarm-item__edit--timed">
			<input type="number"
				min="0"
				max="3600"
				:value="alarm.relativeAmountTimed"
				@input="changeRelativeAmountTimed">
			<AlarmTimeUnitSelect :is-all-day="isAllDay"
				:count="alarm.relativeAmountTimed"
				:unit="alarm.relativeUnitTimed"
				:disabled="false"
				@change="changeRelativeUnitTimed" />
		</div>
		<div v-if="isEditing && isRelativeAlarm && isAllDay"
			class="property-alarm-item__edit property-alarm-item__edit--all-day">
			<div class="property-alarm-item__edit--all-day__distance">
				<input type="number"
					min="0"
					max="3600"
					:value="alarm.relativeAmountAllDay"
					@input="changeRelativeAmountAllDay">
				<AlarmTimeUnitSelect :is-all-day="isAllDay"
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
				<TimePicker :date="relativeAllDayDate"
					@change="changeRelativeHourMinuteAllDay" />
			</div>
		</div>
		<div v-if="isEditing && isAbsoluteAlarm"
			class="property-alarm-item__edit property-alarm-item__edit--absolute">
			<DatePicker prefix="on"
				:date="alarm.absoluteDate"
				:timezone-id="alarm.absoluteTimezoneId"
				:is-all-day="false"
				@change="changeAbsoluteDate"
				@change-timezone="changeAbsoluteTimezoneId" />
		</div>
		<div v-if="!isReadOnly"
			class="property-alarm-item__options">
			<Actions :open="showMenu"
				@update:open="(open) => showMenu = open">
				<ActionRadio v-if="canChangeAlarmType || (!isAlarmTypeDisplay && forceEventAlarmType === 'DISPLAY')"
					:name="alarmTypeName"
					:checked="isAlarmTypeDisplay"
					@change="changeType('DISPLAY')">
					{{ $t('calendar', 'Notification') }}
				</ActionRadio>
				<ActionRadio v-if="canChangeAlarmType || (!isAlarmTypeEmail && forceEventAlarmType === 'EMAIL')"
					:name="alarmTypeName"
					:checked="isAlarmTypeEmail"
					@change="changeType('EMAIL')">
					{{ $t('calendar', 'Email') }}
				</ActionRadio>
				<ActionRadio v-if="canChangeAlarmType && isAlarmTypeAudio"
					:name="alarmTypeName"
					:checked="isAlarmTypeAudio"
					@change="changeType('AUDIO')">
					{{ $t('calendar', 'Audio notification') }}
				</ActionRadio>
				<ActionRadio v-if="canChangeAlarmType && isAlarmTypeOther"
					:name="alarmTypeName"
					:checked="isAlarmTypeOther"
					@change="changeType(alarm.type)">
					{{ $t('calendar', 'Other notification') }}
				</ActionRadio>

				<ActionSeparator v-if="canChangeAlarmType && !isRecurring" />

				<ActionRadio v-if="!isRecurring"
					:name="alarmTriggerName"
					:checked="isRelativeAlarm"
					@change="switchToRelativeAlarm">
					{{ $t('calendar', 'Relative to event') }}
				</ActionRadio>
				<ActionRadio v-if="!isRecurring"
					:name="alarmTriggerName"
					:checked="isAbsoluteAlarm"
					@change="switchToAbsoluteAlarm">
					{{ $t('calendar', 'On date') }}
				</ActionRadio>

				<ActionSeparator />

				<ActionButton v-if="canEdit && !isEditing"
					@click.stop="toggleEditAlarm">
					<template #icon>
						<Pencil :size="20" decorative />
					</template>
					{{ $t('calendar', 'Edit time') }}
				</ActionButton>
				<ActionButton v-if="canEdit && isEditing"
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
import {
	NcActions as Actions,
	NcActionButton as ActionButton,
	NcActionRadio as ActionRadio,
	NcActionSeparator as ActionSeparator,
} from '@nextcloud/vue'
import ClickOutside from 'vue-click-outside'
import formatAlarm from '../../../filters/alarmFormat.js'
import AlarmTimeUnitSelect from './AlarmTimeUnitSelect.vue'
import moment from '@nextcloud/moment'
import TimePicker from '../../Shared/TimePicker.vue'
import DatePicker from '../../Shared/DatePicker.vue'
import Bell from 'vue-material-design-icons/Bell.vue'
import Check from 'vue-material-design-icons/Check.vue'
import Delete from 'vue-material-design-icons/Delete.vue'
import Pencil from 'vue-material-design-icons/Pencil.vue'

import useCalendarObjectInstanceStore from '../../../store/calendarObjectInstance.js'
import useSettingsStore from '../../../store/settings.js'
import { mapStores, mapState } from 'pinia'

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
		Bell,
		Check,
		Delete,
		Pencil,
	},
	directives: {
		ClickOutside,
	},
	filters: {
		formatAlarm,
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
			if (!this.isRelative) {
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
		alarmTypeName() {
			return this._uid + '-radio-type-name'
		},
		alarmTriggerName() {
			return this._uid + '-radio-trigger-name'
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
		 * This method closes the editing mode again
		 */
		closeAlarmEditor() {
			this.showMenu = false
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
		},
		/**
		 * This method emits the removeAlarm event
		 */
		removeAlarm() {
			this.$emit('remove-alarm', this.alarm)
		},
		/**
		 * changes the relative amount entered in timed mode
		 *
		 * @param {Event} event The Input-event triggered when modifying the input
		 */
		changeRelativeAmountTimed(event) {
			const minimumValue = parseInt(event.target.min, 10)
			const maximumValue = parseInt(event.target.max, 10)
			const selectedValue = parseInt(event.target.value, 10)

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
		 * @param {Event} event The Input-event triggered when modifying the input
		 */
		changeRelativeAmountAllDay(event) {
			const minimumValue = parseInt(event.target.min, 10)
			const maximumValue = parseInt(event.target.max, 10)
			const selectedValue = parseInt(event.target.value, 10)

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
