<!--
  - @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @author Richard Steinmetz <richard@steinmetz.cloud>
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
	<div class="duration-input">
		<label :for="id">{{ label }}</label>
		<div class="input">
			<input
				:id="id"
				type="number"
				min="0"
				:value="valueInMinutes"
				@input="change">
			<span>{{ t('calendar', 'minutes') }}</span>
		</div>
	</div>
</template>

<script>
import { randomId } from '../../utils/randomId'

export default {
	name: 'DurationInput',
	props: {
		label: {
			type: String,
			required: true,
		},
		value: {
			type: Number,
			default: 0,
		},
	},
	data() {
		return {
			id: randomId(),
		}
	},
	computed: {
		valueInMinutes() {
			return Math.round(this.value / 60)
		},
	},
	methods: {
		change(e) {
			this.$emit('update:value', e.target.value * 60)
		},
	},
}
</script>

<style lang="scss" scoped>
// TODO: move to global scss file
.duration-input {
	.input {
		display: flex;
		align-items: center;

		input {
			flex: 1 auto;
			//max-width: 15em;
		}
	}
}
</style>
