<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type {
	AppointmentSavePayload,
	AppointmentSlot as AppointmentSlotData,
	AppointmentUserInfo,
	AppointmentVisitorInfo,
	PublicAppointmentConfig,
} from '@/types/appointments.ts'

import { showError } from '@nextcloud/dialogs'
import { t } from '@nextcloud/l10n'
import {
	NcAvatar as Avatar,
	NcDateTimePicker as DateTimePicker,
	NcEmptyContent,
	NcGuestContent,
	NcLoadingIcon,
	NcTimezonePicker as TimezonePicker,
} from '@nextcloud/vue'
import { onMounted, ref, watch } from 'vue'
import AppointmentBookingConfirmation from '@/components/Appointments/AppointmentBookingConfirmation.vue'
import AppointmentDetails from '@/components/Appointments/AppointmentDetails.vue'
import AppointmentSlot from '@/components/Appointments/AppointmentSlot.vue'
import { bookSlot, findSlots } from '@/services/appointmentService.js'
import logger from '@/utils/logger.js'

import '@nextcloud/dialogs/style.css'

const props = defineProps<{
	config: PublicAppointmentConfig
	userInfo: AppointmentUserInfo
	visitorInfo: AppointmentVisitorInfo
}>()

// Try to determine the current timezone, and fall back to UTC otherwise
const defaultTimeZoneId = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

// Build the real first possible date and time
const now = new Date()
const selectedDate = ref(new Date(Math.max(
	props.config.start ? props.config.start * 1000 : now.getTime(),
	now.getTime(),
)))
if (props.config.timeBeforeNextSlot) {
	selectedDate.value.setSeconds(selectedDate.value.getSeconds() + props.config.timeBeforeNextSlot)
}

const minimumDate = new Date(selectedDate.value.getTime())
// Make it one sec before midnight so it shows the next full day as available
minimumDate.setHours(0, 0, 0)
minimumDate.setSeconds(minimumDate.getSeconds() - 1)

const loadingSlots = ref(false)
const timeZone = ref(defaultTimeZoneId)
const slots = ref<AppointmentSlotData[]>([])
const selectedSlot = ref<AppointmentSlotData>()
const bookingConfirmed = ref(false)
const bookingError = ref(false)
const bookingLoading = ref(false)
const bookingRateLimit = ref(false)

watch(selectedDate, () => {
	fetchSlots()
})

watch(timeZone, () => {
	// TODO: fix the @nextcloud/vue component to emit @change
	fetchSlots()
})

watch(selectedSlot, () => {
	bookingError.value = false
})

async function fetchSlots(): Promise<void> {
	slots.value = []
	loadingSlots.value = true

	const selectedDay = selectedDate.value.getFullYear().toString() + '-'
		+ (selectedDate.value.getMonth() + 1).toString() + '-'
		+ selectedDate.value.getDate().toString()

	try {
		slots.value = await findSlots(
			props.config,
			selectedDay,
			timeZone.value,
		)
	} catch (e) {
		showError(t('calendar', 'Could not fetch slots'))
		logger.error('Could not fetch slots', { e })
	} finally {
		loadingSlots.value = false
	}
}

async function onSave({ slot, displayName, email, description, timeZone: slotTimeZone }: AppointmentSavePayload): Promise<void> {
	bookingLoading.value = true
	logger.info('slot will be booked', {
		slot,
		description,
		email,
		displayName,
		timeZone: slotTimeZone,
	})

	bookingError.value = false
	bookingRateLimit.value = false
	try {
		await bookSlot(props.config, slot, displayName, email, description, slotTimeZone)

		logger.info('appointment booked')

		selectedSlot.value = undefined
		bookingConfirmed.value = true
	} catch (e) {
		logger.error('could not book appointment', { e })
		if (e?.response?.status === 429) {
			bookingRateLimit.value = true
		} else {
			bookingError.value = true
		}
	} finally {
		bookingLoading.value = false
	}
}

function onSlotClicked(slot: AppointmentSlotData): void {
	selectedSlot.value = slot
}

onMounted(async () => {
	await fetchSlots()
})
</script>

<template>
	<div class="booking__container">
		<NcGuestContent v-if="!selectedSlot && !bookingConfirmed">
			<div class="booking">
				<div class="booking__config-user-info">
					<Avatar
						:user="userInfo.uid"
						:displayName="userInfo.displayName"
						:disableTooltip="true"
						:disableMenu="true"
						:size="44" />
					<div class="booking__display-name">
						<strong>{{ userInfo.displayName }}</strong>
					</div>
					<h5 class="booking__name">
						{{ config.name }}
					</h5>
					<!-- Description needs to stay inline due to its whitespace -->
					<span class="booking__description">{{ config.description }}</span>
				</div>
				<div class="booking__date-selection">
					<h5 class="booking__date-header">
						{{ $t('calendar', 'Select a date') }}
					</h5>
					<div class="booking__date">
						<DateTimePicker
							v-model="selectedDate"
							:min="minimumDate"
							type="date"
							inline
							:open="true" />
					</div>
					<div class="booking__time-zone">
						<TimezonePicker
							v-model="timeZone"
							:aria-label="$t('calendar', 'Select a date')"
							@change="fetchSlots" />
					</div>
				</div>
				<div class="booking__slot-selection">
					<h5>{{ $t('calendar', 'Select slot') }}</h5>
					<div class="booking__slots">
						<NcLoadingIcon v-if="loadingSlots" :size="24" />
						<NcEmptyContent
							v-else-if="slots.length === 0 && !loadingSlots"
							:title="$t('calendar', 'No slots available')"
							:description="$t('calendar', 'No slots available')" />
						<template v-else>
							<AppointmentSlot
								v-for="slot in slots"
								:key="slot.start"
								:start="slot.start"
								:end="slot.end"
								:timeZoneId="timeZone"
								@click="onSlotClicked(slot)" />
						</template>
					</div>
				</div>
			</div>
		</NcGuestContent>
		<NcGuestContent v-else-if="selectedSlot && !bookingConfirmed">
			<AppointmentDetails
				:key="selectedSlot.start"
				:userInfo="userInfo"
				:config="config"
				:timeSlot="selectedSlot"
				:visitorInfo="visitorInfo"
				:timeZoneId="timeZone"
				:showError="bookingError"
				:showRateLimitingWarning="bookingRateLimit"
				:isLoading="bookingLoading"
				@save="onSave"
				@close="selectedSlot = undefined"
				@goBack="selectedSlot = undefined" />
		</NcGuestContent>
		<NcGuestContent v-else-if="bookingConfirmed">
			<AppointmentBookingConfirmation
				@close="bookingConfirmed = false" />
		</NcGuestContent>
	</div>
</template>

<style lang="scss">
// Need to be unscoped to target the mount point
#appointment-booking {
	display: flex;
	justify-content: center;
	align-items: safe center;
	width: 100%;
	align-self: flex-start;
	min-height: 100%;
	height: auto;
}
</style>

<style lang="scss" scoped>
.booking__container {
	display: flex;
	width: 100%;
	align-self: stretch;
	min-height: 100vh;
	flex-direction: column;
	justify-content: safe center;
	align-items: center;
}

.booking {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: flex-start;
	max-width: 100%;
	gap: calc(var(--default-grid-baseline) * 6);
	padding-top: calc(var(--default-grid-baseline) * 4);
	padding-bottom: calc(var(--default-grid-baseline) * 4);
	padding-inline: calc(var(--default-grid-baseline) * 4);
}

.booking__config-user-info {
	flex: 1 1 320px;
	min-width: 0;
	max-width: 640px;
}

.booking__description {
	white-space: break-spaces;
	overflow-wrap: break-word;
}

.booking__date-selection {
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);
}

.booking__slots {
	display: flex;
	flex-direction: column;
	max-height: 440px;
	overflow-y: auto;
}

.booking__date-selection,
.booking__slot-selection {
	flex: 0 0 auto;
}

.booking__slot-selection {
	min-width: 180px;
}

:deep(.mx-input-wrapper) {
	display: none;
}

:deep(.mx-datepicker-main) {
	border: 0;
}

:deep(.textarea__main-wrapper) {
	height: unset !important;
}
</style>
