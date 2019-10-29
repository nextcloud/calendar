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
			@addAlarm="addAlarm" />
		<NoAlarmView
			v-if="isListEmpty" />
	</div>
</template>

<script>
import AlarmListNew from './AlarmListNew'
import AlarmListItem from './AlarmListItem'
import NoAlarmView from './NoAlarmView.vue'
import getDefaultAlarms from '../../../defaults/defaultAlarmProvider.js'

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
		alarmTriggerList() {
			return this.calendarObjectInstance.alarms.map(alarm => {
				return alarm.relativeTrigger
			})
		},
		isListEmpty() {
			return this.alarms.length === 0
		},
	},
	methods: {
		/**
		 * Adds another of the default alarms to the event
		 */
		addAlarm() {
			const defaultAlarms = getDefaultAlarms(this.calendarObjectInstance.isAllDay)

			for (const totalSeconds of defaultAlarms) {
				if (this.alarmTriggerList.includes(totalSeconds)) {
					continue
				}

				this.$store.commit('addAlarmToCalendarObjectInstance', {
					calendarObjectInstance: this.calendarObjectInstance,
					type: 'DISPLAY',
					totalSeconds,
				})
				return
			}

			// Just use the last value as fallback
			this.$store.commit('addAlarmToCalendarObjectInstance', {
				calendarObjectInstance: this.calendarObjectInstance,
				type: 'DISPLAY',
				totalSeconds: defaultAlarms[defaultAlarms.length - 1],
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
