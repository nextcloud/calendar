<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
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
	<div class="repeat-option-set repeat-option-set--monthly">
		<div class="repeat-option-set-section">
			<ActionRadio class="repeat-option-set-section__title"
				:name="radioInputId"
				:checked="byMonthDayEnabled"
				@change="enableByMonthDay">
				{{ $t('calendar', 'By day of the month') }}
			</ActionRadio>
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
			<ActionRadio class="repeat-option-set-section__title"
				:name="radioInputId"
				:checked="!byMonthDayEnabled"
				@change="enableBySetPosition">
				{{ $t('calendar', 'On the') }}
			</ActionRadio>
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
	NcActionRadio as ActionRadio,
} from '@nextcloud/vue'
import RepeatFirstLastSelect from './RepeatFirstLastSelect.vue'
import RepeatOnTheSelect from './RepeatOnTheSelect.vue'

export default {
	name: 'RepeatFreqMonthlyOptions',
	components: {
		NcButton,
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
		 * @return {object[]}
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

			this.$emit('change-to-by-day')
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
