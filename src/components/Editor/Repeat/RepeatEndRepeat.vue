<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="repeat-option-set repeat-option-set--end">
		<span class="repeat-option-end__label">{{ $t('calendar', 'End repeat') }}</span>
		<NcSelect class="repeat-option-end__end-type-select"
			:options="options"
			:searchable="false"
			:name="$t('calendar', 'Select to end repeat')"
			:value="selectedOption"
			:clearable="false"
			input-id="value"
			label="label"
			@input="changeEndType" />
		<DatePicker v-if="isUntil"
			class="repeat-option-end__until"
			:min="minimumDate"
			:date="until"
			type="date"
			@change="changeUntil" />
		<input v-if="isCount"
			class="repeat-option-end__count"
			type="number"
			min="1"
			max="3500"
			:value="count"
			@input="changeCount">
		<span v-if="isCount"
			class="repeat-option-end__count">
			{{ occurrencesLabel }}
		</span>
	</div>
</template>

<script>
import DatePicker from '../../Shared/DatePicker.vue'
import { NcSelect } from '@nextcloud/vue'

import { mapStores } from 'pinia'
import useDavRestrictionsStore from '../../../store/davRestrictions.js'

export default {
	name: 'RepeatEndRepeat',
	components: {
		DatePicker,
		NcSelect,
	},
	props: {
		/**
		 * The calendar-object instance
		 */
		calendarObjectInstance: {
			type: Object,
			required: true,
		},
		count: {
			type: Number,
			default: null,
		},
		until: {
			type: Date,
			default: null,
		},
	},
	computed: {
		...mapStores(useDavRestrictionsStore),
		/**
		 * The minimum date the user can select in the until date-picker
		 *
		 * @return {Date}
		 */
		minimumDate() {
			return this.calendarObjectInstance.startDate
		},
		/**
		 * The maximum date the user can select in the until date-picker
		 *
		 * @return {Date}
		 */
		maximumDate() {
			return new Date(this.davRestrictionsStore.maximumDate)
		},
		/**
		 * Whether or not this event is recurring until a given date
		 *
		 * @return {boolean}
		 */
		isUntil() {
			return this.count === null && this.until !== null
		},
		/**
		 * Whether or not this event is recurring after a given amount of occurrences
		 *
		 * @return {boolean}
		 */
		isCount() {
			return this.count !== null && this.until === null
		},
		/**
		 * Label for time/times
		 *
		 * @return {string}
		 */
		occurrencesLabel() {
			return this.$n('calendar', 'time', 'times', this.count)
		},
		/**
		 * Options for recurrence-end
		 *
		 * @return {object[]}
		 */
		options() {
			return [{
				label: this.$t('calendar', 'never'),
				value: 'never',
			}, {
				label: this.$t('calendar', 'on date'),
				value: 'until',
			}, {
				label: this.$t('calendar', 'after'),
				value: 'count',
			}]
		},
		/**
		 * The selected option for the recurrence-end
		 *
		 * @return {object}
		 */
		selectedOption() {
			if (this.count !== null) {
				return this.options.find(option => option.value === 'count')
			} else if (this.until !== null) {
				return this.options.find(option => option.value === 'until')
			} else {
				return this.options.find(option => option.value === 'never')
			}
		},
	},
	methods: {
		/**
		 * Changes the type of recurrence-end
		 * Whether it ends never, on a given date or after an amount of occurrences
		 *
		 * @param {object} value The new type of recurrence-end to select
		 */
		changeEndType(value) {
			console.debug(value)
			if (!value) {
				return
			}

			switch (value.value) {
			case 'until':
				this.$emit('change-to-until')
				break

			case 'count':
				this.$emit('change-to-count')
				break

			case 'never':
			default:
				this.$emit('set-infinite')
			}
		},
		/**
		 * Changes the until-date of this recurrence-set
		 *
		 * @param {Date} date The new date to set as end
		 */
		changeUntil(date) {
			this.$emit('set-until', date)
		},
		/**
		 * Changes the number of occurrences in this recurrence-set
		 *
		 * @param {Event} event The input event
		 */
		changeCount(event) {
			const minimumValue = parseInt(event.target.min, 10)
			const maximumValue = parseInt(event.target.max, 10)
			const selectedValue = parseInt(event.target.value, 10)

			if (selectedValue >= minimumValue && selectedValue <= maximumValue) {
				this.$emit('set-count', selectedValue)
			}
		},
	},
}
</script>
