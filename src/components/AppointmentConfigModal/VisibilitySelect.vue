<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import { NcSelect } from '@nextcloud/vue'
import { computed } from 'vue'
import { randomId } from '@/utils/randomId.js'

interface VisibilityOption {
	value: string
	label: string
}

const props = withDefaults(defineProps<{
	label?: string
	modelValue?: string
	disabled?: boolean
}>(), {
	label: '',
	modelValue: 'PUBLIC',
	disabled: false,
})

const emit = defineEmits<{
	'update:modelValue': [value: string]
}>()

const id = randomId()

const options: VisibilityOption[] = [
	{
		value: 'PUBLIC',
		label: t('calendar', 'Public – shown on profile page'),
	},
	{
		value: 'PRIVATE',
		label: t('calendar', 'Private – only accessible via link'),
	},
]

const selection = computed<VisibilityOption>({
	get() {
		return options.find((option) => option.value === props.modelValue) ?? options[0]
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
	<div class="visibility-select">
		<label v-if="label" :for="id">{{ label }}</label>
		<NcSelect
			v-model="selection"
			:inputId="id"
			:disabled="disabled"
			:options="options"
			:clearable="false"
			:labelOutside="true"
			:ariaLabelCombobox="label"
			label="label" />
	</div>
</template>
