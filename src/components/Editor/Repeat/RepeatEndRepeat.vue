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
	<div class="repeat-option-set repeat-option-set--end">
		<span class="repeat-option-end__label">{{ $t('calendar', 'End repeat') }}</span>
		<multiselect
			class="repeat-option-end__end-type-select"
			:options="options"
			:searchable="false"
			:allow-empty="false"
			:title="$t('calendar', 'Select to end repeat')"
			:value="selectedOption"
			track-by="value"
			label="label"
			@select="changeEndType"
		/>
		<DatetimePicker
			v-if="isUntil"
			class="repeat-option-end__until"
			:not-before="minimumDate"
			:not-after="maximumDate"
			:value="until"
			type="date"
			@change="changeUntil"
		/>
		<input
			v-if="isCount"
			class="repeat-option-end__count"
			type="number"
			min="1"
			max="3500"
			:value="count"
			@input="changeCount"
		>
		<span
			v-if="isCount"
			class="repeat-option-end__count"
		>
			{{ occurrencesLabel }}
		</span>
	</div>
</template>

<script>
import {
	DatetimePicker,
	Multiselect
} from '@nextcloud/vue'

export default {
	name: 'RepeatEndRepeat',
	components: {
		DatetimePicker,
		Multiselect
	},
	props: {
		/**
		 * The calendar-object instance
		 */
		calendarObjectInstance: {
			type: Object,
			required: true
		},
		count: {
			type: Number,
			default: null
		},
		until: {
			type: Date,
			default: null
		}
	},
	computed: {
		/**
		 * The minimum date the user can select in the until date-picker
		 *
		 * @returns {Date}
		 */
		minimumDate() {
			return this.calendarObjectInstance.startDate
		},
		/**
		 * The maximum date the user can select in the until date-picker
		 *
		 * @returns {Date}
		 */
		maximumDate() {
			return new Date(this.$store.state.davRestrictions.maximumDate)
		},
		/**
		 * Whether or not this event is recurring until a given date
		 *
		 * @returns {Boolean}
		 */
		isUntil() {
			return this.count === null && this.until !== null
		},
		/**
		 * Whether or not this event is recurring after a given amount of occurrences
		 *
		 * @returns {Boolean}
		 */
		isCount() {
			return this.count !== null && this.until === null
		},
		/**
		 * Label for time/times
		 *
		 * @returns {string}
		 */
		occurrencesLabel() {
			return this.$n('calendar', 'time', 'times', this.count)
		},
		/**
		 * Options for recurrence-end
		 *
		 * @returns {Object[]}
		 */
		options() {
			return [{
				label: this.$t('calendar', 'never'),
				value: 'never'
			}, {
				label: this.$t('calendar', 'on date'),
				value: 'until'
			}, {
				label: this.$t('calendar', 'after'),
				value: 'count'
			}]
		},
		/**
		 * The selected option for the recurrence-end
		 *
		 * @returns {Object}
		 */
		selectedOption() {
			if (this.count !== null) {
				return this.options.find(option => option.value === 'count')
			} else if (this.until !== null) {
				return this.options.find(option => option.value === 'until')
			} else {
				return this.options.find(option => option.value === 'never')
			}
		}
	},
	methods: {
		/**
		 * Changes the type of recurrence-end
		 * Whether it ends never, on a given date or after an amount of occurrences
		 *
		 * @param {Object} value The new type of recurrence-end to select
		 */
		changeEndType(value) {
			console.debug(value)
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
		 * @param {Event} event The input event
		 */
		changeCount(event) {
			const minimumValue = parseInt(event.target.min, 10)
			const maximumValue = parseInt(event.target.max, 10)
			const selectedValue = parseInt(event.target.value, 10)

			if (selectedValue >= minimumValue && selectedValue <= maximumValue) {
				this.$emit('setCount', selectedValue)
			}
		}
	}
}
</script>
