<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="repeat-option-set repeat-option-set--monthly">
		<div class="repeat-option-set-section">
			<NcCheckboxRadioSwitch class="repeat-option-set-section__title"
				type="radio"
				:name="radioInputId"
				:model-value="byMonthDayEnabled"
				@update:modelValue="enableByMonthDay"
				@update:model-value="enableByMonthDay">
				{{ $t('calendar', 'By day of the month') }}
			</NcCheckboxRadioSwitch>
			<div class="repeat-option-set-section__grid">
				<NcButton v-for="option in byMonthDayOptions"
					:key="option.value"
					class="repeat-option-set-section-grid-item"
					:type="option.selected ? 'primary' : 'secondary'"
					:disabled="!byMonthDayEnabled"
					@click="toggleByMonthDay(option.value)">
					{{ option.label }}
				</NcButton>
			</div>
		</div>
		<div class="repeat-option-set-section repeat-option-set-section--on-the-select">
			<NcCheckboxRadioSwitch class="repeat-option-set-section__title"
				type="radio"
				:name="radioInputId"
				:model-value="!byMonthDayEnabled"
				@update:modelValue="enableBySetPosition"
				@update:model-value="enableBySetPosition">
				{{ $t('calendar', 'On the') }}
			</NcCheckboxRadioSwitch>
			<RepeatFirstLastSelect :by-set-position="bySetPosition"
				:disabled="byMonthDayEnabled"
				@change="changeBySetPosition" />
			<RepeatOnTheSelect :by-day="byDay"
				:disabled="byMonthDayEnabled"
				@change="changeByDay" />
		</div>
	</div>
</template>

<script>
import {
	NcButton,
	NcCheckboxRadioSwitch,
} from '@nextcloud/vue'
import RepeatFirstLastSelect from './RepeatFirstLastSelect.vue'
import RepeatOnTheSelect from './RepeatOnTheSelect.vue'

export default {
	name: 'RepeatFreqMonthlyOptions',
	components: {
		NcButton,
		NcCheckboxRadioSwitch,
		RepeatOnTheSelect,
		RepeatFirstLastSelect,
	},
	props: {
		/**
		 *
		 */
		byDay: {
			type: Array,
			required: true,
		},
		/**
		 *
		 */
		byMonthDay: {
			type: Array,
			required: true,
		},
		/**
		 *
		 */
		bySetPosition: {
			type: Number,
			default: null,
		},
	},
	computed: {
		/**
		 * @return {object[]}
		 */
		byMonthDayOptions() {
			const options = []

			for (let i = 1; i <= 31; i++) {
				options.push({
					label: i,
					value: i,
					selected: this.byMonthDay.indexOf(i) !== -1,
				})
			}

			return options
		},
		/**
		 * @return {boolean}
		 */
		byMonthDayEnabled() {
			return this.byMonthDay.length > 0
		},
		/**
		 * @return {string}
		 */
		radioInputId() {
			return this._uid + '-radio-select'
		},
	},
	methods: {
		/**
		 *
		 * @param {string} byMonthDay The month-day to toggle
		 */
		toggleByMonthDay(byMonthDay) {
			if (this.byMonthDay.indexOf(byMonthDay) === -1) {
				this.$emit('add-by-month-day', byMonthDay)
			} else {
				if (this.byMonthDay.length > 1) {
					this.$emit('remove-by-month-day', byMonthDay)
				}
			}
		},
		enableByMonthDay() {
			if (this.byMonthDayEnabled) {
				return
			}

			this.$emit('change-to-by-month-day')
		},
		enableBySetPosition() {
			if (!this.byMonthDayEnabled) {
				return
			}

			this.$emit('change-to-by-set-position')
		},
		changeByDay(value) {
			this.$emit('change-by-day', value)
		},
		changeBySetPosition(value) {
			this.$emit('change-by-set-position', value)
		},
	},
}
</script>
