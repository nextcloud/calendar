<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script setup lang="ts">
import type { Ref } from 'vue'

import { NcDateTimePickerNative } from '@nextcloud/vue'
import { computed, ref } from 'vue'

const { date } = defineProps<{
	date: Date
}>()

const emit = defineEmits<{
	change: [value: Date]
}>()

const cleared: Ref<boolean> = ref(false)
const timePickerValue = computed<Date | null>({
	get() {
		if (cleared.value) {
			return null
		}
		return date
	},
	set(newValue: Date | null) {
		if (newValue === null) {
			cleared.value = true
			return
		}

		cleared.value = false

		if (date.getHours() !== newValue.getHours() || date.getMinutes() !== newValue.getMinutes()) {
			emit('change', newValue)
		}
	},
})

/**
 * Restores last valid date into a input, if input is cleared.
 */
function restoreClearedInput() {
	cleared.value = false
}
</script>

<template>
	<NcDateTimePickerNative
		v-model="timePickerValue"
		type="time"
		:hideLabel="true"
		v-bind="$attrs"
		@blur="restoreClearedInput" />
</template>
