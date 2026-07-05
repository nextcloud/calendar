<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="property-alarm-item">
		<div v-if="!isEditing" class="property-alarm-item__front">
			<div class="property-alarm-item__label">
				{{ formatAlarm(displayAlarm, isAllDay, currentUserTimezone, locale) }}
			</div>
		</div>
		<div
			v-if="isEditing && !isAllDay"
			class="property-alarm-item__edit property-alarm-item__edit--timed">
			<NcTextField
				type="number"
				:label="$t('calendar', 'Amount')"
				:labelOutside="true"
				:modelValue="String(displayAlarm.relativeAmountTimed)"
				@update:modelValue="changeRelativeAmountTimed" />
			<AlarmTimeUnitSelect
				:isAllDay="isAllDay"
				:count="displayAlarm.relativeAmountTimed"
				:unit="displayAlarm.relativeUnitTimed"
				:disabled="false"
				@change="changeRelativeUnitTimed" />
		</div>
		<div
			v-if="isEditing && isAllDay"
			class="property-alarm-item__edit property-alarm-item__edit--all-day">
			<div class="property-alarm-item__edit--all-day__distance">
				<NcTextField
					type="number"
					:label="$t('calendar', 'Amount')"
					:labelOutside="false"
					:modelValue="String(displayAlarm.relativeAmountAllDay)"
					@update:modelValue="changeRelativeAmountAllDay" />
				<AlarmTimeUnitSelect
					:isAllDay="isAllDay"
					:count="displayAlarm.relativeAmountAllDay"
					:unit="displayAlarm.relativeUnitAllDay"
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
		<div class="property-alarm-item__options">
			<Actions
				:open="showMenu"
				@update:open="(open) => showMenu = open">
				<ActionRadio
					:name="alarmTypeName"
					value="DISPLAY"
					:modelValue="alarm.action"
					@update:modelValue="changeType('DISPLAY')">
					{{ $t('calendar', 'Notification') }}
				</ActionRadio>
				<ActionRadio
					:name="alarmTypeName"
					value="EMAIL"
					:modelValue="alarm.action"
					@update:modelValue="changeType('EMAIL')">
					{{ $t('calendar', 'Email') }}
				</ActionRadio>

				<ActionSeparator />

				<ActionButton
					v-if="!isEditing"
					@click.stop="toggleEditAlarm">
					<template #icon>
						<Pencil :size="20" decorative />
					</template>
					{{ $t('calendar', 'Edit time') }}
				</ActionButton>
				<ActionButton
					v-if="isEditing"
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
import TimePicker from '../../Shared/TimePicker.vue'
import AlarmTimeUnitSelect from '../../Editor/Alarm/AlarmTimeUnitSelect.vue'
import formatAlarm from '../../../filters/alarmFormat.js'
import useSettingsStore from '../../../store/settings.js'
import { alarmObjectToTrigger, triggerToAlarmObject } from '../../../utils/defaultCalendarAlarms.js'

export default {
	name: 'DefaultAlarmsListItem',
	components: {
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

		isAllDay: {
			type: Boolean,
			required: true,
		},

		showIcon: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			isEditing: false,
			showMenu: false,
		}
	},

	computed: {
		...mapStores(useSettingsStore),
		...mapState(useSettingsStore, {
			locale: 'momentLocale',
		}),

		currentUserTimezone() {
			return this.settingsStore.getResolvedTimezone
		},

		displayAlarm() {
			return triggerToAlarmObject(this.alarm.trigger)
		},

		alarmTypeName() {
			return this.$.uid + '-radio-type-name'
		},

		relativeAllDayDate() {
			const date = new Date()
			date.setHours(this.displayAlarm.relativeHoursAllDay)
			date.setMinutes(this.displayAlarm.relativeMinutesAllDay)

			return date
		},
	},

	methods: {
		formatAlarm,

		emitUpdate(trigger, action = this.alarm.action) {
			this.$emit('updateAlarm', {
				trigger,
				action,
			})
		},

		toggleEditAlarm() {
			this.isEditing = !this.isEditing
			if (this.isEditing) {
				this.showMenu = false
			}
		},

		changeType(type) {
			this.$emit('updateAlarm', {
				trigger: this.alarm.trigger,
				action: type,
			})
			this.showMenu = false
		},

		removeAlarm() {
			this.$emit('removeAlarm')
			this.showMenu = false
		},

		changeRelativeAmountTimed(value) {
			const selectedValue = parseInt(value, 10)
			if (selectedValue >= 0 && selectedValue <= 3600) {
				const alarmObject = { ...this.displayAlarm, relativeAmountTimed: selectedValue }
				this.emitUpdate(alarmObjectToTrigger(alarmObject, false))
			}
		},

		changeRelativeUnitTimed(unit) {
			const alarmObject = { ...this.displayAlarm, relativeUnitTimed: unit }
			this.emitUpdate(alarmObjectToTrigger(alarmObject, false))
		},

		changeRelativeAmountAllDay(value) {
			const selectedValue = parseInt(value, 10)
			if (selectedValue >= 0 && selectedValue <= 3600) {
				const alarmObject = { ...this.displayAlarm, relativeAmountAllDay: selectedValue }
				this.emitUpdate(alarmObjectToTrigger(alarmObject, true))
			}
		},

		changeRelativeUnitAllDay(unit) {
			const alarmObject = { ...this.displayAlarm, relativeUnitAllDay: unit }
			this.emitUpdate(alarmObjectToTrigger(alarmObject, true))
		},

		changeRelativeHourMinuteAllDay(date) {
			const alarmObject = {
				...this.displayAlarm,
				relativeHoursAllDay: date.getHours(),
				relativeMinutesAllDay: date.getMinutes(),
			}
			this.emitUpdate(alarmObjectToTrigger(alarmObject, true))
		},
	},
}
</script>
