<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="property-repeat" :class="{ 'property-repeat--readonly': isReadOnly, 'does-not-repeat': recurrenceRule.frequency === 'NONE' }">
		<div class="property-repeat__summary">
			<RepeatIcon
				class="property-repeat__summary__icon"
				:name="$t('calendar', 'Repeat')"
				:size="20" />
			<RepeatSummary
				class="property-repeat__summary__content"
				:recurrenceRule="recurrenceRule" />
			<Actions v-if="!isReadOnly">
				<ActionButton @click="toggleOptions">
					<template #icon>
						<component
							:is="toggleIcon"
							:size="20"
							decorative />
					</template>
					{{ toggleTitle }}
				</ActionButton>
			</Actions>
		</div>

		<NcModal
			v-model:show="showOptions"
			size="small"
			:name="$t('calendar', 'Repeat event')">
			<div class="property-repeat__options">
				<h2>{{ $t('calendar', 'Repeat event') }}</h2>
				<RepeatFreqInterval
					v-if="!isEditingExceptionInstance && !isReadOnly"
					:frequency="recurrenceRule.frequency"
					:interval="recurrenceRule.interval"
					@changeInterval="changeInterval"
					@changeFrequency="changeFrequency" />
				<RepeatFreqWeeklyOptions
					v-if="isFreqWeekly && !isEditingExceptionInstance && !isReadOnly"
					:byDay="recurrenceRule.byDay"
					@addByDay="addByDay"
					@removeByDay="removeByDay" />
				<RepeatFreqMonthlyOptions
					v-if="isFreqMonthly && !isEditingExceptionInstance && !isReadOnly"
					:byDay="recurrenceRule.byDay"
					:byMonthDay="recurrenceRule.byMonthDay"
					:bySetPosition="recurrenceRule.bySetPosition"
					@addByMonthDay="addByMonthDay"
					@removeByMonthDay="removeByMonthDay"
					@changeByDay="setByDay"
					@changeBySetPosition="setBySetPosition"
					@changeToBySetPosition="changeToBySetPositionMonthly"
					@changeToByMonthDay="changeToByDayMonthly" />
				<RepeatFreqYearlyOptions
					v-if="isFreqYearly && !isEditingExceptionInstance && !isReadOnly"
					:byDay="recurrenceRule.byDay"
					:byMonth="recurrenceRule.byMonth"
					:byMonthDay="recurrenceRule.byMonthDay"
					:bySetPosition="recurrenceRule.bySetPosition"
					@addByMonth="addByMonth"
					@removeByMonth="removeByMonth"
					@addByMonthDay="addByMonthDay"
					@removeByMonthDay="removeByMonthDay"
					@changeByDay="setByDay"
					@changeBySetPosition="setBySetPosition"
					@changeToBySetPosition="changeToBySetPositionYearly"
					@changeToByMonthDay="changeToByDayYearly" />
				<RepeatEndRepeat
					v-if="isRepeating && !isEditingExceptionInstance && !isReadOnly"
					:until="recurrenceRule.until"
					:count="recurrenceRule.count"
					@setInfinite="setInfinite"
					@setUntil="setUntil"
					@setCount="setCount"
					@changeToCount="changeToCount"
					@changeToUntil="changeToUntil" />
				<RepeatUnsupportedWarning v-if="recurrenceRule.isUnsupported && !isEditingExceptionInstance" />
				<RepeatExceptionWarning v-if="isEditingExceptionInstance" />
			</div>
			<div
				v-if="!isEditingExceptionInstance && !isReadOnly"
				class="property-repeat__options__footer">
				<NcButton variant="primary" @click="saveAndClose">
					{{ $t('calendar', 'Set repetition') }}
				</NcButton>
			</div>
		</NcModal>
	</div>
</template>

<script>
import { NcActionButton as ActionButton, NcActions as Actions, NcButton, NcModal } from '@nextcloud/vue'
import { mapState, mapStores } from 'pinia'
import Check from 'vue-material-design-icons/Check.vue'
import Pencil from 'vue-material-design-icons/PencilOutline.vue'
import RepeatIcon from 'vue-material-design-icons/Repeat.vue'
import RepeatEndRepeat from '@/components/Editor/Repeat/RepeatEndRepeat.vue'
import RepeatExceptionWarning from '@/components/Editor/Repeat/RepeatExceptionWarning.vue'
import RepeatFreqInterval from '@/components/Editor/Repeat/RepeatFreqInterval.vue'
import RepeatFreqMonthlyOptions from '@/components/Editor/Repeat/RepeatFreqMonthlyOptions.vue'
import RepeatFreqWeeklyOptions from '@/components/Editor/Repeat/RepeatFreqWeeklyOptions.vue'
import RepeatFreqYearlyOptions from '@/components/Editor/Repeat/RepeatFreqYearlyOptions.vue'
import RepeatSummary from '@/components/Editor/Repeat/RepeatSummary.vue'
import RepeatUnsupportedWarning from '@/components/Editor/Repeat/RepeatUnsupportedWarning.vue'
import useCalendarObjectInstanceStore from '@/store/calendarObjectInstance.js'

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
		NcModal,
		NcButton,
	},

	props: {
		/**
		 * Whether or not the event is read-only
		 */
		isReadOnly: {
			type: Boolean,
			required: true,
		},

		/**
		 * Whether or not the user is editing the base instance.
		 * Recurrence-rule changes on a non-base instance require a future update.
		 */
		isEditingBaseInstance: {
			type: Boolean,
			required: true,
		},

		/**
		 * Whether or not the user is editing a recurrence-exception.
		 * If yes, you can't modify the recurrence-rule
		 */
		isEditingExceptionInstance: {
			type: Boolean,
			required: true,
		},
	},

	emits: ['requireFutureUpdate'],

	data() {
		return {
			showOptions: false,
		}
	},

	computed: {
		...mapStores(useCalendarObjectInstanceStore),
		...mapState(useCalendarObjectInstanceStore, ['calendarObjectInstance']),
		recurrenceRule() {
			return this.calendarObjectInstance.recurrenceRule
		},

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

		changeToUntil() {
			this.calendarObjectInstanceStore.enableRecurrenceLimitByUntil({
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
				recurrenceRule: this.recurrenceRule,
				until,
			})
			this.modified()
		},

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

		modified() {
			if (this.recurrenceRule.isUnsupported) {
				this.calendarObjectInstanceStore.markRecurrenceRuleAsSupported({
					recurrenceRule: this.recurrenceRule,
				})
			}

			if (!this.isEditingBaseInstance) {
				this.$emit('requireFutureUpdate')
			}

			this.calendarObjectInstanceStore.calendarObjectInstance.canModifyAllDay = this.calendarObjectInstanceStore.calendarObjectInstance.eventComponent.canModifyAllDay()
		},

		/**
		 * Save (already applied) and close the modal
		 */
		saveAndClose() {
			this.showOptions = false
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

<style lang="scss" scoped>
.property-repeat__options {
	padding: calc(var(--default-grid-baseline) * 4);
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);
}

.property-repeat__options__footer {
	padding: 0 calc(var(--default-grid-baseline) * 4) calc(var(--default-grid-baseline) * 4);
	display: flex;
	justify-content: flex-end;
}
</style>
