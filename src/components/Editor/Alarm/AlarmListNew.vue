<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<PropertySelect :prop-model="propModel"
		:is-read-only="false"
		:value="null"
		:show-icon="showIcon"
		class="property-alarm-new"
		@update:value="addReminderFromSelect" />
</template>

<script>
import { mapStores, mapState } from 'pinia'
import { getDefaultAlarms } from '../../../defaults/defaultAlarmProvider.js'
import {
	getAmountAndUnitForTimedEvents,
	getAmountHoursMinutesAndUnitForAllDayEvents,
} from '../../../utils/alarms.js'
import alarmFormat from '../../../filters/alarmFormat.js'
import PropertySelect from '../Properties/PropertySelect.vue'
import useSettingsStore from '../../../store/settings.js'

export default {
	name: 'AlarmListNew',
	components: {
		PropertySelect,
	},
	props: {
		isAllDay: {
			type: Boolean,
			required: true,
		},
		showIcon: {
			type: Boolean,
			required: true,
		},
	},
	computed: {
		...mapState(useSettingsStore, {
			locale: 'momentLocale',
		}),
		...mapStores(useSettingsStore),
		currentUserTimezone() {
			return this.settingsStore.getResolvedTimezone
		},
		options() {
			return getDefaultAlarms(this.isAllDay).map((defaultAlarm) => {
				const alarmObject = this.getAlarmObjectFromTriggerTime(defaultAlarm)

				return {
					value: defaultAlarm,
					label: alarmFormat(alarmObject, this.isAllDay, this.currentUserTimezone, this.locale),
				}
			})
		},
		propModel() {
			return {
				options: this.options,
				icon: 'Bell',
				placeholder: this.$t('calendar', '+ Add reminder'),
				readableName: this.$t('calendar', 'Add reminder'),
			}
		},
	},
	methods: {
		/**
		 * This emits the add alarm event
		 *
		 * @param {object} value The alarm value
		 */
		addReminderFromSelect(value) {
			this.$emit('add-alarm', value)
		},
		/**
		 *
		 * @param {number} time Total amount of seconds for the trigger
		 * @return {object} The alarm object
		 */
		getAlarmObjectFromTriggerTime(time) {
			const timedData = getAmountAndUnitForTimedEvents(time)
			const allDayData = getAmountHoursMinutesAndUnitForAllDayEvents(time)

			return {
				isRelative: true,
				absoluteDate: null,
				absoluteTimezoneId: null,
				relativeIsBefore: time < 0,
				relativeIsRelatedToStart: true,
				relativeUnitTimed: timedData.unit,
				relativeAmountTimed: timedData.amount,
				relativeUnitAllDay: allDayData.unit,
				relativeAmountAllDay: allDayData.amount,
				relativeHoursAllDay: allDayData.hours,
				relativeMinutesAllDay: allDayData.minutes,
				relativeTrigger: time,
			}
		},
	},
}
</script>
