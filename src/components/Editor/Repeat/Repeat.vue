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
		<RepeatFreqInterval
			v-if="!isRecurrenceException"
			:frequency="recurrenceRule.frequency"
			:interval="recurrenceRule.interval"
			@changeInterval="changeInterval"
			@changeFrequency="changeFrequency" />
		<RepeatFreqWeeklyOptions
			v-if="isFreqWeekly && !isRecurrenceException"
			:by-day="recurrenceRule.byDay"
			@addByDay="addByDay"
			@removeByDay="removeByDay" />
		<RepeatFreqMonthlyOptions
			v-if="isFreqMonthly && !isRecurrenceException"
			:by-day="recurrenceRule.byDay"
			:by-month-day="recurrenceRule.byMonthDay"
			:by-set-position="recurrenceRule.bySetPosition"
			@addByMonthDay="addByMonthDay"
			@removeByMonthDay="removeByMonthDay"
			@changeByDay="setByDay"
			@changeBySetPosition="setBySetPosition"
			@changeToBySetPosition="changeToBySetPositionMonthly"
			@changeToByDay="changeToByDayMonthly" />
		<RepeatFreqYearlyOptions
			v-if="isFreqYearly && !isRecurrenceException"
			:by-day="recurrenceRule.byDay"
			:by-month="recurrenceRule.byMonth"
			:by-set-position="recurrenceRule.bySetPosition"
			@changeByDay="setByDay"
			@changeBySetPosition="setBySetPosition"
			@addByMonth="addByMonth"
			@removeByMonth="removeByMonth"
			@enableBySetPosition="enableBySetPositionYearly"
			@disableBySetPosition="disableBySetPositionYearly" />
		<RepeatEndRepeat
			v-if="isRepeating && !isRecurrenceException"
			:calendar-object-instance="calendarObjectInstance"
			:until="recurrenceRule.until"
			:count="recurrenceRule.count"
			@setInfinite="setInfinite"
			@setUntil="setUntil"
			@setCount="setCount"
			@changeToCount="changeToCount"
			@changeToUntil="changeToUntil" />
		<RepeatSummary
			v-if="true"
			:frequency="recurrenceRule.frequency"
			:interval="recurrenceRule.interval"
			:by-day="recurrenceRule.byDay"
			:by-month="recurrenceRule.byMonth"
			:by-month-day="recurrenceRule.byMonthDay"
			:by-set-position="recurrenceRule.bySetPosition"
			:until="recurrenceRule.until"
			:count="recurrenceRule.count" />
		<RepeatUnsupportedWarning
			v-if="recurrenceRule.isUnsupported && !isRecurrenceException" />
		<RepeatExceptionWarning
			v-if="isRecurrenceException" />
	</div>
</template>

<script>
import RepeatEndRepeat from './RepeatEndRepeat.vue'
import RepeatFreqWeeklyOptions from './RepeatFreqWeeklyOptions.vue'
import RepeatFreqMonthlyOptions from './RepeatFreqMonthlyOptions.vue'
import RepeatFreqYearlyOptions from './RepeatFreqYearlyOptions.vue'
import RepeatFreqInterval from './RepeatFreqInterval.vue'
import RepeatUnsupportedWarning from './RepeatUnsupportedWarning.vue'
import RepeatExceptionWarning from './RepeatExceptionWarning.vue'
import RepeatSummary from './RepeatSummary.vue'

export default {
	name: 'Repeat',
	components: {
		RepeatSummary,
		RepeatExceptionWarning,
		RepeatFreqInterval,
		RepeatFreqYearlyOptions,
		RepeatFreqMonthlyOptions,
		RepeatFreqWeeklyOptions,
		RepeatEndRepeat,
		RepeatUnsupportedWarning
	},
	props: {
		/**
		 * The calendar-object instance
		 */
		calendarObjectInstance: {
			type: Object,
			required: true
		},
		/**
		 * The recurrence-rule to display
		 */
		recurrenceRule: {
			type: Object,
			required: true
		},
		/**
		 * Whether or not the event is read-only
		 */
		isReadOnly: {
			type: Boolean,
			required: true
		},
		/**
		 * Whether or not the user is editing the master-item
		 * If so, we are enforcing "This and all future" and
		 * don't allow to just save this occurrence
		 */
		isEditingMasterItem: {
			type: Boolean,
			required: true
		},
		/**
		 * Whether or not this instance of the event is a recurrence-exception.
		 * If yes, you can't modify the recurrence-rule
		 */
		isRecurrenceException: {
			type: Boolean,
			required: true
		}
	},
	computed: {
		/**
		 * Whether or not this event is recurring
		 *
		 * @returns {Boolean}
		 */
		isRepeating() {
			return this.recurrenceRule.frequency !== 'NONE'
		},
		/**
		 * Whether or not this event is recurring weekly
		 *
		 * @returns {Boolean}
		 */
		isFreqWeekly() {
			return this.recurrenceRule.frequency === 'WEEKLY'
		},
		/**
		 * Whether or not this event is recurring monthly
		 *
		 * @returns {Boolean}
		 */
		isFreqMonthly() {
			return this.recurrenceRule.frequency === 'MONTHLY'
		},
		/**
		 * Whether or not this event is recurring yearly
		 *
		 * @returns {Boolean}
		 */
		isFreqYearly() {
			return this.recurrenceRule.frequency === 'YEARLY'
		}
	},
	methods: {
		/**
		 * Changes the interval of recurrence
		 *
		 * @param {Number} interval Any positive integer
		 */
		changeInterval(interval) {
			this.$store.commit('changeRecurrenceInterval', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
				interval
			})
			this.modified()
		},
		/**
		 * Changes the frequency of recurrence
		 *
		 * @param {String} frequency Allowed values: NONE, DAILY, WEEKLY, MONTHLY, YEARLY
		 */
		changeFrequency(frequency) {
			this.$store.dispatch('changeRecurrenceFrequency', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
				frequency
			})
			this.modified()
		},
		/**
		 * Adds a day to the ByDay part of the recurrence-rule
		 *
		 * @param {String} byDay Day to add
		 */
		addByDay(byDay) {
			this.$store.commit('addByDayToRecurrenceRule', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
				byDay
			})
			this.modified()
		},
		/**
		 * Removes a day from the ByDay part of the recurrence-rule
		 *
		 * @param {String} byDay Day to remove
		 */
		removeByDay(byDay) {
			this.$store.commit('removeByDayFromRecurrenceRule', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
				byDay
			})
			this.modified()
		},
		/**
		 * Adds a month-day to the ByMonthDay part of the recurrence-rule
		 *
		 * @param {String} byMonthDay Month-day to add
		 */
		addByMonthDay(byMonthDay) {
			this.$store.commit('addByMonthDayToRecurrenceRule', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
				byMonthDay
			})
			this.modified()
		},
		/**
		 * Removes a month-day from the ByMonthDay part of the recurrence-rule
		 *
		 * @param {String} byMonthDay Month-day to remove
		 */
		removeByMonthDay(byMonthDay) {
			this.$store.commit('removeByMonthDayFromRecurrenceRule', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
				byMonthDay
			})
			this.modified()
		},
		/**
		 * Adds a month to the ByMonth part of the recurrence-rule
		 *
		 * @param {String} byMonth Month to add
		 */
		addByMonth(byMonth) {
			this.$store.commit('addByMonthToRecurrenceRule', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
				byMonth
			})
			this.modified()
		},
		/**
		 * Removes a month-day from the ByMonth part of the recurrence-rule
		 *
		 * @param {String} byMonth Month to remove
		 */
		removeByMonth(byMonth) {
			this.$store.commit('removeByMonthFromRecurrenceRule', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
				byMonth
			})
			this.modified()
		},
		/**
		 * Overrides the entire byDay-list of the recurrence-rule
		 *
		 * @param {String[]} byDay The new by-day-list to use
		 */
		setByDay(byDay) {
			this.$store.commit('changeRecurrenceByDay', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
				byDay
			})
			this.modified()
		},
		/**
		 * Overrides the set-position of the recurrence-rule
		 * RFC5545 technically allows a list of set-position,
		 * we only allow one value at most
		 *
		 * @param {Number} bySetPosition The new By-set-position part to set
		 */
		setBySetPosition(bySetPosition) {
			this.$store.commit('changeRecurrenceBySetPosition', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
				bySetPosition
			})
			this.modified()
		},
		/**
		 * Changes the monthly recurrence-editor from the selection of monthdays
		 * to the selection of a relative position within the month
		 */
		changeToBySetPositionMonthly() {
			this.$store.dispatch('changeMonthlyRecurrenceFromByDayToBySetPosition', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule
			})
			this.modified()
		},
		/**
		 * Changes the monthly recurrence-editor from the relative position within the month
		 * to the selection of monthdays
		 */
		changeToByDayMonthly() {
			this.$store.dispatch('changeMonthlyRecurrenceFromBySetPositionToByDay', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule
			})
			this.modified()
		},
		/**
		 * Enables the setting of a relative position within the month in the yearly recurrence-editor
		 */
		enableBySetPositionYearly() {
			this.$store.dispatch('enableYearlyRecurrenceBySetPosition', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule
			})
			this.modified()
		},
		/**
		 * Disables the setting of a relative position within the month in the yearly recurrence-editor
		 */
		disableBySetPositionYearly() {
			this.$store.dispatch('disableYearlyRecurrenceBySetPosition', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule
			})
			this.modified()
		},
		/**
		 * Sets the recurrence-set to infinite recurrences
		 */
		setInfinite() {
			this.$store.dispatch('setRecurrenceToInfinite', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule
			})
			this.modified()
		},
		/**
		 *
		 */
		changeToUntil() {
			this.$store.dispatch('enableRecurrenceLimitByUntil', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule
			})
			this.modified()
		},
		/**
		 * Sets the recurrence-set to end on a specific date.
		 * Unlike DTEND, which is the exclusive end,
		 * UNTIL is defined as the inclusive end of the recurrence-set
		 *
		 * @param {Date} until Date to set as new end of recurrence-set
		 */
		setUntil(until) {
			this.$store.commit('changeRecurrenceUntil', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
				until
			})
			this.modified()
		},
		/**
		 *
		 */
		changeToCount() {
			this.$store.dispatch('enableRecurrenceLimitByCount', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule
			})
			this.modified()
		},
		/**
		 * Sets the recurrence-set to end on a specific date
		 *
		 * @param {Number} count New number of recurrences to set
		 */
		setCount(count) {
			this.$store.commit('changeRecurrenceCount', {
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
				count
			})
			this.modified()
		},
		/**
		 *
		 */
		modified() {
			if (this.recurrenceRule.isUnsupported) {
				this.$store.commit('markRecurrenceRuleAsSupported', {
					calendarObjectInstance: this.calendarObjectInstance,
					recurrenceRule: this.recurrenceRule
				})
			}

			if (!this.isEditingMasterItem) {
				this.$emit('forceThisAndAllFuture')
			}
		}
	}
}
</script>
