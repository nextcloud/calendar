<template>
	<Modal
		size="large"
		@close="$emit('close')">
		<div class="booking-appointment-details">
			<div class="booking-details">
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
				<span class="booking__time">{{ startTime }} - {{ endTime }}</span>
			</div>
			<div class="appointment-details">
				<h2>{{ $t('calendar', 'Enter details') }}</h2>
				<div>
					{{ $t('calendar', 'Name') }}
				</div>
				<input id="name"
					v-model="name"
					type="text"
					class="no-close"
					required>
				<div>
					{{ $t('calendar', 'Email') }}
				</div>
				<input ref="email"
					v-model="email"
					type="email"
					autocapitalize="none"
					autocomplete="on"
					autocorrect="off"
					required>
				<div class="meeting-info">
					{{ $t('calendar', 'Please share anything that will help prepare for our meeting') }}
					<div class="meeting-text">
						<textarea
							id="biography"
							v-model="description"
							rows="8"
							autocapitalize="none"
							autocomplete="off" />
					</div>
				</div>
				<button class="button primary"
					@click="save">
					{{ $t('calendar', 'Book the appointment') }}
				</button>
			</div>
		</div>
	</Modal>
</template>
<script>
import Avatar from '@nextcloud/vue/dist/Components/Avatar'
import Modal from '@nextcloud/vue/dist/Components/Modal'

import { timeStampToLocaleTime } from '../../utils/localeTime'

export default {
	name: 'AppointmentDetails',
	components: {
		Avatar,
		Modal,
	},
	props: {
		config: {
			required: true,
			type: Object,
		},
		timeSlot: {
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
		return {
			description: '',
			email: this.visitorInfo.email,
			name: this.visitorInfo.displayName,
		}
	},
	computed: {
		startTime() {
			return timeStampToLocaleTime(this.timeSlot.start, this.timeZoneId)
		},
		endTime() {
			return timeStampToLocaleTime(this.timeSlot.end, this.timeZoneId)
		},
	},
	methods: {
		save() {
			this.$emit('save', {
				slot: this.timeSlot,
				description: this.description,
				email: this.email,
				name: this.name,
			})
		},
	},
}
</script>

<style lang="scss" scoped>
::v-deep .modal-container {
	width: calc(100vw - 120px) !important;
	height: calc(100vh - 120px) !important;
	max-width: 600px !important;
	max-height: 500px !important;
}

.booking-appointment-details {
	display: flex;
	flex-direction: row;
}

.booking-details {
	padding-left: 30px;
	padding-top: 80px;
	white-space: nowrap;
}

.appointment-details {
	padding-left: 120px;
	padding-top: 40px;
}

.add-guest {
	display: block;
	color: var(--color-primary);
	background-color: transparent;
}

.meeting-info {
	padding-right: 10px;
}

.meeting-text {
	display: grid;
	align-items: center;

	textarea {
		resize: vertical;
		grid-area: 1 / 1;
		width: 100%;
		margin: 3px 3px 3px 0;
		padding: 7px 6px;
		color: var(--color-main-text);
		border: 1px solid var(--color-border-dark);
		border-radius: var(--border-radius);
		background-color: var(--color-main-background);
		cursor: text;

		&:hover {
			border-color: var(--color-primary-element) !important;
			outline: none !important;
		}
	}
}
</style>
