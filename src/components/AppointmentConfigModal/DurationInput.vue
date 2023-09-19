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
	<div class="duration-input">
		<label :for="id">{{ label }}</label>
		<div class="input">
			<input :id="id"
				v-model="internalValue"
				type="text"
				@input="change"
				@focus="focus"
				@blur="updateInternalValue">
		</div>
	</div>
</template>

<script>
import { randomId } from '../../utils/randomId.js'

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
			internalValue: '',
		}
	},
	computed: {
		valueInMinutes() {
			// Convert value prop from seconds to minutes
			return Math.round(this.value / 60)
		},
		valueWithUnit() {
			return this.$n('calendar', '{duration} minute', '{duration} minutes', this.valueInMinutes, {
				duration: this.valueInMinutes,
			})
		},
		parsedInternalValue() {
			const matches = this.internalValue.match(/[0-9]+/)
			if (!matches) {
				return 0
			}

			const minutes = parseInt(matches[0])
			return isNaN(minutes) ? 0 : minutes
		},
	},
	watch: {
		value(newVal) {
			// Only apply new value if it really changed compared to the internal state
			if (this.parsedInternalValue * 60 !== newVal) {
				this.updateInternalValue()
			}
		},
	},
	mounted() {
		this.updateInternalValue()
	},
	methods: {
		change() {
			// Emit value in seconds
			this.$emit('update:value', this.parsedInternalValue * 60)
		},
		focus() {
			// Remove minutes prefix upon focus
			this.internalValue = this.valueInMinutes.toString()
		},
		updateInternalValue() {
			this.internalValue = this.valueWithUnit
		},
	},
}
</script>

<style lang="scss" scoped>
.duration-input {
	.input {
		display: flex;
		align-items: center;

		input {
			flex: 1 auto;
		}
	}
}
</style>
