<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script setup lang="ts">
import type { Ref } from 'vue'

import { NcDateTimePickerNative } from '@nextcloud/vue'
import { ref, watchEffect } from 'vue'

const { date } = defineProps<{
	date: Date
}>()

const emit = defineEmits<{
	change: [value: Date]
}>()

const timePickerValue: Ref<Date | null> = ref(date)

/**
 * Re
 */
function restoreLastValidDate() {
	timePickerValue.value = date
}

watchEffect(() => {
	if (timePickerValue.value === null) {
		return
	}
	emit('change', timePickerValue.value)
})
</script>

<template>
	<NcDateTimePickerNative
		v-model="timePickerValue"
		type="time"
		:hideLabel="true"
		v-bind="$attrs"
		@blur="restoreLastValidDate" />
</template>
