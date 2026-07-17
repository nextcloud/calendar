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
	allowEmpty?: boolean
}>(), {
	modelValue: undefined,
	allowEmpty: false,
})

const emit = defineEmits<{
	'update:modelValue': [value: number | undefined]
}>()

const internalValue = computed<number | undefined>({
	get() {
		return props.modelValue ?? (props.allowEmpty ? undefined : 0)
	},

	set(value: number | undefined) {
		if (value === undefined || Number.isNaN(value)) {
			return
		}
		emit('update:modelValue', value ?? (props.allowEmpty ? undefined : 0))
	},
})

</script>

<template>
	<div class="number-input">
		<label for="number-input">{{ label }}</label>
		<NcTextField
			id="number-input"
			v-model="internalValue"
			:label="label"
			:labelOutside="true"
			type="number" />
	</div>
</template>

<style lang="scss" scoped>
// TODO: move to global scss file
.number-input {
	input {
		width: 100%;
	}
}
</style>
