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
		<span style="font-weight: bold">on</span>
		<div class="grid">
			<div
				v-for="option in options"
				:key="option.value"
				class="grid-item"
				:class="{ selected: option.selected }"
				@click="toggleByDay(option.value)"
			>
				{{ option.label }}
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'RepeatFreqWeeklyOptions',
	props: {
		byDay: {
			type: Array,
			required: true
		}
	},
	computed: {
		options() {
			return [{
				label: dayNamesMin[1],
				value: 'MO',
				selected: this.byDay.indexOf('MO') !== -1
			}, {
				label: dayNamesMin[2],
				value: 'TU',
				selected: this.byDay.indexOf('TU') !== -1
			}, {
				label: dayNamesMin[3],
				value: 'WE',
				selected: this.byDay.indexOf('WE') !== -1
			}, {
				label: dayNamesMin[4],
				value: 'TH',
				selected: this.byDay.indexOf('TH') !== -1
			}, {
				label: dayNamesMin[5],
				value: 'FR',
				selected: this.byDay.indexOf('FR') !== -1
			}, {
				label: dayNamesMin[6],
				value: 'SA',
				selected: this.byDay.indexOf('SA') !== -1
			}, {
				label: dayNamesMin[0],
				value: 'SU',
				selected: this.byDay.indexOf('SU') !== -1
			}]
		}
	},
	methods: {
		toggleByDay(day) {
			if (this.byDay.indexOf(day) === -1) {
				this.$emit('addByDay', day)
			} else {
				if (this.byDay.length > 1) {
					this.$emit('removeByDay', day)
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
</style>
