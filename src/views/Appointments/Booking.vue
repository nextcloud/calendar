<!--
  - @copyright 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
  -
  - @author 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
  -
  - @license GNU AGPL version 3 or any later version
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
				<DatetimePicker v-model="selectedDate"
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
				<div v-if="slots.length === 0 && !loadingSlots">
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
				@save="onSave"
				@close="selectedSlot = undefined" />
		</div>
	</div>
	<AppointmentBookingConfirmation v-else
		@close="bookingConfirmed = false" />
</template>

<script>
import Avatar from '@nextcloud/vue/dist/Components/Avatar'
import DatetimePicker from '@nextcloud/vue/dist/Components/DatetimePicker'
import jstz from 'jstz'
import TimezonePicker from '@nextcloud/vue/dist/Components/TimezonePicker'

import AppointmentSlot from '../../components/Appointments/AppointmentSlot'
import { bookSlot, findSlots } from '../../services/appointmentService'
import AppointmentDetails from '../../components/Appointments/AppointmentDetails'
import AppointmentBookingConfirmation from '../../components/Appointments/AppointmentBookingConfirmation'

export default {
	name: 'Booking',
	components: {
		AppointmentSlot,
		Avatar,
		DatetimePicker,
		TimezonePicker,
		AppointmentDetails,
		AppointmentBookingConfirmation,
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
			now
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
		 * Whether or not the date is acceptable
		 *
		 * @param {Date} date The date to compare to
		 * @return {boolean}
		 */
		disabledDate(date) {
			if (date <= this.minimumDate) {
				return true
			}
			if (this.endDate && this.endDate < date) {
				return true
			}

			return false
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
				// TODO error toast
				console.error('Could not fetch slots', e)
			} finally {
				this.loadingSlots = false
			}
		},
		async onSave({ slot, displayName, email, description, timeZone }) {
			console.info('slot will be booked', {
				slot,
				description,
				email,
				displayName,
				timeZone,
			})

			this.bookingError = false
			try {
				await bookSlot(this.config, slot, displayName, email, description, timeZone)

				console.info('appointment booked')

				this.selectedSlot = undefined
				this.bookingConfirmed = true
			} catch (e) {
				console.error('could not book appointment', e)
				this.bookingError = true
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
	margin: 0 auto;
	padding-top: 50px;
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

	&__slots {
		display: flex;
		flex-direction: column;
	}
}

</style>
