<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="duration-input">
		<label for="duration-input">{{ label }}</label>
		<NcTextField
			id="duration-input"
			v-model="internalValue"
			:label="label"
			:labelOutside="true"
			type="number"
			min="0"
			step="1"
			inputmode="numeric"
			@update:modelValue="change" />
	</div>
</template>

<script>
import { NcTextField } from '@nextcloud/vue'

export default {
	name: 'DurationInput',
	components: {
		NcTextField,
	},

	props: {
		label: {
			type: String,
			required: true,
		},

		modelValue: {
			type: Number,
			default: 0,
		},
	},

	emits: ['update:modelValue', 'update:model-value'],

	data() {
		return {
			internalValue: '',
		}
	},

	computed: {
		valueInMinutes() {
			// Convert value prop from seconds to minutes
			return Math.round(this.modelValue / 60)
		},

		parsedInternalValue() {
			if (this.internalValue === '') {
				return 0
			}

			const minutes = Number.parseInt(this.internalValue, 10)
			return Number.isNaN(minutes) ? 0 : minutes
		},
	},

	watch: {
		modelValue(newVal) {
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
			const sanitizedValue = String(this.internalValue).replace(/\D+/g, '')
			if (sanitizedValue !== this.internalValue) {
				this.internalValue = sanitizedValue
			}

			// Emit value in seconds

			this.$emit('update:modelValue', this.parsedInternalValue * 60)
		},

		updateInternalValue() {
			this.internalValue = this.valueInMinutes.toString()
		},
	},
}
</script>

<style lang="scss" scoped>
.duration-input {
	label {
		display: flex;
		gap: var(--default-grid-baseline);
		align-items: center;

	}
	.input {
		display: flex;
		align-items: center;

		input {
			flex: 1 auto;
		}

	}
}
</style>
