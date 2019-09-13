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
		<div>
			<input id="repeat-freq-monthly-options-select-by-month-of-day"
				v-model="selectByMonthOfDay" type="checkbox" class="checkbox">
			<label for="repeat-freq-monthly-options-select-by-month-of-day">By day of month</label>
			<div class="grid">
				<div
					v-for="option in byMonthDayOptions"
					:key="option.value"
					class="grid-item"
					:class="{ selected: option.selected }"
					@click="toggleByMonthDay(option.value)"
				>
					{{ option.label }}
				</div>
			</div>
		</div>
		<div style="margin-top: 20px">
			<input id="repeat-freq-monthly-options-select-by-set-pos"
				v-model="selectBySetPos" type="checkbox" class="checkbox">
			<label for="repeat-freq-monthly-options-select-by-set-pos">On the</label>
			<div style="display: flex">
				<repeat-first-last-select />
				<repeat-on-the-select />
			</div>
		</div>
	</div>
</template>

<script>
import RepeatFirstLastSelect from './RepeatFirstLastSelect.vue'
import RepeatOnTheSelect from './RepeatOnTheSelect.vue'

export default {
	name: 'RepeatFreqMonthlyOptions',
	components: {
		RepeatOnTheSelect,
		RepeatFirstLastSelect
	},
	props: {
		byDay: {
			type: Array,
			required: true
		},
		byMonthDay: {
			type: Array,
			required: true,
		},
		bySetPosition: {
			type: Number,
			required: true,
			default: null
		}
	},
	data() {
		return {
			selectByMonthOfDay: true,
			selectBySetPos: false
		}
	},
	computed: {
		byMonthDayOptions() {
			const options = []

			for (let i = 1; i <= 31; i++) {
				options.push({
					label: i,
					value: String(i),
					selected: this.byMonthDay.indexOf(String(i)) !== -1
				})
			}

			return options
		}
	},
	methods: {
		toggleByMonthDay(day) {
			if (this.byMonthDay.indexOf(day) === -1) {
				this.$emit('addByMonthDay', day)
			} else {
				if (this.byMonthDay.length > 1) {
					this.$emit('removeByMonthDay', day)
				}
			}
		}
	}
}
</script>

<style scoped>
.grid {
	display: grid;
	grid-gap: 0;
	grid-template-columns: repeat(7, auto);
}

.grid-item {
	padding: 8px;
	border: 1px solid var(--color-border-dark);
	text-align: center;
	background-color: var(--color-background-dark);
	color: var(--color-text-lighter);
}

.grid-item.selected {
	background-color: var(--color-primary-element);
	border-color: var(--color-primary-element);
	color: var(--color-primary-text);
}

.multiselect {
	width: 50% !important;
}
</style>
