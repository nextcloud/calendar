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
	<Multiselect
		class="property-alarm-new"
		track-by="value"
		label="label"
		:placeholder="$t('calendar', '+ Add reminder')"
		:options="options"
		:searchable="false"
		@select="addReminderFromSelect" />
</template>

<script>
import { Multiselect } from '@nextcloud/vue'
import { mapState } from 'vuex'
import getDefaultAlarms from '../../../defaults/defaultAlarmProvider.js'
import {
	getAmountAndUnitForTimedEvents,
	getAmountHoursMinutesAndUnitForAllDayEvents,
} from '../../../utils/alarms.js'
import alarmFormat from '../../../filters/alarmFormat.js'

export default {
	name: 'AlarmListNew',
	components: {
		Multiselect,
	},
	props: {
		isAllDay: {
			type: Boolean,
			required: true,
		},
	},
	computed: {
		...mapState({
			locale: (state) => state.settings.momentLocale,
		}),
		currentUserTimezone() {
			return this.$store.getters.getResolvedTimezone
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
	},
	methods: {
		/**
		 * This emits the add alarm event
		 */
		addReminderFromSelect({ value }) {
			this.$emit('addAlarm', value)
		},
		/**
		 *
		 * @param {Number} time Total amount of seconds for the trigger
		 * @returns {Object} The alarm object
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
