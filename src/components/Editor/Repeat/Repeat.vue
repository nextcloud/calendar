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
	<div>
		<repeat-freq-interval
			:frequency="frequency"
			:interval="interval"
			@changeInterval="changeInterval"
			@changeFrequency="changeFrequency"
			@removeRepeat="removeRepeat"
		/>
		<repeat-freq-weekly-options
			v-if="isFreqWeekly"
			:by-day="byDay"
			@addByDay="addByDayWeekly"
			@removeByDay="removeByDayWeekly"
		/>
		<repeat-freq-monthly-options
			v-if="isFreqMonthly"
			:by-day="byDay"
			:by-month-day="byMonthDay"
			:by-set-position="bySetPosition"
			@addByMonthDay="addByMonthDayMonthly"
			@removeByMonthDay="removeByMonthDayMonthly"
			@changeByDay="changeByDayMonthly"
			@changeBySetPosition="changeBySetPositionMonthly"
		/>
		<repeat-freq-yearly-options
			v-if="isFreqYearly"
			:by-day="byDay"
			:by-month="byMonth"
			:by-set-position="bySetPosition"
			@changeByDay="changeByDayYearly"
			@changeByMonth="changeByMonthYearly"
			@changeBySetPosition="changeBySetPositionYearly"
		/>
		<repeat-end-repeat
			v-if="false"
			:until="repeatUntil"
			:count="repeatCount"
			@setInfinite="setInfinite"
			@setUntil="setUntil"
			@setCount="setCount"
		/>
		<repeat-summary
			v-if="false"
			:frequency="frequency"
			:interval="interval"
			:by-day="byDay"
			:by-month="byMonth"
			:by-month-day="byMonthDay"
			:by-set-position="bySetPosition"
			:until="repeatUntil"
			:count="repeatCount"
		/>
		<repeat-fork-warning
			v-if="!isEditingMasterItem" />
	</div>
</template>

<script>
import RepeatEndRepeat from './RepeatEndRepeat.vue'
import RepeatFreqWeeklyOptions from './RepeatFreqWeeklyOptions.vue'
import RepeatFreqMonthlyOptions from './RepeatFreqMonthlyOptions.vue'
import RepeatFreqYearlyOptions from './RepeatFreqYearlyOptions.vue'
import RepeatSummary from './RepeatSummary.vue'
import RepeatFreqInterval from './RepeatFreqInterval.vue'
import RepeatForkWarning from './RepeatForkWarning.vue'

export default {
	name: 'Repeat',
	components: {
		RepeatForkWarning,
		RepeatFreqInterval,
		RepeatFreqYearlyOptions,
		RepeatFreqMonthlyOptions,
		RepeatFreqWeeklyOptions,
		RepeatEndRepeat,
		RepeatSummary,
	},
	props: {
		// TODO: handle multiple RRULES
		eventComponent: {
			type: Object
		},
		isReadOnly: {
			type: Boolean,
			required: true
		},
		isEditingMasterItem: {
			type: Boolean,
			required: true
		}
	},
	data() {
		return {
			frequency: 'NONE',
			interval: 1,
			count: null,
			until: null,
			byDay: [],
			byMonth: [],
			byMonthDay: [],
			bySetPosition: null,
		}
	},
	computed: {
		isRepeating() {
			return this.frequency !== 'NONE'
		},
		isFreqWeekly() {
			return this.frequency === 'WEEKLY'
		},
		isFreqMonthly() {
			return this.frequency === 'MONTHLY'
		},
		isFreqYearly() {
			return this.frequency === 'YEARLY'
		},
		repeatUntil() {
			return null
		},
		repeatCount() {
			return null
		}
	},
	methods: {
		changeInterval(interval) {
			this.interval = interval
		},
		changeFrequency(frequency) {
			this.frequency = frequency
		},
		removeRepeat() {
			this.frequency = 'NONE'
			this.interval = 1
			this.count = null
			this.until = null
			this.byDay = []
			this.byMonth = []
			this.byMonthDay = []
			this.bySetPosition = null
		},
		addByDayWeekly(day) {
			this.byDay.push(day)
		},
		removeByDayWeekly(day) {
			const index = this.byDay.indexOf(day)

			if (index !== -1) {
				this.byDay.splice(index, 1)
			}
		},
		addByMonthDayMonthly(dayOfMonth) {
			this.byMonthDay.push(dayOfMonth)
		},
		removeByMonthDayMonthly(dayOfMonth) {
			const index = this.byMonthDay.indexOf(dayOfMonth)

			if (index !== -1) {
				this.byMonthDay.splice(index, 1)
			}
		},
		changeByDayMonthly() {
			// TODO: delete all other parts and set BYDAY (AND BYSETPOS)
		},
		changeByMonthDayMonthly() {
			// TODO: delete all other parts and set BYMONTHDAY
		},
		changeBySetPositionMonthly() {

		},
		changeByDayYearly() {

		},
		changeByMonthYearly() {

		},
		changeBySetPositionYearly() {

		},
		setInfinite() {

		},
		setUntil() {

		},
		setCount() {

		}
	}
}
</script>
