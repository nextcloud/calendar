<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { CalendarInterface } from '@/types/calendar.ts'

import { CalendarAvailability } from '@nextcloud/calendar-availability-vue'
import { t } from '@nextcloud/l10n'
import {
	NcButton,
	NcCheckboxRadioSwitch,
	NcModal,
	NcNoteCard,
	NcTextArea,
	NcTextField,
} from '@nextcloud/vue'
import { computed, ref, watch } from 'vue'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import CheckedDurationSelect from './AppointmentConfigModal/CheckedDurationSelect.vue'
import Confirmation from './AppointmentConfigModal/Confirmation.vue'
import DurationInput from './AppointmentConfigModal/DurationInput.vue'
import DurationSelect from './AppointmentConfigModal/DurationSelect.vue'
import NumberInput from './AppointmentConfigModal/NumberInput.vue'
import VisibilitySelect from './AppointmentConfigModal/VisibilitySelect.vue'
import CalendarPicker from './Shared/CalendarPicker.vue'
import AppointmentConfig from '@/models/appointmentConfig.js'
import useAppointmentConfigsStore from '@/store/appointmentConfigs.js'
import useCalendarsStore from '@/store/calendars.js'
import useSettingsStore from '@/store/settings.js'
import logger from '@/utils/logger.js'
import { isAfterVersion } from '@/utils/nextcloudVersion'

const props = withDefaults(defineProps<{
	config: AppointmentConfig
	isNew: boolean
	isDuplicate?: boolean
}>(), {
	isDuplicate: false,
})

defineEmits<{
	close: []
}>()

const appointmentConfigsStore = useAppointmentConfigsStore()
const calendarsStore = useCalendarsStore()
const settingsStore = useSettingsStore()

const isLoading = ref(false)
const editing = ref<AppointmentConfig>(props.config.clone())
const enablePreparationDuration = ref(false)
const enableFollowupDuration = ref(false)
const enableFutureLimit = ref(false)
const rateLimitingReached = ref(false)
const showConfirmation = ref(false)

const isTalkEnabled = computed<boolean>(() => settingsStore.talkEnabled)

const formTitle = computed<string>(() => {
	if (showConfirmation.value) {
		return t('calendar', 'Appointment schedule saved')
	}
	if (props.isNew) {
		return t('calendar', 'Create appointment schedule')
	}

	return t('calendar', 'Edit appointment schedule')
})

const saveButtonText = computed<string>(() => {
	if (props.isNew) {
		return t('calendar', 'Save')
	}

	return t('calendar', 'Update')
})

// TODO: Can be removed after NC version 30 support is dropped
const availableCalendars = computed<CalendarInterface[]>(() => {
	if (isAfterVersion(31)) {
		return calendarsStore.sortedCalendars
	}
	return calendarsStore.ownSortedCalendars
})

const calendar = computed<CalendarInterface | undefined>(() => {
	if (!editing.value.targetCalendarUri) {
		return availableCalendars.value[0]
	}

	const uri = editing.value.targetCalendarUri
	const calendar = availableCalendars.value.find((cal) => calendarUrlToUri(cal.url) === uri)
	return calendar || availableCalendars.value[0]
})

const selectableConflictCalendars = computed<CalendarInterface[]>(() => {
	// The target calendar is always a conflict calendar, remove it from additional conflict calendars
	return calendarsStore.sortedCalendarsAll.filter((cal: CalendarInterface) => cal.url !== calendar.value?.url)
})

const selectedConflictCalendars = computed<CalendarInterface[]>(() => {
	const freebusyUris: string[] = editing.value.calendarFreeBusyUris ?? []
	return freebusyUris.map((uri) => {
		return calendarsStore.sortedCalendarsAll.find((cal: CalendarInterface) => calendarUrlToUri(cal.url) === uri)
	}).filter((cal: CalendarInterface | undefined): cal is CalendarInterface => cal !== undefined)
})

const defaultConfig = computed<AppointmentConfig>(() => {
	return AppointmentConfig.createDefault(
		calendarUrlToUri(availableCalendars.value[0].url),
		calendarsStore.scheduleInbox,
		settingsStore.getResolvedTimezone,
	)
})

watch(() => props.config, () => {
	reset()
})

function reset(): void {
	editing.value = props.config.clone()

	if (props.isDuplicate) {
		editing.value.name = `${editing.value.name} ${t('calendar', '(copy)')}`
	}

	enablePreparationDuration.value = !!editing.value.preparationDuration
	enableFollowupDuration.value = !!editing.value.followupDuration
	enableFutureLimit.value = !!editing.value.futureLimit

	showConfirmation.value = false
	// Disable Talk integration if Talk is no longer available
	if (!isTalkEnabled.value) {
		editing.value.createTalkRoom = false
	}
}

function calendarUrlToUri(url: string): string {
	// Trim trailing slash and split into URL parts
	const parts = url.replace(/\/$/, '').split('/')
	// The last one is the URI
	return parts[parts.length - 1]
}

function changeCalendar(calendar: CalendarInterface): void {
	editing.value.targetCalendarUri = calendarUrlToUri(calendar.url)
	editing.value.calendarFreeBusyUris = editing.value.calendarFreeBusyUris.filter((uri: string) => uri !== calendarUrlToUri(calendar.url))
}

function addConflictCalender(calendar: CalendarInterface): void {
	editing.value.calendarFreeBusyUris.push(calendarUrlToUri(calendar.url))
}

function removeConflictCalendar(calendar: CalendarInterface): void {
	editing.value.calendarFreeBusyUris = editing.value.calendarFreeBusyUris.filter((uri: string) => uri !== calendarUrlToUri(calendar.url))
}

async function save(): Promise<void> {
	isLoading.value = true
	rateLimitingReached.value = false

	if (!enablePreparationDuration.value) {
		editing.value.preparationDuration = defaultConfig.value.preparationDuration
	}

	if (!enableFollowupDuration.value) {
		editing.value.followupDuration = defaultConfig.value.followupDuration
	}

	if (!enableFutureLimit.value) {
		editing.value.futureLimit = null
	}

	editing.value.targetCalendarUri ??= defaultConfig.value.targetCalendarUri

	const config = editing.value
	try {
		if (props.isNew) {
			logger.info('Creating new config', { config })
			editing.value = await appointmentConfigsStore.createConfig({ config })
		} else {
			logger.info('Saving config', { config })
			editing.value = await appointmentConfigsStore.updateConfig({ config })
		}
		showConfirmation.value = true
	} catch (error) {
		if (error?.response?.status === 429) {
			rateLimitingReached.value = true
		}
		logger.error('Failed to save config', { error, config, isNew: props.isNew })
	} finally {
		isLoading.value = false
	}
}

reset()
</script>

<template>
	<NcModal
		size="normal"
		:name="formTitle"
		@close="$emit('close')">
		<div class="appointment-config-modal">
			<Confirmation
				v-if="showConfirmation"
				:isNew="isNew"
				:config="editing"
				@close="$emit('close')" />
			<template v-else>
				<div class="appointment-config-modal__form">
					<div class="appointment-config-modal__form__title">
						<h2>{{ formTitle }}</h2>
					</div>
					<fieldset>
						<NcTextField
							v-model="editing.name"
							class="appointment-config-modal__form__row"
							:label="t('calendar', 'Appointment name')" />
						<NcTextField
							v-model="editing.location"
							class="appointment-config-modal__form__row"
							:label="t('calendar', 'Location')"
							:disabled="isTalkEnabled && editing.createTalkRoom" />
						<div v-if="isTalkEnabled" class="appointment-config-modal__form__row">
							<NcCheckboxRadioSwitch v-model="editing.createTalkRoom">
								{{ t('calendar', 'Create a Talk room') }}
							</NcCheckboxRadioSwitch>
							<span class="appointment-config-modal__talk-room-description">{{ t('calendar', 'A unique link will be generated for every booked appointment and sent via the confirmation email') }}</span>
						</div>
						<div class="appointment-config-modal__form__row">
							<label>{{ t('calendar', 'Description') }}</label>
							<NcTextArea
								v-model="editing.description"
								class="appointment-config-modal__form__row"
								:labelOutside="true"
								resize="vertical" />
						</div>

						<div class="appointment-config-modal__form__row appointment-config-modal__form__row--wrapped">
							<DurationInput
								v-model="editing.length"
								:label="t('calendar', 'Duration (minutes)')" />
							<DurationSelect
								v-model="editing.increment"
								:label="t('calendar', 'Increments')" />
						</div>

						<div class="appointment-config-modal__form__row appointment-config-modal__form__row--wrapped">
							<div class="calendar-select">
								<label>{{ t('calendar', 'Booking calendar') }}</label>
								<CalendarPicker
									v-if="calendar !== undefined"
									:value="calendar"
									:calendars="availableCalendars"
									:showCalendarOnSelect="false"
									@selectCalendar="changeCalendar" />
							</div>
							<div class="calendar-select">
								<label>{{ t('calendar', 'Calendars to check for conflicts') }}</label>
								<CalendarPicker
									:value="selectedConflictCalendars"
									:calendars="selectableConflictCalendars"
									:multiple="true"
									:showCalendarOnSelect="false"
									@selectCalendar="addConflictCalender"
									@removeCalendar="removeConflictCalendar" />
							</div>
						</div>
						<div class="appointment-config-modal__form__row appointment-config-modal__form__row--local">
							<VisibilitySelect
								v-model="editing.visibility"
								:label="t('calendar', 'Visibility')" />
						</div>
					</fieldset>

					<fieldset>
						<header><h3>{{ t('calendar', 'Booking availability') }}</h3></header>
						<div class="appointment-config-modal__form__row appointment-config-modal__form__row--wrapped">
							<CalendarAvailability
								v-model:slots="editing.availability.slots"
								:l10nTo="t('calendar', 'to')"
								:l10nDeleteSlot="t('calendar', 'Delete slot')"
								:l10nEmptyDay="t('calendar', 'No times set')"
								:l10nAddSlot="t('calendar', 'Add')"
								:l10nMonday="t('calendar', 'Monday')"
								:l10nTuesday="t('calendar', 'Tuesday')"
								:l10nWednesday="t('calendar', 'Wednesday')"
								:l10nThursday="t('calendar', 'Thursday')"
								:l10nFriday="t('calendar', 'Friday')"
								:l10nSaturday="t('calendar', 'Saturday')"
								:l10nSunday="t('calendar', 'Sunday')"
								:l10nWeekDayListLabel="t('calendar', 'Weekdays')" />
						</div>
					</fieldset>

					<fieldset>
						<header><h3>{{ t('calendar', 'Planning restrictions') }}</h3></header>
						<div class="appointment-config-modal__form__row appointment-config-modal__form__row--wrapped">
							<CheckedDurationSelect
								v-model="editing.preparationDuration"
								:enabled="enablePreparationDuration"
								:label="t('calendar', 'Buffer before the event')"
								@update:enabled="enablePreparationDuration = $event" />
							<CheckedDurationSelect
								v-model="editing.followupDuration"
								:enabled="enableFollowupDuration"
								:label="t('calendar', 'Buffer after the event')"
								@update:enabled="enableFollowupDuration = $event" />
						</div>

						<div class="appointment-config-modal__form__row appointment-config-modal__form__row--wrapped">
							<DurationSelect
								v-model="editing.timeBeforeNextSlot"
								:label="t('calendar', 'Minimum time before next slot')"
								:max="7 * 24 * 60 * 60" />
							<NumberInput
								v-model="editing.dailyMax"
								:label="t('calendar', 'Max slots per day')"
								:allowEmpty="true" />
						</div>

						<div class="appointment-config-modal__form__row appointment-config-modal__form__row--wrapped">
							<CheckedDurationSelect
								v-model="editing.futureLimit"
								:enabled="enableFutureLimit"
								:label="t('calendar', 'Limit how far in the future appointments can be booked')"
								:defaultValue="defaultConfig.futureLimit"
								:min="7 * 24 * 60 * 60"
								:max="null"
								@update:enabled="enableFutureLimit = $event" />
						</div>
					</fieldset>
				</div>
				<NcNoteCard
					v-if="rateLimitingReached"
					type="warning">
					{{ t('calendar', 'It seems a rate limit has been reached. Please try again later.') }}
				</NcNoteCard>
				<NcButton
					class="appointment-config-modal__submit-button"
					variant="primary"
					:disabled="!editing.name || editing.length === 0 || isLoading"
					@click="save">
					<template #icon>
						<CheckIcon :size="20" />
					</template>
					{{ saveButtonText }}
				</NcButton>
			</template>
		</div>
	</NcModal>
</template>

<style lang="scss" scoped>
.appointment-config-modal {
		&__talk-room-description {
			color: var(--color-text-maxcontrast);
		}
}
</style>
