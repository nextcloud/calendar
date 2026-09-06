<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { NcButton } from '@nextcloud/vue'
import { computed } from 'vue'
import { timeStampToLocaleTime } from '@/utils/localeTime.js'

const props = defineProps<{
	start: number
	end: number
	timeZoneId: string
}>()

defineEmits<{
	click: [event: MouseEvent]
}>()

const startTime = computed<string>(() => timeStampToLocaleTime(props.start, props.timeZoneId))
const endTime = computed<string>(() => timeStampToLocaleTime(props.end, props.timeZoneId))
</script>

<template>
	<NcButton class="appointment-slot" :wide="true" @click="$emit('click', $event)">
		{{ startTime }} - {{ endTime }}
	</NcButton>
</template>

<style lang="scss" scoped>
.appointment-slot {
	margin: 5px 0;
}
</style>
