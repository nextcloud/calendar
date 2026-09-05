<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script setup lang="ts">
import type { AppointmentBooking } from '@/types/appointments.ts'

import axios from '@nextcloud/axios'
import { generateUrl } from '@nextcloud/router'
import { NcButton, NcLoadingIcon, NcNoteCard } from '@nextcloud/vue'
import { computed, ref } from 'vue'
import IconAccount from 'vue-material-design-icons/AccountOutline.vue'
import IconCalendar from 'vue-material-design-icons/CalendarOutline.vue'
import IconCheck from 'vue-material-design-icons/CheckOutline.vue'
import IconTime from 'vue-material-design-icons/ClockTimeFourOutline.vue'
import IconTimezone from 'vue-material-design-icons/Web.vue'
import BookingResult from '@/views/Appointments/BookingResult.vue'
import { timeStampToLocaleDate, timeStampToLocaleTime } from '@/utils/localeTime.js'

const props = defineProps<{
	booking: AppointmentBooking
	link: string
	token: string
}>()

type BookingStatus = 'confirmed' | 'pending' | 'conflict' | 'expired'

const status = ref<BookingStatus>(props.booking.confirmed ? 'confirmed' : 'pending')
const loading = ref(false)
const error = ref(false)

const date = computed<string>(() => timeStampToLocaleDate(props.booking.start, props.booking.timezone))
const startTime = computed<string>(() => timeStampToLocaleTime(props.booking.start, props.booking.timezone))
const endTime = computed<string>(() => timeStampToLocaleTime(props.booking.end, props.booking.timezone))

async function confirm(): Promise<void> {
	loading.value = true
	error.value = false
	try {
		const url = generateUrl('/apps/calendar/appointment/confirm/{token}', { token: props.token })
		await axios.post(url)
		status.value = 'confirmed'
	} catch (e) {
		if (e?.response?.status === 409) {
			status.value = 'conflict'
		} else if (e?.response?.status === 404) {
			status.value = 'expired'
		} else {
			error.value = true
		}
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<div class="guest-box">
		<div v-if="status === 'expired'" class="update">
			<h2>{{ $t('calendar', 'This booking link is no longer valid') }}</h2>
			<p>{{ $t('calendar', 'The confirmation link has expired or has already been used. Please contact the organizer to rebook.') }}</p>
		</div>

		<BookingResult
			v-else-if="status !== 'pending'"
			:link="link"
			:confirmed="status === 'confirmed'"
			:start="booking.start"
			:end="booking.end" />

		<div v-else class="update">
			<h2>{{ $t('calendar', 'Confirm your appointment') }}</h2>
			<div class="booking__date">
				<IconCalendar :size="16" />
				{{ date }}
			</div>
			<div class="booking__time">
				<IconTime :size="16" />
				{{ startTime }} – {{ endTime }}
			</div>
			<div class="booking__time">
				<IconTimezone :size="16" />
				{{ booking.timezone }}
			</div>
			<div class="booking__attendee">
				<IconAccount :size="16" />
				{{ booking.displayName }} ({{ booking.email }})
			</div>
			<NcNoteCard v-if="error" type="error">
				{{ $t('calendar', 'Could not confirm the appointment. Please try again later or contact the organizer.') }}
			</NcNoteCard>
			<div class="buttons">
				<NcButton variant="primary" :disabled="loading" @click="confirm">
					<template #icon>
						<NcLoadingIcon v-if="loading" :size="16" />
						<IconCheck v-else :size="16" />
					</template>
					{{ $t('calendar', 'Confirm') }}
				</NcButton>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.booking__date,
.booking__time,
.booking__attendee {
	display: flex;
	align-items: center;
	gap: 4px;
	padding-top: 10px;
}

.buttons {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-top: 20px;
}
</style>
