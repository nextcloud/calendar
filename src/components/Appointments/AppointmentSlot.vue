<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcButton class="appointment-slot" :wide="true" @click="$emit('click', $event)">
		{{ startTime }} - {{ endTime }}
	</NcButton>
</template>

<script>
import { NcButton } from '@nextcloud/vue'
import { timeStampToLocaleTime } from '../../utils/localeTime.js'

export default {
	name: 'AppointmentSlot',
	components: {
		NcButton,
	},
	props: {
		start: {
			required: true,
			type: Number,
		},
		end: {
			required: true,
			type: Number,
		},
		timeZoneId: {
			required: true,
			type: String,
		},
	},
	computed: {
		dateTimeFormatter() {
			return Intl.DateTimeFormat(undefined, {
				timeZone: this.timeZoneId,
				timeStyle: 'full',
				dateStyle: 'short',
			})
		},
		startTime() {
			return timeStampToLocaleTime(this.start, this.timeZoneId)
		},
		endTime() {
			return timeStampToLocaleTime(this.end, this.timeZoneId)
		},
	},
}
</script>

<style lang="scss" scoped>
.appointment-slot {
	margin: 5px 0;
}
</style>
