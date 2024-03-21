<!--
  - @copyright 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
  -
  - @author 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
  - @author 2022 Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -->

<template>
	<NcGuestContent>
		<div v-if="!bookingConfirmed"
			class="booking">
			<div class="booking__config-user-info">
				<Avatar :user="userInfo.uid"
					:display-name="userInfo.displayName"
					:disable-tooltip="true"
					:disable-menu="true"
					:size="180" />
				<div class="booking__display-name">
					<strong>{{ userInfo.displayName }}</strong>
				</div>
				<h2 class="booking__name">
					{{ config.name }}
				</h2>
				<!-- Description needs to stay inline due to its whitespace -->
				<span class="booking__description">{{ config.description }}</span>
			</div>
			<div class="booking__date-selection">
				<h3>{{ $t('calendar', 'Select date') }}</h3>
				<div class="booking__date">
					<DateTimePicker v-model="selectedDate"
						:disabled-date="disabledDate"
						type="date"
						@change="fetchSlots" />
				</div>
				<div class="booking__time-zone">
					<TimezonePicker v-model="timeZone" @change="fetchSlots" />
				</div>
			</div>
			<div class="booking__slot-selection">
				<h3>{{ $t('calendar', 'Select slot') }}</h3>

				<div class="booking__slots">
					<Loading v-if="loadingSlots" :size="24" />
					<div v-else-if="slots.length === 0 && !loadingSlots">
						{{ $t('calendar', 'No slots available') }}
					</div>
					<template v-else>
						<AppointmentSlot v-for="slot in slots"
							:key="slot.start"
							:start="slot.start"
							:end="slot.end"
							:time-zone-id="timeZone"
							@click="onSlotClicked(slot)" />
					</template>
				</div>
				<AppointmentDetails v-if="selectedSlot"
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
					@close="selectedSlot = undefined" />
			</div>
		</div>
		<AppointmentBookingConfirmation v-else
			@close="bookingConfirmed = false" />
	</NcGuestContent>
</template>

<script>
import '@nextcloud/dialogs/dist/index.css'

import {
	NcAvatar as Avatar,
	NcDateTimePicker as DateTimePicker,
	NcTimezonePicker as TimezonePicker,
	NcGuestContent,
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

			const startOfDay = new Date(this.selectedDate.getTime())

			try {
				this.slots = await findSlots(
					this.config,
					Math.round(startOfDay.getTime() / 1000),
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
.booking {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	max-width: 800px;

	&__date-selection {
		display: flex;
		flex-direction: column;
	}

	&__description {
		white-space: break-spaces;
	}

	&__config-user-info,
	&__date-selection,
	&__slot-selection {
		padding: 10px;
		flex-grow: 1;
	}

	&__config-user-info {
		flex-grow: 1;
		padding-right: 120px;
	}

	&__date-selection,
	&__slot-selection {
		flex-grow: 2;
	}

	&__time-zone {
	max-width: 250px;
	}

	&__slot-selection .material-design-icon.loading-icon.animation-rotate {
		animation: rotate var(--animation-duration, 0.8s) linear infinite;
	}

	&__slots {
		display: flex;
		flex-direction: column;
	}
}
</style>
