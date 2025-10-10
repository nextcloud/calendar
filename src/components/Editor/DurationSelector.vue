<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<!--
    DurationSelector - A reusable duration selection component
-->
<script setup lang="ts">
import { n, t } from '@nextcloud/l10n'
import { computed, ref, watch } from 'vue'
import NcSelect from '@nextcloud/vue/components/NcSelect'

interface DurationOption {
	value: number | 'custom'
	label: string
}

interface SelectOption {
	id: number | string
	label: string
}

interface Props {
	/** Duration value - can be minutes (number) or ISO 8601 duration string (e.g., "PT1H30M") */
	modelValue?: number | string
	/** Output format: 'minutes' (default) or 'iso8601' */
	format?: 'minutes' | 'iso8601'
	/** Label for the duration selector */
	label?: string
	/** Whether to show the label */
	labelOutside?: boolean
	/** Predefined duration options in minutes */
	predefinedOptions?: DurationOption[]
	/** Whether to include custom option */
	showCustom?: boolean
	/** Show days selector in custom mode */
	showDays?: boolean
	/** Show hours selector in custom mode */
	showHours?: boolean
	/** Show minutes selector in custom mode */
	showMinutes?: boolean
	/** Maximum days for custom duration */
	maxDays?: number
	/** Maximum hours for custom duration */
	maxHours?: number
	/** Step for minutes selector */
	minuteStep?: number
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: 0,
	format: 'minutes',
	label: () => t('calendar', 'Duration'),
	labelOutside: false,
	predefinedOptions: () => [
		{ value: 15, label: t('calendar', '15 minutes') },
		{ value: 30, label: t('calendar', '30 minutes') },
		{ value: 60, label: t('calendar', '1 hour') },
		{ value: 90, label: t('calendar', '1 hour 30 minutes') },
		{ value: 120, label: t('calendar', '2 hours') },
	],
	showCustom: true,
	showDays: true,
	showHours: true,
	showMinutes: true,
	maxDays: 30,
	maxHours: 23,
	minuteStep: 5,
})

const emit = defineEmits<{
	'update:modelValue': [value: number | string]
}>()
const predefinedSelected = ref<SelectOption | null>(null)
const customSelected = ref(false)
const customDays = ref<SelectOption | null>(null)
const customHours = ref<SelectOption | null>(null)
const customMinutes = ref<SelectOption | null>(null)

// Computed

// Normalize modelValue to minutes
const internalMinutes = computed<number>(() => {
	if (typeof props.modelValue === 'string') {
		return iso8601ToMinutes(props.modelValue)
	}
	return props.modelValue || 0
})

const allOptions = computed<SelectOption[]>(() => {
	const options = props.predefinedOptions.map((opt: DurationOption) => ({
		id: opt.value,
		label: opt.label,
	}))

	if (props.showCustom) {
		options.push({
			id: 'custom',
			label: t('calendar', 'Custom'),
		})
	}

	return options
})

const selectedOption = computed<SelectOption | null>({
	get() {
		// If we have an internal selection, use it
		if (predefinedSelected.value) {
			return predefinedSelected.value
		}

		// Otherwise, calculate from modelValue
		const predefined = props.predefinedOptions.find((opt: DurationOption) => opt.value === internalMinutes.value)
		if (predefined) {
			const option = {
				id: predefined.value,
				label: predefined.label,
			}
			return option
		}

		// Only select custom if we have a non-zero duration that doesn't match predefined options
		if (props.showCustom && internalMinutes.value > 0) {
			const customOption = {
				id: 'custom',
				label: t('calendar', 'Custom'),
			}
			return customOption
		}

		return null
	},
	set(value: SelectOption | null) {
		predefinedSelected.value = value
	},
})

const isCustomSelected = computed<boolean>(() => {
	return selectedOption.value?.id === 'custom'
})

const daysOptions = computed<SelectOption[]>(() => {
	const options: SelectOption[] = []
	for (let i = 0; i <= props.maxDays; i++) {
		options.push({
			id: i,
			label: n('calendar', '{i} day', '{i} days', i, { i }),
		})
	}
	return options
})

const hoursOptions = computed<SelectOption[]>(() => {
	const options: SelectOption[] = []
	for (let i = 0; i <= props.maxHours; i++) {
		options.push({
			id: i,
			label: n('calendar', '{i} hour', '{i} hours', i, { i }),
		})
	}
	return options
})

const minutesOptions = computed<SelectOption[]>(() => {
	const options: SelectOption[] = []
	for (let i = 0; i < 60; i += props.minuteStep) {
		options.push({
			id: i,
			label: n('calendar', '{i} minute', '{i} minutes', i, { i }),
		})
	}
	return options
})

// Watchers
watch(() => props.modelValue, (newValue: number | string) => {
	const minutes = typeof newValue === 'string' ? iso8601ToMinutes(newValue) : newValue || 0

	// Calculate which option should be selected
	const predefined = props.predefinedOptions.find((opt: DurationOption) => opt.value === minutes)
	if (predefined && !customSelected.value) {
		predefinedSelected.value = {
			id: predefined.value,
			label: predefined.label,
		}
	} else if (props.showCustom && minutes > 0) {
		predefinedSelected.value = {
			id: 'custom',
			label: t('calendar', 'Custom'),
		}
		// Also update custom fields
		updateCustomFields(minutes)
	} else {
		predefinedSelected.value = null
	}
}, { immediate: true })

// Methods
function onOptionChange(option: SelectOption | null): void {
	if (!option) {
		return
	}

	predefinedSelected.value = option

	if (option.id === 'custom') {
		customSelected.value = true
		const initialMinutes = internalMinutes.value || 60
		updateCustomFields(initialMinutes)
		emitDuration(initialMinutes)
	} else {
		customSelected.value = false
		emitDuration(option.id as number)
	}
}

function onCustomDaysChange(option: SelectOption): void {
	customDays.value = option
	emitCustomDuration()
}

function onCustomHoursChange(option: SelectOption): void {
	customHours.value = option
	emitCustomDuration()
}

function onCustomMinutesChange(option: SelectOption): void {
	customMinutes.value = option
	emitCustomDuration()
}

function emitDuration(minutes: number): void {
	if (props.format === 'iso8601') {
		emit('update:modelValue', minutesToISO8601(minutes))
	} else {
		emit('update:modelValue', minutes)
	}
}

function emitCustomDuration(): void {
	const days = (customDays.value?.id as number) || 0
	const hours = (customHours.value?.id as number) || 0
	const minutes = (customMinutes.value?.id as number) || 0
	const totalMinutes = (days * 24 * 60) + (hours * 60) + minutes

	if (totalMinutes > 0) {
		emitDuration(totalMinutes)
	}
}

function updateCustomFields(totalMinutes: number): void {
	const days = Math.floor(totalMinutes / (24 * 60))
	const remainingAfterDays = totalMinutes % (24 * 60)
	const hours = Math.floor(remainingAfterDays / 60)
	const minutes = remainingAfterDays % 60

	customDays.value = daysOptions.value.find((opt) => opt.id === days) || daysOptions.value[0]
	customHours.value = hoursOptions.value.find((opt) => opt.id === hours) || hoursOptions.value[0]

	const closestMinute = Math.round(minutes / props.minuteStep) * props.minuteStep
	customMinutes.value = minutesOptions.value.find((opt) => opt.id === closestMinute) || minutesOptions.value[0]
}

/**
 * convert ISO 8601 duration string to minutes
 * Supports formats like: PT1H30M, PT30M, PT1H, P1DT2H30M
 *
 * @param iso8601 - ISO 8601 duration string
 * @return Total minutes
 */
function iso8601ToMinutes(iso8601: string): number {
	if (!iso8601 || typeof iso8601 !== 'string') {
		return 0
	}

	// deconstruct the ISO 8601 duration string
	const pattern = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/
	const matches = iso8601.match(pattern)
	if (!matches) {
		console.warn('Invalid ISO 8601 duration format:', iso8601)
		return 0
	}
	const days = parseInt(matches[1] || '0', 10)
	const hours = parseInt(matches[2] || '0', 10)
	const minutes = parseInt(matches[3] || '0', 10)
	const seconds = parseInt(matches[4] || '0', 10)

	// Convert everything to minutes (seconds are rounded up)
	return (days * 24 * 60) + (hours * 60) + minutes + Math.ceil(seconds / 60)
}

/**
 * Convert minutes to ISO 8601 duration string
 *
 * @param totalMinutes - Total duration in minutes
 * @return ISO 8601 duration string (e.g., "PT1H30M", "P1DT2H")
 */
function minutesToISO8601(totalMinutes: number): string {
	if (!totalMinutes || totalMinutes < 0) {
		return 'PT0M'
	}

	const days = Math.floor(totalMinutes / (24 * 60))
	const remainingAfterDays = totalMinutes % (24 * 60)
	const hours = Math.floor(remainingAfterDays / 60)
	const minutes = remainingAfterDays % 60

	// construct ISO 8601 string
	let duration = 'P'
	if (days > 0) {
		duration += `${days}D`
	}
	if (hours > 0 || minutes > 0) {
		duration += 'T'
		if (hours > 0) {
			duration += `${hours}H`
		}
		if (minutes > 0) {
			duration += `${minutes}M`
		}
	}

	// If only days (no time component), just return PnD
	// If no duration at all, return PT0M
	return duration === 'P' ? 'PT0M' : duration
}
</script>

<template>
	<div class="duration-selector">
		<NcSelect
			:value="selectedOption"
			:options="allOptions"
			:label-outside="labelOutside"
			:placeholder="label"
			:clearable="false"
			@input="onOptionChange">
			<template #selected-option="option">
				{{ option.label }}
			</template>
		</NcSelect>

		<!-- Custom duration controls (shown when "Custom" is selected) -->
		<div v-if="isCustomSelected" class="duration-selector__custom-controls">
			<NcSelect
				v-if="showDays"
				:value="customDays"
				:options="daysOptions"
				:label-outside="true"
				:placeholder="t('calendar', 'Days')"
				:clearable="false"
				class="duration-selector__custom-select"
				@input="onCustomDaysChange">
				<template #selected-option="option">
					{{ option.label }}
				</template>
			</NcSelect>

			<NcSelect
				v-if="showHours"
				:value="customHours"
				:options="hoursOptions"
				:label-outside="true"
				:placeholder="t('calendar', 'Hours')"
				:clearable="false"
				class="duration-selector__custom-select"
				@input="onCustomHoursChange">
				<template #selected-option="option">
					{{ option.label }}
				</template>
			</NcSelect>

			<NcSelect
				v-if="showMinutes"
				:value="customMinutes"
				:options="minutesOptions"
				:label-outside="true"
				:placeholder="t('calendar', 'Minutes')"
				:clearable="false"
				class="duration-selector__custom-select"
				@input="onCustomMinutesChange">
				<template #selected-option="option">
					{{ option.label }}
				</template>
			</NcSelect>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.duration-selector {
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);
	width: 100%;
	max-width: 100%;
	overflow: hidden;
}

.duration-selector__custom-controls {
	display: flex;
	gap: calc(var(--default-grid-baseline) * 2);
	flex-wrap: nowrap;
	width: 100%;
	max-width: 100%;
	overflow: hidden;
}

.duration-selector__custom-select {
	flex: 1 1 0;
	min-width: 0 !important;
	max-width: 100%;
	margin: 0;
	width: 100%;
}
</style>
