<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
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
	<div class="property-alarm-list">
		<AlarmListItem
			v-for="(alarm, index) in alarms"
			:key="index"
			:alarm="alarm"
			:calendar-object-instance="calendarObjectInstance"
			:is-read-only="isReadOnly"
			@removeAlarm="removeAlarm" />
		<AlarmListNew
			v-if="!isReadOnly"
			:is-all-day="calendarObjectInstance.isAllDay"
			@addAlarm="addAlarm" />
		<NoAlarmView
			v-if="isListEmpty" />
	</div>
</template>

<script>
import AlarmListNew from './AlarmListNew'
import AlarmListItem from './AlarmListItem'
import NoAlarmView from './NoAlarmView.vue'

export default {
	name: 'AlarmList',
	components: {
		NoAlarmView,
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
		alarms() {
			return this.calendarObjectInstance.alarms
		},
		isListEmpty() {
			return this.alarms.length === 0
		},
	},
	methods: {
		/**
		 * Adds another of the default alarms to the event
		 *
		 * @param {Number} totalSeconds Amount of seconds for the alarm
		 */
		addAlarm(totalSeconds) {
			this.$store.commit('addAlarmToCalendarObjectInstance', {
				calendarObjectInstance: this.calendarObjectInstance,
				type: 'DISPLAY',
				totalSeconds,
			})
		},
		/**
		 * Removes an alarm from this event
		 *
		 * @param {Object} alarm The alarm object
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
