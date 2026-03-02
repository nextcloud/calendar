<!--
  - SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcModal
		v-if="!!calendarsStore.editCalendarModal && calendar"
		size="normal"
		:name="$t('calendar', 'Edit calendar')"
		@close="closeModal">
		<div class="edit-calendar-modal">
			<h3 class="edit-calendar-modal__header">
				{{ $t('calendar', 'Edit calendar') }}
				<span class="edit-calendar-modal__header_subtitle">
					{{ description }}
				</span>
			</h3>

			<div class="edit-calendar-modal__name-and-color">
				<div class="edit-calendar-modal__name-and-color__color">
					<NcColorPicker
						v-model="calendarColor"
						:advancedFields="true"
						@update:modelValue="calendarColorChanged = true">
						<div
							class="edit-calendar-modal__name-and-color__color__dot"
							:style="{ 'background-color': calendarColor }" />
					</NcColorPicker>
				</div>

				<NcTextField
					v-model="calendarName"
					class="edit-calendar-modal__name-and-color__name"
					:label="$t('calendar', 'Calendar name')"
					:labelOutside="true"
					:error="!isCalendarNameValid"
					:helperText="!isCalendarNameValid ? $t('calendar', 'Calendar name can not be blank') : ''"
					@update:modelValue="calendarNameChanged = true" />
			</div>
			<template v-if="canBeShared">
				<NcCheckboxRadioSwitch v-model="isTransparent">
					{{ $t('calendar', 'Never show me as busy (set this calendar to transparent)') }}
				</NcCheckboxRadioSwitch>
			</template>
			<template v-if="!calendar.isSharedWithMe && isAfterVersion">
				<div class="edit-calendar-modal__default-alarm">
					<label for="default-alarm-select" class="edit-calendar-modal__default-alarm__label">
						{{ $t('calendar', 'Default reminder') }}
					</label>
					<NcSelect
						id="default-alarm-select"
						v-model="selectedDefaultAlarm"
						:options="defaultAlarmOptions"
						:clearable="false"
						:placeholder="$t('calendar', 'Select default reminder')"
						class="edit-calendar-modal__default-alarm__select"
						@update:modelValue="defaultAlarmChanged = true" />
					<p class="edit-calendar-modal__default-alarm__hint">
						{{ $t('calendar', 'This reminder will be automatically added to all new events created in this calendar') }}
					</p>
				</div>
			</template>
			<template v-if="canBeShared">
				<h3 class="edit-calendar-modal__sharing-header">
					{{ $t('calendar', 'Share calendar') }}
				</h3>

				<div class="edit-calendar-modal__sharing">
					<SharingSearch :calendar="calendar" />
					<PublishCalendar v-if="canBePublished" :calendar="calendar" />
					<InternalLink :calendar="calendar" />
					<ShareItem
						v-for="sharee in calendar.shares"
						:key="sharee.uri"
						:sharee="sharee"
						:calendar="calendar" />
				</div>
			</template>
			<NcAppNavigationSpacer />
			<div class="edit-calendar-modal__actions">
				<NcButton v-if="calendar.isSharedWithMe" variant="tertiary" @click="deleteCalendar">
					<template #icon>
						<CloseIcon :size="20" />
					</template>
					{{ $t('calendar', 'Unshare from me') }}
				</NcButton>
				<NcButton v-else variant="tertiary" @click="deleteCalendar">
					<template #icon>
						<DeleteIcon :size="20" />
					</template>
					{{ $t('calendar', 'Delete') }}
				</NcButton>
				<NcButton variant="tertiary" :href="downloadUrl">
					<template #icon>
						<DownloadIcon :size="20" />
					</template>
					{{ $t('calendar', 'Export') }}
				</NcButton>
				<NcButton variant="secondary" :disabled="!isCalendarNameValid" @click="saveAndClose">
					<template #icon>
						<CheckIcon :size="20" />
					</template>
					{{ $t('calendar', 'Save') }}
				</NcButton>
			</div>
		</div>
	</NcModal>
</template>

<script>
import { showError } from '@nextcloud/dialogs'
import { getLanguage } from '@nextcloud/l10n'
import { NcAppNavigationSpacer, NcButton, NcCheckboxRadioSwitch, NcColorPicker, NcModal, NcSelect, NcTextField } from '@nextcloud/vue'
import { mapStores } from 'pinia'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import CloseIcon from 'vue-material-design-icons/Close.vue'
import DeleteIcon from 'vue-material-design-icons/TrashCanOutline.vue'
import DownloadIcon from 'vue-material-design-icons/TrayArrowDown.vue'
import InternalLink from './EditCalendarModal/InternalLink.vue'
import PublishCalendar from './EditCalendarModal/PublishCalendar.vue'
import ShareItem from './EditCalendarModal/ShareItem.vue'
import SharingSearch from './EditCalendarModal/SharingSearch.vue'
import { getDefaultAlarms } from '../../defaults/defaultAlarmProvider.js'
import alarmFormat from '../../filters/alarmFormat.js'
import useCalendarsStore from '../../store/calendars.js'
import useSettingsStore from '../../store/settings.js'
import {
	getAmountAndUnitForTimedEvents,
	getAmountHoursMinutesAndUnitForAllDayEvents,
} from '../../utils/alarms.js'
import logger from '../../utils/logger.js'
import { isAfterVersion } from '../../utils/nextcloudVersion.ts'

export default {
	name: 'EditCalendarModal',
	components: {
		NcModal,
		NcColorPicker,
		NcButton,
		NcTextField,
		NcSelect,
		PublishCalendar,
		SharingSearch,
		ShareItem,
		DeleteIcon,
		DownloadIcon,
		CloseIcon,
		CheckIcon,
		InternalLink,
		NcAppNavigationSpacer,
		NcCheckboxRadioSwitch,
	},

	data() {
		return {
			calendarColor: undefined,
			calendarColorChanged: false,
			isTransparent: false,
			calendarName: undefined,
			calendarNameChanged: false,
			selectedDefaultAlarm: null,
			defaultAlarmChanged: false,
		}
	},

	computed: {
		...mapStores(useCalendarsStore),
		calendar() {
			const id = this.calendarsStore.editCalendarModal?.calendarId
			if (!id) {
				return undefined
			}

			return this.calendarsStore.getCalendarById(id)
		},

		/**
		 * Whether to show the publishing action.
		 *
		 * @return {boolean}
		 */
		canBePublished() {
			return this.calendar.canBePublished
		},

		/**
		 * Whether to show the sharing section
		 *
		 * @return {boolean}
		 */
		canBeShared() {
			// The backend falsely reports incoming editable shares as being shareable
			// Ref https://github.com/nextcloud/calendar/issues/5755
			if (this.calendar.isSharedWithMe) {
				return false
			}

			return this.calendar.canBeShared || this.calendar.canBePublished
		},

		/**
		 * Download url of the calendar
		 *
		 * @return {string}
		 */
		downloadUrl() {
			return this.calendar.url + '?export'
		},

		/**
		 * Whether the calendar name is non-blank.
		 *
		 * @return {boolean}
		 */
		isCalendarNameValid() {
			return !!this.calendarName?.trim()
		},

		/**
		 * Description about supported component types.
		 *
		 * @return {string}
		 */
		description() {
			const supportedTypes = []
			if (this.calendar.supportsEvents) {
				supportedTypes.push(this.$t('calendar', 'events'))
			}
			if (this.calendar.supportsTasks) {
				supportedTypes.push(this.$t('calendar', 'tasks'))
			}
			if (this.calendar.supportsJournals) {
				// TRANSLATORS "notes" would be more user-friendly. "journal entries" (from RFC 5545) was used to avoid confusion with notes from the Notes app.
				supportedTypes.push(this.$t('calendar', 'journal entries'))
			}

			if (supportedTypes.lenght === 0) {
				return this.$t('calendar', 'This calendar supports neither events, tasks nor journal entries.')
			}

			const formatter = new Intl.ListFormat(getLanguage(), { type: 'conjunction' })
			const localizedTypes = formatter.format(supportedTypes)
			return this.$n(
				'calendar',
				'This calendar supports only {types}.',
				'This calendar supports {types}.',
				supportedTypes.length,
				{ types: localizedTypes },
			)
		},

		/**
		 * Get the default alarm options for the select dropdown
		 *
		 * @return {Array}
		 */
		defaultAlarmOptions() {
			const settingsStore = useSettingsStore()
			const currentUserTimezone = settingsStore.getResolvedTimezone
			const locale = settingsStore.momentLocale

			const options = [
				{
					label: this.$t('calendar', 'None'),
					value: null,
				},
			]

			// Add standard alarm options for timed events
			const alarms = getDefaultAlarms(false)
			for (const alarm of alarms) {
				const alarmObject = this.getAlarmObjectFromTriggerTime(alarm)
				options.push({
					label: alarmFormat(alarmObject, false, currentUserTimezone, locale),
					value: alarm,
				})
			}

			return options
		},

		/**
		 * Whether the default alarm feature is supported (Nextcloud 34+)
		 *
		 * @return {boolean}
		 */
		isAfterVersion() {
			return isAfterVersion(34)
		},
	},

	watch: {
		calendar(calendar) {
			if (!calendar) {
				return
			}

			this.calendarName = calendar.displayName
			this.calendarColor = calendar.color
			this.calendarNameChanged = false
			this.calendarColorChanged = false
			this.isTransparent = calendar.transparency === 'transparent'

			// Initialize default alarm
			if (calendar.defaultAlarm === null) {
				this.selectedDefaultAlarm = this.defaultAlarmOptions[0]
			} else {
				const value = parseInt(calendar.defaultAlarm)
				const option = this.defaultAlarmOptions.find((opt) => opt.value === value)
				this.selectedDefaultAlarm = option || this.defaultAlarmOptions[0]
			}
			this.defaultAlarmChanged = false
		},
	},

	methods: {
		/**
		 * Close the modal (without saving).
		 */
		closeModal() {
			this.calendarsStore.editCalendarModal = undefined
		},

		/**
		 * Save the calendar color.
		 */
		async saveColor() {
			try {
				await this.calendarsStore.changeCalendarColor({
					calendar: this.calendar,
					newColor: this.calendarColor,
				})
			} catch (error) {
				logger.error('Failed to save calendar color', {
					calendar: this.calendar,
					newColor: this.calendarColor,
				})
				throw error
			}
		},

		/**
		 * Save the calendar transparency.
		 */
		async saveTransparency() {
			try {
				await this.calendarsStore.changeCalendarTransparency({
					calendar: this.calendar,
					transparency: this.isTransparent ? 'transparent' : 'opaque',
				})
			} catch (error) {
				logger.error('Failed to save calendar transparency', {
					calendar: this.calendar,
					transparency: this.isTransparent ? 'transparent' : 'opaque',
				})
				throw error
			}
		},

		/**
		 * Save the calendar name.
		 */
		async saveName() {
			try {
				await this.calendarsStore.renameCalendar({
					calendar: this.calendar,
					newName: this.calendarName.trim(),
				})
			} catch (error) {
				logger.error('Failed to save calendar name', {
					calendar: this.calendar,
					newName: this.calendarName,
				})
				throw error
			}
		},

		/**
		 * Save the calendar default alarm.
		 */
		async saveDefaultAlarm() {
			try {
				const defaultAlarmValue = this.selectedDefaultAlarm ? this.selectedDefaultAlarm.value : null
				await this.calendarsStore.changeCalendarDefaultAlarm({
					calendar: this.calendar,
					defaultAlarm: defaultAlarmValue,
				})
			} catch (error) {
				logger.error('Failed to save calendar default alarm', {
					calendar: this.calendar,
					defaultAlarm: this.selectedDefaultAlarm,
				})
				throw error
			}
		},

		/**
		 * Save unsaved changes and close the modal.
		 *
		 * @return {Promise<void>}
		 */
		async saveAndClose() {
			if (!this.isCalendarNameValid) {
				return
			}
			try {
				if (this.calendarColorChanged) {
					await this.saveColor()
				}
				await this.saveTransparency()
				if (this.calendarNameChanged) {
					await this.saveName()
				}
				if (this.isAfterVersion && this.defaultAlarmChanged) {
					await this.saveDefaultAlarm()
				}
			} catch (error) {
				showError(this.$t('calendar', 'Failed to save calendar name and color'))
			}

			this.closeModal()
		},

		/**
		 * Deletes or unshares the calendar
		 */
		deleteCalendar() {
			this.calendarsStore.deleteCalendarAfterTimeout({
				calendar: this.calendar,
			})
			this.closeModal()
		},

		/**
		 * Create alarm object from trigger time for formatting
		 *
		 * @param {number} time Total amount of seconds for the trigger
		 * @return {object} The alarm object
		 */
		getAlarmObjectFromTriggerTime(time) {
			const timedData = getAmountAndUnitForTimedEvents(time)
			const allDayData = getAmountHoursMinutesAndUnitForAllDayEvents(time)

			return {
				isRelative: true,
				absoluteDate: null,
				absoluteTimezoneId: null,
				relativeIsBefore: time < 0,
				relativeIsRelatedToStart: true,
				relativeUnitTimed: timedData.unit,
				relativeAmountTimed: timedData.amount,
				relativeUnitAllDay: allDayData.unit,
				relativeAmountAllDay: allDayData.amount,
				relativeHoursAllDay: allDayData.hours,
				relativeMinutesAllDay: allDayData.minutes,
				relativeTrigger: time,
			}
		},
	},
}
</script>

<style lang="scss">
.edit-calendar-modal {
	padding: 20px;
	display: flex;
	flex-direction: column;

	&__header {
		margin-top: 0;
	}

	&__header,
	&__sharing-header {
		// Same font size the header of NcDialog (no variable available a this point)
		font-size: 21px;
	}

	&__header_subtitle {
		display: block;
		color: var(--color-text-maxcontrast);
		font-size: 1rem;
		font-weight: normal;
	}

	&__name-and-color {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 10px;

		&__color {
			&__dot {
				width: 24px;
				height: 24px;
				border-radius: 12px;
			}
		}

		&__name {
			flex: 1 auto;
		}
	}

	&__actions {
		display: flex;
		gap: 10px;
		margin-top: 10px;

		button:last-of-type {
			margin-inline-start: auto;
		}
	}

	&__sharing-header {
		margin-top: 10px;
	}

	&__sharing {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	&__default-alarm {
		margin-bottom: calc(var(--default-grid-baseline) * 2);

		&__label {
			display: block;
			margin-bottom: var(--default-grid-baseline);
			font-weight: bold;
		}

		&__select {
			width: 100%;
		}

		&__hint {
			margin-top: var(--default-grid-baseline);
			color: var(--color-text-maxcontrast);
		}
	}

	.checkbox-content {
		margin-inline-start: 25px;
	}
}

.app-navigation-spacer {
	list-style-type: none;
}
</style>
