<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="repeat-option-set repeat-option-set--end">
		<span class="repeat-option-end__label">{{ $t('calendar', 'End repeat') }}</span>
		<NcSelect
			v-model="selectedOption"
			class="repeat-option-end__end-type-select"
			:options="options"
			:searchable="false"
			:inputOutside="true"
			:clearable="false"
			inputId="value"
			label="label" />
		<DatePicker
			v-if="isUntil"
			class="repeat-option-end__until"
			:min="minimumDate"
			:date="until"
			type="date"
			@change="changeUntil" />
		<NcTextField
			v-if="isCount"
			class="repeat-option-end__count"
			type="number"
			:label="$t('calendar', 'Occurrences')"
			:modelValue="String(count)"
			@update:modelValue="changeCount" />
	</div>
</template>

<script>
import { NcSelect, NcTextField } from '@nextcloud/vue'
import { mapStores } from 'pinia'
import DatePicker from '../../Shared/DatePicker.vue'
import useDavRestrictionsStore from '../../../store/davRestrictions.js'

export default {
	name: 'RepeatEndRepeat',
	components: {
		DatePicker,
		NcSelect,
		NcTextField,
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
		selectedOption: {
			get() {
				if (this.count !== null) {
					return this.options.find((option) => option.value === 'count')
				} else if (this.until !== null) {
					return this.options.find((option) => option.value === 'until')
				}

				return this.options.find((option) => option.value === 'never')
			},

			set(value) {
				if (!value) {
					return
				}

				switch (value.value) {
					case 'until':
						this.$emit('changeToUntil')
						break

					case 'count':
						this.$emit('changeToCount')
						break

					case 'never':
					default:
						this.$emit('setInfinite')
				}
			},
		},
	},

	methods: {

		/**
		 * Changes the until-date of this recurrence-set
		 *
		 * @param {Date} date The new date to set as end
		 */
		changeUntil(date) {
			this.$emit('setUntil', date)
		},

		/**
		 * Changes the number of occurrences in this recurrence-set
		 *
		 * @param {string} value The input value
		 */
		changeCount(value) {
			const minimumValue = 1
			const maximumValue = 3500
			const selectedValue = parseInt(value, 10)

			if (selectedValue >= minimumValue && selectedValue <= maximumValue) {
				this.$emit('setCount', selectedValue)
			}
		},
	},
}
</script>
