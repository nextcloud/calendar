<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcGuestContent class="booking-wrapper">
		<div v-if="!selectedSlot && !bookingConfirmed" class="booking">
			<div class="booking__config-user-info">
				<Avatar :user="userInfo.uid"
					:display-name="userInfo.displayName"
					:disable-tooltip="true"
					:disable-menu="true"
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
					<DateTimePicker v-model="selectedDate"
						:disabled-date="disabledDate"
						type="date"
						:open="true"
						@change="fetchSlots" />
				</div>
				<div class="booking__time-zone">
					<TimezonePicker v-model="timeZone"
						:aria-label="$t('calendar', 'Select a date')"
						@change="fetchSlots" />
				</div>
			</div>
			<div class="booking__slot-selection">
				<h5>{{ $t('calendar', 'Select slot') }}</h5>
				<div class="booking__slots">
					<Loading v-if="loadingSlots" class="loading" :size="24" />
					<NcEmptyContent v-else-if="slots.length === 0 && !loadingSlots"
						:title="$t('calendar', 'No slots available')"
						:description="$t('calendar', 'No slots available')" />
					<template v-else>
						<AppointmentSlot v-for="slot in slots"
							:key="slot.start"
							:start="slot.start"
							:end="slot.end"
							:time-zone-id="timeZone"
							@click="onSlotClicked(slot)" />
					</template>
				</div>
			</div>
		</div>
		<AppointmentDetails v-else-if="selectedSlot && !bookingConfirmed"
			:key="selectedSlot.start"
			:user-info="userInfo"
			:config="config"
			:time-slot="selectedSlot"
			:visitor-info="visitorInfo"
			:time-zone-id="timeZone"
			:show-error="bookingError"
			:show-rate-limiting-warning="bookingRateLimit"
			:is-loading="bookingLoading"
			@save="onSave"
			@close="selectedSlot = undefined"
			@go-back="selectedSlot = undefined" />

		<AppointmentBookingConfirmation v-else
			@close="bookingConfirmed = false" />
	</NcGuestContent>
</template>

<script>
import '@nextcloud/dialogs/style.css'

import {
	NcAvatar as Avatar,
	NcDateTimePicker as DateTimePicker,
	NcTimezonePicker as TimezonePicker,
	NcGuestContent,
	NcEmptyContent,
} from '@nextcloud/vue'
import jstz from 'jstz'
import MDILoading from 'vue-material-design-icons/Loading.vue'
import { showError } from '@nextcloud/dialogs'

import AppointmentSlot from '../../components/Appointments/AppointmentSlot.vue'
import { bookSlot, findSlots } from '../../services/appointmentService.js'
import AppointmentDetails from '../../components/Appointments/AppointmentDetails.vue'
import AppointmentBookingConfirmation from '../../components/Appointments/AppointmentBookingConfirmation.vue'

const Loading = {
	functional: true,
	render(h, { data, props }) {
		return h(MDILoading, {
			data,
			staticClass: 'animation-rotate',
			props,
		})
	},
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
		const defaultTimezone = jstz.determine()
		const defaultTimeZoneId = defaultTimezone ? defaultTimezone.name() : 'UTC'

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
		/**
		 * Whether the date is acceptable
		 *
		 * @param {Date} date The date to compare to
		 * @return {boolean}
		 */
		disabledDate(date) {
			if (date <= this.minimumDate) {
				return true
			}
			return this.endDate && this.endDate < date
		},
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

<style lang="scss" scoped>
.booking-wrapper {
	display: flex;
}

.booking {
	display: flex;
	flex: 1 auto;
	flex-direction: row;
	flex-wrap: wrap;
	width: 900px;
	min-height: 500px;
	margin-bottom: 50px;
	justify-content: space-between;
}

.booking > div {
	flex-basis: 33.33%;
	flex-grow: 1;
}

.booking__config-user-info {
	flex-grow: 1;
}

.booking__date-selection {
	display: flex;
	flex-direction: column;
}

.booking__description {
	white-space: break-spaces;
}

.booking__date-selection,
.booking__slot-selection {
	padding: 0 10px;
}

.booking__time-zone {
	margin-top: 280px;
	position: relative;

	:deep(.v-select.select) {
		max-width: 260px;
	}
}

.booking__date-header {
	position: relative;
	margin-left: 16px;
}

.booking__slot-selection .material-design-icon.loading-icon.animation-rotate {
	animation: rotate var(--animation-duration, 0.8s) linear infinite;
}

.booking__slots {
	display: flex;
	flex-direction: column;
	max-height: 440px;
	overflow-y: auto;
}

:deep(.mx-input-wrapper) {
	display: none;
}

:deep(.mx-datepicker-main) {
	border: 0;
}
h2, h3, h4, h5 {
	margin-top: 0;
}
.booking__date {
	margin-top: -25px;
}

:deep(.cell.disabled) {
		background-color: var(--color-background-dark);
		color: var(--color-main-text);
}

:deep(.cell.not-current-month) {
	background-color: unset;
}

</style>
