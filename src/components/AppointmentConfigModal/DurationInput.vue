<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { NcTextField } from '@nextcloud/vue'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
	label: string
	modelValue?: number
}>(), {
	modelValue: 0,
})

const emit = defineEmits<{
	'update:modelValue': [value: number]
}>()

// Value prop is in seconds but displayed in minutes
const internalValue = computed<number>({
	get() {
		return Math.round(props.modelValue / 60)
	},

	set(value: number) {
		if (value === undefined || Number.isNaN(value)) {
			return
		}
		emit('update:modelValue', value * 60)
	},
})
</script>

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
			inputmode="numeric" />
	</div>
</template>

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
