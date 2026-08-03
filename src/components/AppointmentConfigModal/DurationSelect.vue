<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { n, t } from '@nextcloud/l10n'
import { NcSelect } from '@nextcloud/vue'
import { computed } from 'vue'
import { randomId } from '@/utils/randomId.js'

interface DurationOption {
	value: number
	label: string
}

const props = withDefaults(defineProps<{
	label?: string
	modelValue?: number
	disabled?: boolean
	allowZero?: boolean
	min?: number
	max?: number | null
}>(), {
	label: '',
	modelValue: 5 * 60,
	disabled: false,
	allowZero: false,
	min: 0,
	max: 60 * 60,
})

const emit = defineEmits<{
	'update:modelValue': [value: number]
}>()

const id = randomId()

const availableOptions = computed<DurationOption[]>(() => {
	let options: DurationOption[] = []

	if (props.allowZero) {
		options.push({ value: 0, label: t('calendar', '0 minutes') })
	}

	options.push(...[
		// Minutes
		...[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((duration) => {
			const label = n('calendar', '{duration} minute', '{duration} minutes', duration, {
				duration,
			})
			return { value: duration * 60, label }
		}),

		// Hours
		...[1, 2, 6].map((duration) => {
			const label = n('calendar', '{duration} hour', '{duration} hours', duration, {
				duration,
			})
			return { value: duration * 60 * 60, label }
		}),

		// Days
		...[1, 2].map((duration) => {
			const label = n('calendar', '{duration} day', '{duration} days', duration, {
				duration,
			})
			return { value: duration * 60 * 60 * 24, label }
		}),

		// Weeks
		...[1, 2, 4, 6].map((duration) => {
			const label = n('calendar', '{duration} week', '{duration} weeks', duration, {
				duration,
			})
			return { value: duration * 60 * 60 * 24 * 7, label }
		}),

		// Months
		...[1, 2, 3, 6, 9].map((duration) => {
			const label = n('calendar', '{duration} month', '{duration} months', duration, {
				duration,
			})
			return { value: duration * 60 * 60 * 24 * 30, label }
		}),

		// Years
		...[1].map((duration) => {
			const label = n('calendar', '{duration} year', '{duration} years', duration, {
				duration,
			})
			return { value: duration * 60 * 60 * 24 * 365, label }
		}),
	])

	if (props.min) {
		options = options.filter((option) => {
			return option.value >= props.min || (props.allowZero && option.value === 0)
		})
	}
	if (props.max) {
		options = options.filter((option) => option.value <= props.max!)
	}
	return options
})

const selectedOption = computed<DurationOption | undefined>({
	get() {
		return availableOptions.value.find((option) => option.value === props.modelValue)
	},

	set(option) {
		if (!option) {
			return
		}
		emit('update:modelValue', option.value)
	},
})
</script>

<template>
	<div class="duration-select">
		<label v-if="label" :for="id">{{ label }}</label>
		<NcSelect
			v-model="selectedOption"
			:inputId="id"
			:disabled="disabled"
			:options="availableOptions"
			:clearable="false"
			:labelOutside="true"
			:ariaLabelCombobox="label"
			label="label" />
	</div>
</template>
