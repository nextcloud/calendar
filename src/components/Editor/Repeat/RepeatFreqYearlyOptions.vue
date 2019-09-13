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
		<span style="font-weight: bold">in:</span>
		<div class="grid">
			<div
				v-for="option in options"
				:key="option.value"
				class="grid-item"
			>
				{{ option.label }}
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'RepeatFreqYearlyOptions',
	computed: {
		options() {
			return [{
				label: monthNamesShort[0],
				value: 1,
			}, {
				label: monthNamesShort[1],
				value: 2,
			}, {
				label: monthNamesShort[2],
				value: 3,
			}, {
				label: monthNamesShort[3],
				value: 4,
			}, {
				label: monthNamesShort[4],
				value: 5,
			}, {
				label: monthNamesShort[5],
				value: 6,
			}, {
				label: monthNamesShort[6],
				value: 7,
			}, {
				label: monthNamesShort[7],
				value: 8,
			}, {
				label: monthNamesShort[8],
				value: 9,
			}, {
				label: monthNamesShort[9],
				value: 10,
			}, {
				label: monthNamesShort[10],
				value: 11,
			}, {
				label: monthNamesShort[11],
				value: 12,
			}]
		}
	}
}
</script>

<style scoped>
.grid {
	display: grid;
	grid-gap: 0;
	grid-template-columns: repeat(4, auto);
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
