<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { NcCheckboxRadioSwitch } from '@nextcloud/vue'
import { computed } from 'vue'
import DurationSelect from './DurationSelect.vue'

const props = withDefaults(defineProps<{
	label: string
	modelValue?: number
	defaultValue?: number
	enabled: boolean
	min?: number
	max?: number | null
}>(), {
	modelValue: 0,
	defaultValue: 0,
	min: 0,
	max: 60 * 60,
})

const emit = defineEmits<{
	'update:modelValue': [value: number]
	'update:enabled': [value: boolean]
}>()

const internalEnabled = computed<boolean>({
	get() {
		return props.enabled
	},

	set(value) {
		emit('update:enabled', value)
	},
})

const valueOrDefault = computed<number>(() => props.modelValue ?? props.defaultValue)

const durationSelection = computed<number>({
	get() {
		return valueOrDefault.value
	},

	set(value) {
		emit('update:modelValue', value)
	},
})
</script>

<template>
	<div class="checked-duration-select">
		<div class="checked-duration-select__checkbox-row">
			<NcCheckboxRadioSwitch v-model="internalEnabled">
				{{ label }}
			</NcCheckboxRadioSwitch>
		</div>
		<DurationSelect
			v-model="durationSelection"
			class="checked-duration-select__duration"
			:allowZero="defaultValue === 0"
			:disabled="!enabled"
			:min="min"
			:max="max" />
	</div>
</template>

<style lang="scss" scoped>
.checked-duration-select {
	&__checkbox-row {
		display: flex;
		align-items: center;

		&__input-wrapper {
			flex: 0 0 calc(var(--default-grid-baseline) * 4);

			input[type=checkbox] {
				margin: 0;
				min-height: unset;
				cursor: pointer;
			}
		}

		input, label {
			display: block;
		}
	}
}
</style>
