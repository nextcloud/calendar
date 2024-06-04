<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
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
