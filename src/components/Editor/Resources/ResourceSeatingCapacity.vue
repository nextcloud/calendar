<!--
  - @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @author Richard Steinmetz <richard@steinmetz.cloud>
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
	<div class="resource-capacity">
		<div class="resource-capacity__input">
			<input type="number"
				min="0"
				:placeholder="placeholder"
				:value="value"
				@input.prevent.stop="changeValue">
		</div>
	</div>
</template>

<script>
export default {
	name: 'ResourceSeatingCapacity',
	props: {
		value: {
			type: Number,
			required: true,
		},
	},
	computed: {
		placeholder() {
			return this.$t('calendar', 'Minimum seating capacity')
		},
	},
	methods: {
		changeValue(event) {
			this.$emit('update:value', parseInt(event.target.value))
		},
	},
}
</script>
