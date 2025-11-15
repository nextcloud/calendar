<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

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
						<Loading v-if="loadingSlots" class="loading" :size="24" />
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

<script>
import { showError } from '@nextcloud/dialogs'
import {
	NcAvatar as Avatar,
	NcDateTimePicker as DateTimePicker,
	NcEmptyContent,
	NcGuestContent,
	NcTimezonePicker as TimezonePicker,
} from '@nextcloud/vue'
import { h } from 'vue'
import MDILoading from 'vue-material-design-icons/Loading.vue'
import AppointmentBookingConfirmation from '../../components/Appointments/AppointmentBookingConfirmation.vue'
import AppointmentDetails from '../../components/Appointments/AppointmentDetails.vue'
import AppointmentSlot from '../../components/Appointments/AppointmentSlot.vue'
import { bookSlot, findSlots } from '../../services/appointmentService.js'

import '@nextcloud/dialogs/style.css'

function Loading(props) {
	return h(MDILoading, {
		class: 'animation-rotate',
		...props,
	})
}

export default {
	name: 'Booking',
	components: {
		AppointmentSlot,
		Avatar,
		DateTimePicker,
		TimezonePicker,
		AppointmentDetails,
		AppointmentBookingConfirmation,
		NcGuestContent,
		Loading,
		NcEmptyContent,
	},

	props: {
		config: {
			required: true,
			type: Object,
		},

		userInfo: {
			required: true,
			type: Object,
		},

		visitorInfo: {
			required: true,
			type: Object,
		},
	},

	data() {
		// Try to determine the current timezone, and fall back to UTC otherwise
		const defaultTimeZoneId = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

		// Build the real first possible date and time
		const now = new Date()
		const selectedDate = new Date(Math.max(
			this.config.start ? this.config.start * 1000 : now,
			now,
		))
		if (this.config.timeBeforeNextSlot) {
			selectedDate.setSeconds(selectedDate.getSeconds() + this.config.timeBeforeNextSlot)
		}

		const minimumDate = new Date(selectedDate.getTime())
		// Make it one sec before midnight so it shows the next full day as available
		minimumDate.setHours(0, 0, 0)
		minimumDate.setSeconds(minimumDate.getSeconds() - 1)

		return {
			loadingSlots: false,
			minimumDate,
			selectedDate,
			endDate: this.config.end ? new Date(this.config.end * 1000) : undefined,
			timeZone: defaultTimeZoneId,
			slots: [],
			selectedSlot: undefined,
			bookingConfirmed: false,
			bookingError: false,
			bookingLoading: false,
			bookingRateLimit: false,
		}
	},

	watch: {
		selectedDate() {
			this.fetchSlots()
		},

		timeZone() {
			// TODO: fix the @nextcloud/vue component to emit @change
			this.fetchSlots()
		},

		selectedSlot() {
			this.bookingError = false
		},
	},

	async mounted() {
		await this.fetchSlots()
	},

	methods: {
		async fetchSlots() {
			this.slots = []
			this.loadingSlots = true

			const selectedDay = this.selectedDate.getFullYear().toString() + '-'
				+ (this.selectedDate.getMonth() + 1).toString() + '-'
				+ this.selectedDate.getDate().toString()

			try {
				this.slots = await findSlots(
					this.config,
					selectedDay,
					this.timeZone,
				)
			} catch (e) {
				showError(this.$t('calendar', 'Could not fetch slots'))
				console.error('Could not fetch slots', e)
			} finally {
				this.loadingSlots = false
			}
		},

		async onSave({ slot, displayName, email, description, timeZone }) {
			this.bookingLoading = true
			console.info('slot will be booked', {
				slot,
				description,
				email,
				displayName,
				timeZone,
			})

			this.bookingError = false
			this.bookingRateLimit = false
			try {
				await bookSlot(this.config, slot, displayName, email, description, timeZone)

				console.info('appointment booked')

				this.selectedSlot = undefined
				this.bookingConfirmed = true
			} catch (e) {
				console.error('could not book appointment', e)
				if (e?.response?.status === 429) {
					this.bookingRateLimit = true
				} else {
					this.bookingError = true
				}
			} finally {
				this.bookingLoading = false
			}
		},

		onSlotClicked(slot) {
			this.selectedSlot = slot
		},
	},
}
</script>

<style lang="scss">
// Need to be unscoped to target the mount point
#appointment-booking {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
}
</style>

<style lang="scss" scoped>
.booking__container {
	display: flex;
	width: 100%;
	height: 100vh;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.booking {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	max-width: 100%;
	gap: calc(var(--default-grid-baseline) * 6);
	padding-top: calc(var(--default-grid-baseline) * 4);
	padding-bottom: calc(var(--default-grid-baseline) * 4);
	padding-inline: calc(var(--default-grid-baseline) * 4);
}

.booking__description {
	white-space: break-spaces;
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
