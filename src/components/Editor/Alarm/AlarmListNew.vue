<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
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
	<PropertySelect :prop-model="propModel"
		:is-read-only="false"
		:value="null"
		:show-icon="showIcon"
		class="property-alarm-new"
		@update:value="addReminderFromSelect" />
</template>

<script>
import { mapState } from 'vuex'
import { getDefaultAlarms } from '../../../defaults/defaultAlarmProvider.js'
import {
	getAmountAndUnitForTimedEvents,
	getAmountHoursMinutesAndUnitForAllDayEvents,
} from '../../../utils/alarms.js'
import alarmFormat from '../../../filters/alarmFormat.js'
import PropertySelect from '../Properties/PropertySelect.vue'

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
