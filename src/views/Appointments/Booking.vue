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
	<div class="booking">
		<div class="booking__config-user-info">
			<Avatar
				:user="userInfo.uid"
				:display-name="userInfo.displayName"
				:disable-tooltip="true"
				:disable-menu="true"
				:size="64" />
			<div class="booking__display-name">
				<strong>{{ userInfo.displayName }}</strong>
			</div>
			<h2 class="booking__name">
				{{ config.name }}
			</h2>
			<span class="booking__description">{{ config.description }}</span>
		</div>
		<div class="booking__date-selection">
			<h3>{{ $t('calendar', 'Select date') }}</h3>
			<div class="booking__date">
				<DatetimePicker v-model="selectedDate"
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
				<AppointmentSlot v-for="slot in slots"
					:key="slot.start"
					:start="slot.start"
					:end="slot.end"
					:time-zone-id="timeZone"
					@click="onSlotClicked(slot)" />
			</div>
			<AppointmentDetails v-if="selectedSlot"
				:key="selectedSlot.start"
				:user-info="userInfo"
				:config="config"
				:time-slot="selectedSlot"
				@save="onSave"
				@close="selectedSlot = undefined" />
		</div>
	</div>
</template>

<script>
import Avatar from '@nextcloud/vue/dist/Components/Avatar'
import DatetimePicker from '@nextcloud/vue/dist/Components/DatetimePicker'
import jstz from 'jstz'
import TimezonePicker from '@nextcloud/vue/dist/Components/TimezonePicker'

import AppointmentSlot from '../../components/Appointments/AppointmentSlot'
import { bookSlot, findSlots } from '../../services/appointmentService'
import AppointmentDetails from '../../components/Appointments/AppointmentDetails'

export default {
	name: 'Booking',
	components: {
		AppointmentSlot,
		Avatar,
		DatetimePicker,
		TimezonePicker,
	  AppointmentDetails,
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
	},
	data() {
		// Try to determine the current timezone, and fall back to UTC otherwise
		const defaultTimezone = jstz.determine()
		const defaultTimeZoneId = defaultTimezone ? defaultTimezone.name() : 'UTC'

		return {
			loadingSlots: false,
			selectedDate: new Date(),
			timeZone: defaultTimeZoneId,
			slots: [],
			selectedSlot: undefined,
		}
	},
	watch: {
		timeZone() {
			// TODO: fix the @nextcloud/vue component to emit @change
			this.fetchSlots()
		},
	},
	async mounted() {
		await this.fetchSlots()
	},
	methods: {
		async fetchSlots() {
			this.slots = []
			this.loadingSlots = true

			const startOfDay = new Date(this.selectedDate.getTime())
			startOfDay.setUTCHours(0, 0, 0, 0)
			const endOfDay = new Date(this.selectedDate.getTime())
			endOfDay.setUTCHours(23, 59, 59, 999)

			try {
				this.slots = await findSlots(
					this.config,
					Math.round(startOfDay.getTime() / 1000),
					Math.round(endOfDay.getTime() / 1000),
					this.timeZone,
				)
			} catch (e) {
				// TODO error toast
				console.error('Could not fetch slots', e)
			} finally {
				this.loadingSlots = false
			}
		},
		async onSave({ slot, name, email, description }) {
			console.info('slot will be booked', {
				slot,
				description,
				email,
				name,
			})

			try {
				await bookSlot(this.config, slot, name, email, description)

				console.info('appointment booked')

				this.selectedSlot = undefined
			} catch (e) {
				console.error('could not book appointment', e)
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
	margin: auto;
	padding-top: 80px;
	display: flex;
	flex-direction: row;
	max-width: 800px;

	&__date-selection {
		display: flex;
		flex-direction: column;
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

	&__slots {
		display: flex;
		flex-direction: column;
	}
}

</style>
