<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="property-repeat" :class="{ 'property-repeat--readonly': isReadOnly }">
		<div class="property-repeat__summary">
			<RepeatIcon class="property-repeat__summary__icon"
				:name="$t('calendar', 'Repeat')"
				:size="20" />
			<RepeatSummary class="property-repeat__summary__content"
				:recurrence-rule="recurrenceRule" />
			<Actions v-if="!isReadOnly">
				<ActionButton @click="toggleOptions">
					<template #icon>
						<component :is="toggleIcon"
							:size="20"
							decorative />
					</template>
					{{ toggleTitle }}
				</ActionButton>
			</Actions>
		</div>

		<div v-if="showOptions"
			class="property-repeat__options">
			<RepeatFreqInterval v-if="!isRecurrenceException && !isReadOnly"
				:frequency="recurrenceRule.frequency"
				:interval="recurrenceRule.interval"
				@change-interval="changeInterval"
				@change-frequency="changeFrequency" />
			<RepeatFreqWeeklyOptions v-if="isFreqWeekly && !isRecurrenceException && !isReadOnly"
				:by-day="recurrenceRule.byDay"
				@add-by-day="addByDay"
				@remove-by-day="removeByDay" />
			<RepeatFreqMonthlyOptions v-if="isFreqMonthly && !isRecurrenceException && !isReadOnly"
				:by-day="recurrenceRule.byDay"
				:by-month-day="recurrenceRule.byMonthDay"
				:by-set-position="recurrenceRule.bySetPosition"
				@add-by-month-day="addByMonthDay"
				@remove-by-month-day="removeByMonthDay"
				@change-by-day="setByDay"
				@change-by-set-position="setBySetPosition"
				@change-to-by-set-position="changeToBySetPositionMonthly"
				@change-to-by-month-day="changeToByDayMonthly" />
			<RepeatFreqYearlyOptions v-if="isFreqYearly && !isRecurrenceException && !isReadOnly"
				:by-day="recurrenceRule.byDay"
				:by-month="recurrenceRule.byMonth"
				:by-month-day="recurrenceRule.byMonthDay"
				:by-set-position="recurrenceRule.bySetPosition"
				@add-by-month="addByMonth"
				@remove-by-month="removeByMonth"
				@add-by-month-day="addByMonthDay"
				@remove-by-month-day="removeByMonthDay"
				@change-by-day="setByDay"
				@change-by-set-position="setBySetPosition"
				@change-to-by-set-position="changeToBySetPositionYearly"
				@change-to-by-month-day="changeToByDayYearly" />
			<RepeatEndRepeat v-if="isRepeating && !isRecurrenceException && !isReadOnly"
				:calendar-object-instance="calendarObjectInstance"
				:until="recurrenceRule.until"
				:count="recurrenceRule.count"
				@set-infinite="setInfinite"
				@set-until="setUntil"
				@set-count="setCount"
				@change-to-count="changeToCount"
				@change-to-until="changeToUntil" />
			<RepeatUnsupportedWarning v-if="recurrenceRule.isUnsupported && !isRecurrenceException" />
			<RepeatExceptionWarning v-if="isRecurrenceException" />
		</div>
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
import RepeatIcon from 'vue-material-design-icons/Repeat.vue'
import Pencil from 'vue-material-design-icons/Pencil.vue'
import Check from 'vue-material-design-icons/Check.vue'
import { NcActions as Actions, NcActionButton as ActionButton } from '@nextcloud/vue'

import useCalendarObjectInstanceStore from '../../../store/calendarObjectInstance.js'
import { mapStores } from 'pinia'

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
		RepeatUnsupportedWarning,
		RepeatIcon,
		Pencil,
		Check,
		Actions,
		ActionButton,
	},
	props: {
		/**
		 * The calendar-object instance
		 */
		calendarObjectInstance: {
			type: Object,
			required: true,
		},
		/**
		 * The recurrence-rule to display
		 */
		recurrenceRule: {
			type: Object,
			required: true,
		},
		/**
		 * Whether or not the event is read-only
		 */
		isReadOnly: {
			type: Boolean,
			required: true,
		},
		/**
		 * Whether or not the user is editing the master-item
		 * If so, we are enforcing "This and all future" and
		 * don't allow to just save this occurrence
		 */
		isEditingMasterItem: {
			type: Boolean,
			required: true,
		},
		/**
		 * Whether or not this instance of the event is a recurrence-exception.
		 * If yes, you can't modify the recurrence-rule
		 */
		isRecurrenceException: {
			type: Boolean,
			required: true,
		},
	},
	data() {
		return {
			showOptions: false,
		}
	},
	computed: {
		...mapStores(useCalendarObjectInstanceStore),
		/**
		 * Whether or not this event is recurring
		 *
		 * @return {boolean}
		 */
		isRepeating() {
			return this.recurrenceRule.frequency !== 'NONE'
		},
		/**
		 * Whether or not this event is recurring weekly
		 *
		 * @return {boolean}
		 */
		isFreqWeekly() {
			return this.recurrenceRule.frequency === 'WEEKLY'
		},
		/**
		 * Whether or not this event is recurring monthly
		 *
		 * @return {boolean}
		 */
		isFreqMonthly() {
			return this.recurrenceRule.frequency === 'MONTHLY'
		},
		/**
		 * Whether or not this event is recurring yearly
		 *
		 * @return {boolean}
		 */
		isFreqYearly() {
			return this.recurrenceRule.frequency === 'YEARLY'
		},
		/**
		 * The name of the icon for the toggle options button
		 *
		 * @return {string}
		 */
		toggleIcon() {
			if (this.showOptions) {
				return 'Check'
			}
			return 'Pencil'
		},
		/**
		 * The text of the toggle options button
		 *
		 * @return {string}
		 */
		toggleTitle() {
			if (this.showOptions) {
				return this.t('calendar', 'Save')
			}
			return this.t('calendar', 'Edit')
		},
	},
	methods: {
		/**
		 * Changes the interval of recurrence
		 *
		 * @param {number} interval Any positive integer
		 */
		changeInterval(interval) {
			this.calendarObjectInstanceStore.changeRecurrenceInterval({
				recurrenceRule: this.recurrenceRule,
				interval,
			})
			this.modified()
		},
		/**
		 * Changes the frequency of recurrence
		 *
		 * @param {string} frequency Allowed values: NONE, DAILY, WEEKLY, MONTHLY, YEARLY
		 */
		changeFrequency(frequency) {
			this.calendarObjectInstanceStore.changeRecurrenceFrequency({
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
				frequency,
			})
			this.modified()
		},
		/**
		 * Adds a day to the ByDay part of the recurrence-rule
		 *
		 * @param {string} byDay Day to add
		 */
		addByDay(byDay) {
			this.calendarObjectInstanceStore.addByDayToRecurrenceRule({
				recurrenceRule: this.recurrenceRule,
				byDay,
			})
			this.modified()
		},
		/**
		 * Removes a day from the ByDay part of the recurrence-rule
		 *
		 * @param {string} byDay Day to remove
		 */
		removeByDay(byDay) {
			this.calendarObjectInstanceStore.removeByDayFromRecurrenceRule({
				recurrenceRule: this.recurrenceRule,
				byDay,
			})
			this.modified()
		},
		/**
		 * Adds a month-day to the ByMonthDay part of the recurrence-rule
		 *
		 * @param {string} byMonthDay Month-day to add
		 */
		addByMonthDay(byMonthDay) {
			this.calendarObjectInstanceStore.addByMonthDayToRecurrenceRule({
				recurrenceRule: this.recurrenceRule,
				byMonthDay,
			})
			this.modified()
		},
		/**
		 * Removes a month-day from the ByMonthDay part of the recurrence-rule
		 *
		 * @param {string} byMonthDay Month-day to remove
		 */
		removeByMonthDay(byMonthDay) {
			this.calendarObjectInstanceStore.removeByMonthDayFromRecurrenceRule({
				recurrenceRule: this.recurrenceRule,
				byMonthDay,
			})
			this.modified()
		},
		/**
		 * Adds a month to the ByMonth part of the recurrence-rule
		 *
		 * @param {string} byMonth Month to add
		 */
		addByMonth(byMonth) {
			this.calendarObjectInstanceStore.addByMonthToRecurrenceRule({
				recurrenceRule: this.recurrenceRule,
				byMonth,
			})
			this.modified()
		},
		/**
		 * Removes a month-day from the ByMonth part of the recurrence-rule
		 *
		 * @param {string} byMonth Month to remove
		 */
		removeByMonth(byMonth) {
			this.calendarObjectInstanceStore.removeByMonthFromRecurrenceRule({
				recurrenceRule: this.recurrenceRule,
				byMonth,
			})
			this.modified()
		},
		/**
		 * Overrides the entire byDay-list of the recurrence-rule
		 *
		 * @param {string[]} byDay The new by-day-list to use
		 */
		setByDay(byDay) {
			this.calendarObjectInstanceStore.changeRecurrenceByDay({
				recurrenceRule: this.recurrenceRule,
				byDay,
			})
			this.modified()
		},
		/**
		 * Overrides the set-position of the recurrence-rule
		 * RFC5545 technically allows a list of set-position,
		 * we only allow one value at most
		 *
		 * @param {number} bySetPosition The new By-set-position part to set
		 */
		setBySetPosition(bySetPosition) {
			this.calendarObjectInstanceStore.changeRecurrenceBySetPosition({
				recurrenceRule: this.recurrenceRule,
				bySetPosition,
			})
			this.modified()
		},
		/**
		 * Changes the monthly recurrence-editor from the selection of monthdays
		 * to the selection of a relative position within the month
		 */
		changeToBySetPositionMonthly() {
			this.calendarObjectInstanceStore.changeMonthlyRecurrenceFromByDayToBySetPosition({
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
			})
			this.modified()
		},
		/**
		 * Changes the monthly recurrence-editor from the relative position within the month
		 * to the selection of monthdays
		 */
		changeToByDayMonthly() {
			this.calendarObjectInstanceStore.changeMonthlyRecurrenceFromBySetPositionToByDay({
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
			})
			this.modified()
		},
		/**
		 * Changes the yearly recurrence-editor from the selection of monthdays
		 * to the selection of a relative position within the month
		 */
		 changeToBySetPositionYearly() {
			this.calendarObjectInstanceStore.changeYearlyRecurrenceFromByDayToBySetPosition({
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
			})
			this.modified()
		},
		/**
		 * Changes the yearly recurrence-editor from the relative position within a month
		 * to the selection of monthdays
		 */
		changeToByDayYearly() {
			this.calendarObjectInstanceStore.changeYearlyRecurrenceFromBySetPositionToByDay({
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
			})
			this.modified()
		},
		/**
		 * Sets the recurrence-set to infinite recurrences
		 */
		setInfinite() {
			this.calendarObjectInstanceStore.changeRecurrenceToInfinite({
				recurrenceRule: this.recurrenceRule,
			})
			this.modified()
		},
		/**
		 *
		 */
		changeToUntil() {
			this.calendarObjectInstanceStore.enableRecurrenceLimitByUntil({
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
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
			this.calendarObjectInstanceStore.changeRecurrenceUntil({
				calendarObjectInstance: this.calendarObjectInstance,
				recurrenceRule: this.recurrenceRule,
				until,
			})
			this.modified()
		},
		/**
		 *
		 */
		changeToCount() {
			this.calendarObjectInstanceStore.enableRecurrenceLimitByCount({
				recurrenceRule: this.recurrenceRule,
			})
			this.modified()
		},
		/**
		 * Sets the recurrence-set to end on a specific date
		 *
		 * @param {number} count New number of recurrences to set
		 */
		setCount(count) {
			this.calendarObjectInstanceStore.changeRecurrenceCount({
				recurrenceRule: this.recurrenceRule,
				count,
			})
			this.modified()
		},
		/**
		 *
		 */
		modified() {
			if (this.recurrenceRule.isUnsupported) {
				this.calendarObjectInstanceStore.markRecurrenceRuleAsSupported({
					recurrenceRule: this.recurrenceRule,
				})
			}

			if (!this.isEditingMasterItem) {
				this.$emit('force-this-and-all-future')
			}
		},
		/**
		 * Toggle visibility of the options
		 */
		toggleOptions() {
			this.showOptions = !this.showOptions
		},
	},
}
</script>
