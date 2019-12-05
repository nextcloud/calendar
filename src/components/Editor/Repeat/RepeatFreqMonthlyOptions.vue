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
	<div class="repeat-option-set repeat-option-set--monthly">
		<div class="repeat-option-set-section">
			<ActionRadio
				class="repeat-option-set-section__title"
				:name="radioInputId"
				:checked="byMonthDayEnabled"
				@change="enableByMonthDay">
				{{ $t('calendar', 'By day of the month') }}
			</ActionRadio>
			<div class="repeat-option-set-section__grid">
				<button
					v-for="option in byMonthDayOptions"
					:key="option.value"
					class="repeat-option-set-section-grid-item"
					:class="{ primary: option.selected }"
					:disabled="!byMonthDayEnabled"
					@click="toggleByMonthDay(option.value)">
					{{ option.label }}
				</button>
			</div>
		</div>
		<div class="repeat-option-set-section repeat-option-set-section--on-the-select">
			<ActionRadio
				class="repeat-option-set-section__title"
				:name="radioInputId"
				:checked="!byMonthDayEnabled"
				@change="enableBySetPosition">
				{{ $t('calendar', 'On the') }}
			</ActionRadio>
			<RepeatFirstLastSelect
				:by-set-position="bySetPosition"
				:disabled="byMonthDayEnabled"
				@change="changeBySetPosition" />
			<RepeatOnTheSelect
				:by-day="byDay"
				:disabled="byMonthDayEnabled"
				@change="changeByDay" />
		</div>
	</div>
</template>

<script>
import RepeatFirstLastSelect from './RepeatFirstLastSelect.vue'
import RepeatOnTheSelect from './RepeatOnTheSelect.vue'
import { ActionRadio } from '@nextcloud/vue/dist/Components/ActionRadio'

export default {
	name: 'RepeatFreqMonthlyOptions',
	components: {
		RepeatOnTheSelect,
		RepeatFirstLastSelect,
		ActionRadio,
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
		 * @returns {Object[]}
		 */
		byMonthDayOptions() {
			const options = []

			for (let i = 1; i <= 31; i++) {
				options.push({
					label: i,
					value: String(i),
					selected: this.byMonthDay.indexOf(String(i)) !== -1,
				})
			}

			return options
		},
		/**
		 * @returns {Boolean}
		 */
		byMonthDayEnabled() {
			return this.byMonthDay.length > 0
		},
		/**
		 * @returns {String}
		 */
		radioInputId() {
			return this._uid + '-radio-select'
		},
	},
	methods: {
		/**
		 *
		 * @param {String} byMonthDay The month-day to toggle
		 */
		toggleByMonthDay(byMonthDay) {
			if (this.byMonthDay.indexOf(byMonthDay) === -1) {
				this.$emit('addByMonthDay', byMonthDay)
			} else {
				if (this.byMonthDay.length > 1) {
					this.$emit('removeByMonthDay', byMonthDay)
				}
			}
		},
		enableByMonthDay() {
			if (this.byMonthDayEnabled) {
				return
			}

			this.$emit('changeToByDay')
		},
		enableBySetPosition() {
			if (!this.byMonthDayEnabled) {
				return
			}

			this.$emit('changeToBySetPosition')
		},
		changeByDay(value) {
			this.$emit('changeByDay', value)
		},
		changeBySetPosition(value) {
			this.$emit('changeBySetPosition', value)
		},
	},
}
</script>
