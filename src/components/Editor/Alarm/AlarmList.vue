<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="property-alarm-list">
		<!-- TODO: probably not use index here for the key -->
		<AlarmListItem v-for="(alarm, index) in alarms"
			:key="index"
			:alarm="alarm"
			:calendar-object-instance="calendarObjectInstance"
			:is-read-only="isReadOnly"
			:show-icon="index === 0"
			@remove-alarm="removeAlarm" />
		<AlarmListNew v-if="!isReadOnly"
			:is-all-day="calendarObjectInstance.isAllDay"
			:show-icon="alarms.length === 0"
			@add-alarm="addAlarm" />
	</div>
</template>

<script>
import AlarmListNew from './AlarmListNew.vue'
import AlarmListItem from './AlarmListItem.vue'
import { mapState } from 'vuex'

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
	  ...mapState({
		  forceEventAlarmType: (state) => state.settings.forceEventAlarmType,
	  }),
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
			this.$store.commit('addAlarmToCalendarObjectInstance', {
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
			this.$store.commit('removeAlarmFromCalendarObjectInstance', {
				calendarObjectInstance: this.calendarObjectInstance,
				alarm,
			})
		},
	},
}
</script>
