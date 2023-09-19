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
	<div class="number-input">
		<label :for="id">{{ label }}</label>
		<input :id="id"
			type="number"
			min="0"
			:value="realValue"
			@input="change">
	</div>
</template>

<script>
import { randomId } from '../../utils/randomId.js'

export default {
	name: 'NumberInput',
	props: {
		label: {
			type: String,
			required: true,
		},
		value: {
			type: Number,
			default: undefined,
		},
		allowEmpty: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			id: randomId(),
		}
	},
	computed: {
		realValue() {
			if (this.allowEmpty) {
				return this.value
			}

			return this.value ?? 0
		},
	},
	methods: {
		change(e) {
			this.$emit('update:value', parseInt(e.target.value))
		},
	},
}
</script>

<style lang="scss" scoped>
// TODO: move to global scss file
.number-input {
	input {
		width: 100%;
	}
}
</style>
