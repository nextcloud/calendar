<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
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

<script>
import axios from '@nextcloud/axios'
import { generateUrl } from '@nextcloud/router'
import { NcButton, NcLoadingIcon, NcNoteCard } from '@nextcloud/vue'
import IconAccount from 'vue-material-design-icons/AccountOutline.vue'
import IconCalendar from 'vue-material-design-icons/CalendarOutline.vue'
import IconCheck from 'vue-material-design-icons/CheckOutline.vue'
import IconTime from 'vue-material-design-icons/ClockTimeFourOutline.vue'
import IconTimezone from 'vue-material-design-icons/Web.vue'
import BookingResult from './BookingResult.vue'
import { timeStampToLocaleDate, timeStampToLocaleTime } from '../../utils/localeTime.js'

export default {
	name: 'Confirmation',

	components: {
		BookingResult,
		NcButton,
		NcLoadingIcon,
		NcNoteCard,
		IconAccount,
		IconCheck,
		IconCalendar,
		IconTime,
		IconTimezone,
	},

	props: {
		booking: {
			required: true,
			type: Object,
		},

		link: {
			required: true,
			type: String,
		},

		token: {
			required: true,
			type: String,
		},
	},

	data() {
		return {
			status: this.booking.confirmed ? 'confirmed' : 'pending',
			loading: false,
			error: false,
		}
	},

	computed: {
		date() {
			return timeStampToLocaleDate(this.booking.start, this.booking.timezone)
		},

		startTime() {
			return timeStampToLocaleTime(this.booking.start, this.booking.timezone)
		},

		endTime() {
			return timeStampToLocaleTime(this.booking.end, this.booking.timezone)
		},
	},

	methods: {
		async confirm() {
			this.loading = true
			this.error = false
			try {
				const url = generateUrl('/apps/calendar/appointment/confirm/{token}', { token: this.token })
				await axios.post(url)
				this.status = 'confirmed'
			} catch (e) {
				if (e.response?.status === 409) {
					this.status = 'conflict'
				} else if (e.response?.status === 404) {
					this.status = 'expired'
				} else {
					this.error = true
				}
			} finally {
				this.loading = false
			}
		},
	},
}
</script>

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
