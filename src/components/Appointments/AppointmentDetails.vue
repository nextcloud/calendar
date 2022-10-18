<template>
	<Modal size="large"
		@close="$emit('close')">
		<div class="booking-appointment-details">
			<div class="booking-details">
				<Avatar :user="userInfo.uid"
					:display-name="userInfo.displayName"
					:disable-tooltip="true"
					:disable-menu="true"
					:size="128" />
				<div class="booking__display-name">
					<strong>{{ userInfo.displayName }}</strong>
				</div>
				<h2 class="booking__name">
					{{ config.name }}
				</h2>
				<div class="booking__time">
					{{ startTime }} - {{ endTime }}
				</div>
				<!-- Description needs to stay inline due to its whitespace -->
				<span class="booking__description">{{ config.description }}</span>
			</div>
			<div class="appointment-details">
				<div>
					{{ $t('calendar', 'Your name') }}
				</div>
				<input id="displayName"
					v-model="displayName"
					type="text"
					class="no-close"
					required>
				<div>
					{{ $t('calendar', 'Your email address') }}
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
						<textarea id="biography"
							v-model="description"
							v-autosize="true"
							rows="8"
							autocapitalize="none"
							autocomplete="off" />
					</div>
				</div>
				<div v-if="showError"
					class="booking-error">
					{{ $t('calendar', 'Could not book the appointment. Please try again later or contact the organizer.') }}
				</div>
				<div class="buttons">
					<button class="button primary"
						@click="save">
						{{ $t('calendar', 'Book the appointment') }}
					</button>
				</div>
			</div>
		</div>
	</Modal>
</template>
<script>
import Avatar from '@nextcloud/vue/dist/Components/Avatar'
import Modal from '@nextcloud/vue/dist/Components/Modal'
import autosize from '../../directives/autosize'

import { timeStampToLocaleTime } from '../../utils/localeTime'

export default {
	name: 'AppointmentDetails',
	components: {
		Avatar,
		Modal,
	},
	directives: {
		autosize,
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
		timeZoneId: {
			required: true,
			type: String,
		},
		showError: {
			required: true,
			type: Boolean,
		},
	},
	data() {
		return {
			description: '',
			email: this.visitorInfo.email,
			displayName: this.visitorInfo.displayName,
			timeZone: this.timeZoneId,
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
				displayName: this.displayName,
				timeZone: this.timeZone,
			})
		},
	},
}
</script>

<style lang="scss" scoped>
::v-deep .modal-container {
	width: calc(100vw - 120px) !important;
	max-width: 720px !important;
	max-height: 500px !important;
	overflow: auto !important;
}

.booking-appointment-details {
	display: flex;
	flex-direction: row;
	padding: 30px;
	flex-wrap: wrap;
}

.booking-details {
	flex: 1 220px;
}

.booking__time {
	margin-bottom: 12px;
}

.appointment-details {
	max-width: 360px;
	flex: 1 auto;
	padding-left: 30px;

	input {
		width: 100%;
	}
}

.booking-error {
	color: var(--color-error);
}

.booking__description {
	white-space: break-spaces;
}

.buttons {
	display: flex;
	justify-content: end;
	margin-top: 10px;

	.button {
		margin: 0;
	}
}

.add-guest {
	display: block;
	color: var(--color-primary);
	background-color: transparent;
}

.meeting-text {
	display: grid;
	align-items: center;

	textarea {
		display: block;
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
