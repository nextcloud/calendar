<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcModal
		size="large"
		:name="formTitle"
		@close="$emit('close')">
		<!-- Wait for the config to become available before rendering the form. -->
		<div v-if="editing" class="appointment-config-modal">
			<Confirmation
				v-if="showConfirmation"
				:isNew="isNew"
				:config="editing"
				@close="$emit('close')" />
			<template v-else>
				<div class="appointment-config-modal__form">
					<fieldset>
						<TextInput
							v-model="editing.name"
							class="appointment-config-modal__form__row"
							:label="t('calendar', 'Appointment name')" />
						<TextInput
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
						<TextArea
							v-model="editing.description"
							class="appointment-config-modal__form__row"
							:label="t('calendar', 'Description')" />

						<div class="appointment-config-modal__form__row appointment-config-modal__form__row--wrapped">
							<div class="calendar-select">
								<label>{{ t('calendar', 'Calendar') }}</label>
								<CalendarPicker
									v-if="calendar !== undefined"
									:value="calendar"
									:calendars="availableCalendars"
									:showCalendarOnSelect="false"
									@selectCalendar="changeCalendar" />
							</div>
							<VisibilitySelect
								v-model="editing.visibility"
								:label="t('calendar', 'Visibility')" />
						</div>

						<div class="appointment-config-modal__form__row appointment-config-modal__form__row--wrapped">
							<DurationInput
								v-model="editing.length"
								:label="t('calendar', 'Duration')" />
							<DurationSelect
								v-model="editing.increment"
								:label="t('calendar', 'Increments')" />
						</div>

						<div class="appointment-config-modal__form__row appointment-config-modal__form__row--local">
							<label>{{ t('calendar', 'Additional calendars to check for conflicts') }}</label>
							<CalendarPicker
								:value="selectedConflictCalendars"
								:calendars="selectableConflictCalendars"
								:multiple="true"
								:showCalendarOnSelect="false"
								@selectCalendar="addConflictCalender"
								@removeCalendar="removeConflictCalendar" />
						</div>
					</fieldset>

					<fieldset>
						<header>{{ t('calendar', 'Pick time ranges where appointments are allowed') }}</header>
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
						<header>{{ t('calendar', 'Add time before and after the event') }}</header>

						<div class="appointment-config-modal__form__row appointment-config-modal__form__row--wrapped">
							<CheckedDurationSelect
								v-model="editing.preparationDuration"
								:enabled="enablePreparationDuration"
								:label="t('calendar', 'Before the event')"
								@update:enabled="setEnablePreparationDuration" />
							<CheckedDurationSelect
								v-model="editing.followupDuration"
								:enabled="enableFollowupDuration"
								:label="t('calendar', 'After the event')"
								@update:enabled="setEnableFollowupDuration" />
						</div>
					</fieldset>

					<fieldset>
						<header>{{ t('calendar', 'Planning restrictions') }}</header>

						<div class="appointment-config-modal__form__row appointment-config-modal__form__row--wrapped">
							<DurationSelect
								v-model="editing.timeBeforeNextSlot"
								:label="t('calendar', 'Minimum time before next available slot')"
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
								@update:enabled="setEnableFutureLimit" />
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
					{{ saveButtonText }}
				</NcButton>
			</template>
		</div>
	</NcModal>
</template>

<script>
import { CalendarAvailability } from '@nextcloud/calendar-availability-vue'
import { NcButton, NcCheckboxRadioSwitch, NcModal, NcNoteCard } from '@nextcloud/vue'
import { mapState, mapStores } from 'pinia'
import CheckedDurationSelect from './AppointmentConfigModal/CheckedDurationSelect.vue'
import Confirmation from './AppointmentConfigModal/Confirmation.vue'
import DurationInput from './AppointmentConfigModal/DurationInput.vue'
import DurationSelect from './AppointmentConfigModal/DurationSelect.vue'
import NumberInput from './AppointmentConfigModal/NumberInput.vue'
import TextArea from './AppointmentConfigModal/TextArea.vue'
import TextInput from './AppointmentConfigModal/TextInput.vue'
import VisibilitySelect from './AppointmentConfigModal/VisibilitySelect.vue'
import CalendarPicker from './Shared/CalendarPicker.vue'
import AppointmentConfig from '../models/appointmentConfig.js'
import useAppointmentConfigsStore from '../store/appointmentConfigs.js'
import useCalendarsStore from '../store/calendars.js'
import useSettingsStore from '../store/settings.js'
import logger from '../utils/logger.js'

export default {
	name: 'AppointmentConfigModal',
	components: {
		CalendarAvailability,
		CheckedDurationSelect,
		CalendarPicker,
		DurationInput,
		NcModal,
		NumberInput,
		TextInput,
		TextArea,
		DurationSelect,
		VisibilitySelect,
		Confirmation,
		NcButton,
		NcCheckboxRadioSwitch,
		NcNoteCard,
	},

	props: {
		config: {
			type: AppointmentConfig,
			required: true,
		},

		isNew: {
			type: Boolean,
			required: true,
		},

		isDuplicate: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			isLoading: false,
			editing: undefined,
			enablePreparationDuration: false,
			enableFollowupDuration: false,
			enableFutureLimit: false,
			rateLimitingReached: false,
			showConfirmation: false,
		}
	},

	computed: {
		...mapState(useSettingsStore, {
			isTalkEnabled: 'talkEnabled',
		}),

		...mapState(useCalendarsStore, ['ownSortedCalendars', 'sortedCalendars', 'sortedCalendarsAll']),
		...mapStores(useAppointmentConfigsStore, useCalendarsStore, useSettingsStore),
		formTitle() {
			if (this.showConfirmation) {
				return this.$t('calendar', 'Appointment schedule saved')
			}
			if (this.isNew) {
				return this.$t('calendar', 'Create appointment schedule')
			}

			return this.$t('calendar', 'Edit appointment schedule')
		},

		saveButtonText() {
			if (this.isNew) {
				return this.$t('calendar', 'Save')
			}

			return this.$t('calendar', 'Update')
		},

		calendar() {
			if (!this.editing.targetCalendarUri) {
				return this.availableCalendars[0]
			}

			const uri = this.editing.targetCalendarUri
			const calendar = this.availableCalendars.find((cal) => this.calendarUrlToUri(cal.url) === uri)
			return calendar || this.availableCalendars[0]
		},

		// TODO: Can be removed after NC version 30 support is dropped
		availableCalendars() {
			const nextcloudMajorVersion = parseInt(window.OC.config.version.split('.')[0])
			if (nextcloudMajorVersion >= 31) {
				return this.sortedCalendars
			}
			return this.ownSortedCalendars
		},

		selectableConflictCalendars() {
			// The target calendar is always a conflict calendar, remove it from additional conflict calendars
			return this.sortedCalendarsAll.filter((calendar) => calendar.url !== this.calendar.url)
		},

		selectedConflictCalendars() {
			const freebusyUris = this.editing.calendarFreeBusyUris ?? []
			return freebusyUris.map((uri) => {
				return this.sortedCalendarsAll.find((cal) => this.calendarUrlToUri(cal.url) === uri)
			}).filter((calendar) => calendar !== undefined)
		},

		defaultConfig() {
			return AppointmentConfig.createDefault(
				this.calendarUrlToUri(this.availableCalendars[0].url),
				this.calendarsStore.scheduleInbox,
				this.settingsStore.getResolvedTimezone,
			)
		},
	},

	watch: {
		config() {
			this.reset()
		},
	},

	created() {
		this.reset()
	},

	methods: {
		setEnablePreparationDuration(value) {
			this.enablePreparationDuration = value
		},

		setEnableFollowupDuration(value) {
			this.enableFollowupDuration = value
		},

		setEnableFutureLimit(value) {
			this.enableFutureLimit = value
		},

		reset() {
			this.editing = this.config.clone()

			if (this.isDuplicate) {
				this.editing.name = `${this.editing.name} ${this.t('calendar', '(copy)')}`
			}

			this.enablePreparationDuration = !!this.editing.preparationDuration
			this.enableFollowupDuration = !!this.editing.followupDuration
			this.enableFutureLimit = !!this.editing.futureLimit

			this.showConfirmation = false
			// Disable Talk integration if Talk is no longer available
			if (!this.isTalkEnabled) {
				this.editing.createTalkRoom = false
			}
		},

		calendarUrlToUri(url) {
			// Trim trailing slash and split into URL parts
			const parts = url.replace(/\/$/, '').split('/')
			// The last one is the URI
			return parts[parts.length - 1]
		},

		changeCalendar(calendar) {
			this.editing.targetCalendarUri = this.calendarUrlToUri(calendar.url)
			this.editing.calendarFreeBusyUris = this.editing.calendarFreeBusyUris.filter((uri) => uri !== this.calendarUrlToUri(calendar.url))
		},

		addConflictCalender(calendar) {
			this.editing.calendarFreeBusyUris.push(this.calendarUrlToUri(calendar.url))
		},

		removeConflictCalendar(calendar) {
			this.editing.calendarFreeBusyUris = this.editing.calendarFreeBusyUris.filter((uri) => uri !== this.calendarUrlToUri(calendar.url))
		},

		async save() {
			this.isLoading = true
			this.rateLimitingReached = false

			if (!this.enablePreparationDuration) {
				this.editing.preparationDuration = this.defaultConfig.preparationDuration
			}

			if (!this.enableFollowupDuration) {
				this.editing.followupDuration = this.defaultConfig.followupDuration
			}

			if (!this.enableFutureLimit) {
				this.editing.futureLimit = null
			}

			this.editing.targetCalendarUri ??= this.defaultConfig.targetCalendarUri

			const config = this.editing
			try {
				if (this.isNew) {
					logger.info('Creating new config', { config })
					this.editing = await this.appointmentConfigsStore.createConfig({ config })
				} else {
					logger.info('Saving config', { config })
					this.editing = await this.appointmentConfigsStore.updateConfig({ config })
				}
				this.showConfirmation = true
			} catch (error) {
				if (error?.response?.status === 429) {
					this.rateLimitingReached = true
				}
				logger.error('Failed to save config', { error, config, isNew: this.isNew })
			} finally {
				this.isLoading = false
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.appointment-config-modal {
		&__talk-room-description {
			color: var(--color-text-maxcontrast);
		}
}
</style>
