<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script setup lang="ts">
import type {
	AppointmentSavePayload,
	AppointmentSlot,
	AppointmentUserInfo,
	AppointmentVisitorInfo,
	PublicAppointmentConfig,
} from '@/types/appointments.ts'

import {
	NcAvatar as Avatar,
	NcButton,
	NcLoadingIcon,
	NcNoteCard,
	NcTextArea,
	NcTextField,
} from '@nextcloud/vue'
import { computed, ref } from 'vue'
import IconBack from 'vue-material-design-icons/ArrowLeft.vue'
import IconCalendar from 'vue-material-design-icons/CalendarOutline.vue'
import IconCheck from 'vue-material-design-icons/CheckOutline.vue'
import IconTime from 'vue-material-design-icons/ClockTimeFourOutline.vue'
import IconTimezone from 'vue-material-design-icons/Web.vue'
import autosize from '@/directives/autosize.js'
import { timeStampToLocaleDate, timeStampToLocaleTime } from '@/utils/localeTime.js'

const vAutosize = autosize

const props = defineProps<{
	config: PublicAppointmentConfig
	timeSlot: AppointmentSlot
	userInfo: AppointmentUserInfo
	visitorInfo: AppointmentVisitorInfo
	timeZoneId: string
	showRateLimitingWarning: boolean
	showError: boolean
	isLoading: boolean
}>()

const emit = defineEmits<{
	goBack: []
	save: [payload: AppointmentSavePayload]
}>()

const description = ref('')
const email = ref(props.visitorInfo.email)
const displayName = ref(props.visitorInfo.displayName)
const timeZone = ref(props.timeZoneId)

const startTime = computed<string>(() => timeStampToLocaleTime(props.timeSlot.start, props.timeZoneId))
const endTime = computed<string>(() => timeStampToLocaleTime(props.timeSlot.end, props.timeZoneId))
const date = computed<string>(() => timeStampToLocaleDate(props.timeSlot.start, props.timeZoneId))

function save(): void {
	emit('save', {
		slot: props.timeSlot,
		description: description.value,
		email: email.value,
		displayName: displayName.value,
		timeZone: timeZone.value,
	})
}
</script>

<template>
	<div class="booking-appointment-details">
		<div class="booking-appointment-wrapper">
			<div class="booking-details">
				<Avatar
					:user="userInfo.uid"
					:displayName="userInfo.displayName"
					:disableTooltip="true"
					:disableMenu="true"
					:size="44" />
				<div class="booking__display-name">
					<strong>{{ userInfo.displayName }}</strong>
				</div>
				<h3 class="booking__name">
					{{ config.name }}
				</h3>
				<!-- Description needs to stay inline due to its whitespace -->
				<div class="booking__description">
					{{ config.description }}
				</div>
				<div class="booking__date">
					<IconCalendar :size="16" />
					{{ date }}
				</div>
				<div class="booking__time">
					<IconTime :size="16" />
					{{ startTime }} - {{ endTime }}
				</div>
				<div class="booking__time">
					<IconTimezone :size="16" />
					{{ timeZone }}
				</div>
			</div>
			<div class="appointment-details">
				<div class="name-details">
					<NcTextField
						v-model="displayName"
						:label="$t('calendar', 'Your name')"
						required
						:disabled="isLoading" />
				</div>
				<div class="email-details">
					<NcTextField
						v-model="email"
						type="email"
						:label="$t('calendar', 'Your email address')"
						autocapitalize="none"
						autocomplete="on"
						:disabled="isLoading"
						required />
				</div>
				<div class="meeting-info">
					<NcTextArea
						v-model="description"
						:label="$t('calendar', 'Please share anything that will help prepare for our meeting')"
						:rows="8"
						autocapitalize="none"
						autocomplete="off"
						:disabled="isLoading"
						resize="vertical" />
				</div>
				<NcNoteCard
					v-if="showRateLimitingWarning"
					type="warning">
					{{ $t('calendar', 'It seems a rate limit has been reached. Please try again later.') }}
				</NcNoteCard>
				<NcNoteCard
					v-if="showError"
					type="error">
					{{ $t('calendar', 'Could not book the appointment. Please try again later or contact the organizer.') }}
				</NcNoteCard>
			</div>
		</div>
		<div class="buttons">
			<NcButton variant="tertiary" @click="$emit('goBack')">
				<template #icon>
					<IconBack :size="16" />
				</template>
				{{ $t('calendar', 'Back') }}
			</NcButton>
			<NcLoadingIcon v-if="isLoading" :size="32" class="loading-icon" />
			<NcButton variant="primary" :disabled="isLoading" @click="save">
				<template #icon>
					<IconCheck :size="16" />
				</template>
				{{ $t('calendar', 'Book appointment') }}
			</NcButton>
		</div>
	</div>
</template>

<style lang="scss" scoped>
h3 {
	margin-top: 0;
}

.booking__date, .booking__time {
	display: flex;
	align-items: center;
	gap: 4px;
	padding-top: 10px
}

.booking-appointment-details {
	display: flex;
	flex-direction: column;
	padding: calc(var(--default-grid-baseline) * 2);
	flex-wrap: wrap;
	width: calc(100vw - 120px);
	max-width: 720px;
	max-height: 500px;
	overflow: auto;
}

.booking-appointment-wrapper {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: calc(var(--default-grid-baseline) * 6);
	width: 100%;
}

.booking-details {
	flex: 1 220px;
}

.appointment-details {
	max-width: 360px;
	flex: 1 auto;
	padding-inline-start: 30px;

	input {
		width: 100%;
	}
}

.buttons .loading-icon {
	margin-inline-end:5px
}

.booking-error {
	color: var(--color-error);
}

.booking__description,
.name-details,
.email-details {
	padding-bottom: 10px
}

.buttons {
	display: flex;
	justify-content: space-between;
	margin-top: auto;
	width: 100%;
	padding-top: 15px;

	.button {
		margin: 0;
	}
}

.add-guest {
	display: block;
	color: var(--color-primary-element);
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
	}
}
</style>
