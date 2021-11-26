<!--
  - @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @author Richard Steinmetz <richard@steinmetz.cloud>
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
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
  -->

<template>
	<Modal
		size="large"
		@close="$emit('close')">
		<!-- Wait for the config to become available before rendering the form. -->
		<div v-if="editing" class="appointment-config-modal">
			<Confirmation
				v-if="showConfirmation"
				:is-new="isNew"
				:config="editing"
				@close="$emit('close')" />
			<template v-else>
				<h2>{{ formTitle }}</h2>
				<div class="appointment-config-modal__form">
					<fieldset>
						<TextInput
							class="appointment-config-modal__form__row"
							:label="t('calendar', 'Name')"
							:value.sync="editing.name" />
						<TextInput
							class="appointment-config-modal__form__row"
							:label="t('calendar', 'Location')"
							:value.sync="editing.location" />
						<TextArea
							class="appointment-config-modal__form__row"
							:label="t('calendar', 'Description')"
							:value.sync="editing.description" />

						<div class="appointment-config-modal__form__row appointment-config-modal__form__row--wrapped">
							<div class="calendar-select">
								<label>{{ t('calendar', 'Calendar') }}</label>
								<CalendarPicker v-if="calendar !== undefined"
									:calendar="calendar"
									:calendars="sortedCalendars"
									:show-calendar-on-select="false"
									@select-calendar="changeCalendar" />
							</div>
							<VisibilitySelect
								:label="t('calendar', 'Visibility')"
								:value.sync="editing.visibility" />
						</div>

						<div class="appointment-config-modal__form__row appointment-config-modal__form__row--wrapped">
							<DurationInput
								:label="t('calendar', 'Duration')"
								:value.sync="editing.length" />
							<DurationSelect
								:label="t('calendar', 'Increments')"
								:value.sync="editing.increment" />
						</div>
					</fieldset>

					<fieldset>
						<header>{{ t('calendar', 'Pick time ranges where appointments are allowed') }}</header>
						<div class="appointment-config-modal__form__row appointment-config-modal__form__row--wrapped">
							<CalendarAvailability :slots.sync="editing.availability.slots"
								:l10n-to="t('calendar', 'to')"
								:l10n-delete-slot="t('calendar', 'Delete slot')"
								:l10n-empty-day="t('calendar', 'No times set')"
								:l10n-add-slot="t('calendar', 'Add')"
								:l10n-monday="t('calendar', 'Monday')"
								:l10n-tuesday="t('calendar', 'Tuesday')"
								:l10n-wednesday="t('calendar', 'Wednesday')"
								:l10n-thursday="t('calendar', 'Thursday')"
								:l10n-friday="t('calendar', 'Friday')"
								:l10n-saturday="t('calendar', 'Saturday')"
								:l10n-sunday="t('calendar', 'Sunday')" />
						</div>
					</fieldset>

					<fieldset>
						<header>{{ t('calendar', 'Add time before and after the event') }}</header>

						<div class="appointment-config-modal__form__row appointment-config-modal__form__row--wrapped">
							<CheckedDurationSelect
								:label="t('calendar', 'Before the event')"
								:enabled.sync="enablePreparationDuration"
								:value.sync="editing.preparationDuration" />
							<CheckedDurationSelect
								:label="t('calendar', 'After the event')"
								:enabled.sync="enableFollowupDuration"
								:value.sync="editing.followupDuration" />
						</div>
					</fieldset>

					<fieldset>
						<header>{{ t('calendar', 'Planning restrictions') }}</header>

						<div class="appointment-config-modal__form__row appointment-config-modal__form__row--wrapped">
							<DurationSelect
								:label="t('calendar', 'Minimum time before next available slot')"
								:value.sync="editing.timeBeforeNextSlot"
								:max="7*24*60*60" />
							<NumberInput
								:label="t('calendar','Max slots per day')"
								:value.sync="editing.dailyMax"
								:allow-empty="true" />
						</div>
					</fieldset>
				</div>
				<button
					class="primary appointment-config-modal__submit-button"
					:disabled="!editing.name"
					@click="save">
					{{ saveButtonText }}
				</button>
			</template>
		</div>
	</Modal>
</template>

<script>
import { CalendarAvailability } from '@nextcloud/calendar-availability-vue'
import Modal from '@nextcloud/vue/dist/Components/Modal'
import TextInput from './AppointmentConfigModal/TextInput'
import TextArea from './AppointmentConfigModal/TextArea'
import AppointmentConfig from '../models/appointmentConfig'
import { mapGetters } from 'vuex'
import CalendarPicker from './Shared/CalendarPicker'
import DurationInput from './AppointmentConfigModal/DurationInput'
import NumberInput from './AppointmentConfigModal/NumberInput'
import DurationSelect from './AppointmentConfigModal/DurationSelect'
import CheckedDurationSelect from './AppointmentConfigModal/CheckedDurationSelect'
import VisibilitySelect from './AppointmentConfigModal/VisibilitySelect'
import logger from '../utils/logger'
import Confirmation from './AppointmentConfigModal/Confirmation'

export default {
	name: 'AppointmentConfigModal',
	components: {
		CalendarAvailability,
		CheckedDurationSelect,
		CalendarPicker,
		DurationInput,
		Modal,
		NumberInput,
		TextInput,
		TextArea,
		DurationSelect,
		VisibilitySelect,
		Confirmation,
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
	},
	data() {
		return {
			editing: undefined,
			enablePreparationDuration: false,
			enableFollowupDuration: false,
			showConfirmation: false,
		}
	},
	computed: {
		...mapGetters([
			'sortedCalendars',
		]),
		formTitle() {
			if (this.isNew) {
				return this.$t('calendar', 'Create appointment')
			}

			return this.$t('calendar', 'Edit appointment')
		},
		saveButtonText() {
			if (this.isNew) {
				return this.$t('calendar', 'Save')
			}

			return this.$t('calendar', 'Update')
		},
		calendar() {
			if (!this.editing.targetCalendarUri) {
				return this.sortedCalendars[0]
			}

			const uri = this.editing.targetCalendarUri
			return this.sortedCalendars.find(cal => this.calendarUrlToUri(cal.url) === uri)
		},
		defaultConfig() {
			return AppointmentConfig.createDefault(
				this.calendarUrlToUri(this.$store.getters.sortedCalendars[0].url),
				this.$store.getters.scheduleInbox,
				this.$store.getters.getResolvedTimezone,
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
		reset() {
			this.editing = this.config.clone()

			this.enablePreparationDuration = !!this.editing.preparationDuration
			this.enableFollowupDuration = !!this.editing.followupDuration
			this.showConfirmation = false
		},
		calendarUrlToUri(url) {
			// Trim trailing slash and split into URL parts
			const parts = url.replace(/\/$/, '').split('/')
			// The last one is the URI
			return parts[parts.length - 1]
		},
		changeCalendar(calendar) {
			this.editing.targetCalendarUri = this.calendarUrlToUri(calendar.url)
		},
		async save() {
			if (!this.enablePreparationDuration) {
				this.editing.preparationDuration = this.defaultConfig.preparationDuration
			}

			if (!this.enableFollowupDuration) {
				this.editing.followupDuration = this.defaultConfig.followupDuration
			}

			this.editing.targetCalendarUri ??= this.defaultConfig.targetCalendarUri

			const config = this.editing
			try {
				if (this.isNew) {
					logger.info('Creating new config', { config })
					this.editing = await this.$store.dispatch('createConfig', { config })
				} else {
					logger.info('Saving config', { config })
					this.editing = await this.$store.dispatch('updateConfig', { config })
				}
				this.showConfirmation = true
			} catch (error) {
				logger.error('Failed to save config', { error, config, isNew: this.isNew })
			}
		},
	},
}
</script>
