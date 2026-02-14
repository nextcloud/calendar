<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="property-alarm-list">
		<!-- TODO: probably not use index here for the key -->
		<AlarmListNew
			v-if="!isReadOnly"
			:isAllDay="calendarObjectInstance.isAllDay"
			:showIcon="alarms.length === 0"
			@addAlarm="addAlarm" />
		<AlarmListItem
			v-for="(alarm, index) in alarms"
			:key="index"
			:alarm="alarm"
			:calendarObjectInstance="calendarObjectInstance"
			:isReadOnly="isReadOnly"
			:showIcon="index === 0"
			@removeAlarm="removeAlarm" />
	</div>
</template>

<script>
import { mapState, mapStores } from 'pinia'
import AlarmListItem from './AlarmListItem.vue'
import AlarmListNew from './AlarmListNew.vue'
import useCalendarObjectInstanceStore from '../../../store/calendarObjectInstance.js'
import useSettingsStore from '../../../store/settings.js'

export default {
	name: 'AlarmList',
	components: {
		AlarmListItem,
		AlarmListNew,
	},

	props: {
		isReadOnly: {
			type: Boolean,
			required: true,
		},

		calendarObjectInstance: {
			type: Object,
			required: true,
		},
	},

	computed: {
		...mapStores(useCalendarObjectInstanceStore),
		...mapState(useSettingsStore, ['forceEventAlarmType']),
		alarms() {
			return this.calendarObjectInstance.alarms
		},
	},

	methods: {
		/**
		 * Adds another of the default alarms to the event
		 *
		 * @param {number} totalSeconds Amount of seconds for the alarm
		 */
		addAlarm(totalSeconds) {
			this.calendarObjectInstanceStore.addAlarmToCalendarObjectInstance({
				calendarObjectInstance: this.calendarObjectInstance,
				type: this.forceEventAlarmType || 'DISPLAY',
				totalSeconds,
			})
		},

		/**
		 * Removes an alarm from this event
		 *
		 * @param {object} alarm The alarm object
		 */
		removeAlarm(alarm) {
			this.calendarObjectInstanceStore.removeAlarmFromCalendarObjectInstance({
				calendarObjectInstance: this.calendarObjectInstance,
				alarm,
			})
		},
	},
}
</script>
