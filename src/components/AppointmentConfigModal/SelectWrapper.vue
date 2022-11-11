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
	<div>
		<label v-if="label" :for="id">{{ label }}</label>
		<select :id="id"
			:disabled="disabled"
			@change="onSelect">
			<option v-for="option in options"
				:key="option.value"
				:value="option.value"
				v-bind="{ selected: option.value === value }">
				{{ option.label }}
			</option>
		</select>
	</div>
</template>

<script>
import { randomId } from '../../utils/randomId.js'

export default {
	name: 'SelectWrapper',
	props: {
		label: {
			type: String,
			default: '',
		},
		value: {
			type: [String, Number],
			required: true,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		options: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
			id: randomId(),
		}
	},
	methods: {
		onSelect(e) {
			this.$emit('update:value', e.target.value)
		},
	},
}
</script>

<style lang="scss" scoped>
select {
	width: 100%;
}
</style>
