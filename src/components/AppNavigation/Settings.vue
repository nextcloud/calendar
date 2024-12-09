<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<AppNavigationSettings :exclude-click-outside-selectors="['.vs__dropdown-menu', '.modal-wrapper']"
		:name="settingsTitle">
		<ul class="settings-fieldset-interior">
			<SettingsImportSection :is-disabled="loadingCalendars" />
			<ActionCheckbox class="settings-fieldset-interior-item"
				:checked="hasBirthdayCalendar"
				:disabled="isBirthdayCalendarDisabled"
				@update:checked="toggleBirthdayEnabled">
				{{ $t('calendar', 'Enable birthday calendar') }}
			</ActionCheckbox>
			<ActionCheckbox class="settings-fieldset-interior-item"
				:checked="showTasks"
				:disabled="savingTasks"
				@update:checked="toggleTasksEnabled">
				{{ $t('calendar', 'Show tasks in calendar') }}
			</ActionCheckbox>
			<ActionCheckbox class="settings-fieldset-interior-item"
				:checked="!showPopover"
				:disabled="savingPopover"
				@update:checked="togglePopoverEnabled">
				{{ $t('calendar', 'Enable simplified editor') }}
			</ActionCheckbox>
			<ActionCheckbox class="settings-fieldset-interior-item"
				:checked="eventLimit"
				:disabled="savingEventLimit"
				@update:checked="toggleEventLimitEnabled">
				{{ $t('calendar', 'Limit the number of events displayed in the monthly view') }}
			</ActionCheckbox>
			<ActionCheckbox class="settings-fieldset-interior-item"
				:checked="showWeekends"
				:disabled="savingWeekend"
				@update:checked="toggleWeekendsEnabled">
				{{ $t('calendar', 'Show weekends') }}
			</ActionCheckbox>
			<ActionCheckbox class="settings-fieldset-interior-item"
				:checked="showWeekNumbers"
				:disabled="savingWeekNumber"
				@update:checked="toggleWeekNumberEnabled">
				{{ $t('calendar', 'Show week numbers') }}
			</ActionCheckbox>
			<li class="settings-fieldset-interior-item settings-fieldset-interior-item--slotDuration">
				<NcSelect :id="slotDuration"
					:options="slotDurationOptions"
					:value="selectedDurationOption"
					:disabled="savingSlotDuration"
					:clearable="false"
					:input-label="$t('calendar', 'Time increments')"
					input-id="value"
					label="label"
					@option:selected="changeSlotDuration" />
			</li>
			<!-- TODO: remove version check once Nextcloud 28 is not supported anymore -->
			<li v-if="currentUserPrincipal && defaultCalendarOptions.length > 1 && nextcloudVersion >= 29"
				class="settings-fieldset-interior-item settings-fieldset-interior-item--default-calendar">
				<CalendarPicker :value="defaultCalendar"
					:calendars="defaultCalendarOptions"
					:disabled="savingDefaultCalendarId"
					:input-label="$t('calendar', 'Default calendar for incoming invitations')"
					:clearable="false"
					@select-calendar="changeDefaultCalendar" />
			</li>
			<li class="settings-fieldset-interior-item settings-fieldset-interior-item--defaultReminder">
				<NcSelect :options="defaultReminderOptions"
					:value="selectedDefaultReminderOption"
					:disabled="savingDefaultReminder"
					:clearable="false"
					:input-label="$t('calendar', 'Default reminder')"
					input-id="value"
					label="label"
					@option:selected="changeDefaultReminder" />
			</li>
			<SettingsTimezoneSelect :is-disabled="loadingCalendars" />
			<SettingsAttachmentsFolder />
			<ActionButton @click.prevent.stop="copyPrimaryCalDAV">
				<template #icon>
					<ContentCopy :size="20" decorative />
				</template>
				{{ $t('calendar', 'Copy primary CalDAV address') }}
			</ActionButton>
			<ActionButton @click.prevent.stop="copyAppleCalDAV">
				<template #icon>
					<ContentCopy :size="20" decorative />
				</template>
				{{ $t('calendar', 'Copy iOS/macOS CalDAV address') }}
			</ActionButton>
			<ActionLink :href="availabilitySettingsUrl" target="_blank">
				<template #icon>
					<OpenInNewIcon :size="20" decorative />
				</template>
				{{ $t('calendar', 'Personal availability settings') }}
			</ActionLink>
			<ActionButton v-shortkey.propagate="['h']"
				@click.prevent.stop="showKeyboardShortcuts"
				@shortkey.native="toggleKeyboardShortcuts">
				<template #icon>
					<InformationVariant :size="20" decorative />
				</template>
				{{ $t('calendar', 'Show keyboard shortcuts') }}
			</ActionButton>
			<ShortcutOverview v-if="displayKeyboardShortcuts" @close="hideKeyboardShortcuts" />
		</ul>
	</AppNavigationSettings>
</template>

<script>
import {
	NcActionButton as ActionButton,
	NcActionCheckbox as ActionCheckbox,
	NcActionLink as ActionLink,
	NcAppNavigationSettings as AppNavigationSettings,
	NcSelect,
} from '@nextcloud/vue'
import CalendarPicker from '../Shared/CalendarPicker.vue'

import {
	generateRemoteUrl,
	generateUrl,
} from '@nextcloud/router'
import { mapStores, mapState } from 'pinia'
import useSettingsStore from '../../store/settings.js'
import useCalendarsStore from '../../store/calendars.js'
import useImportFilesStore from '../../store/importFiles.js'
import usePrincipalsStore from '../../store/principals.js'
import moment from '@nextcloud/moment'
import {
	showSuccess,
	showError,
} from '@nextcloud/dialogs'

import SettingsImportSection from './Settings/SettingsImportSection.vue'
import SettingsTimezoneSelect from './Settings/SettingsTimezoneSelect.vue'
import SettingsAttachmentsFolder from './Settings/SettingsAttachmentsFolder.vue'

import { getCurrentUserPrincipal } from '../../services/caldavService.js'
import ShortcutOverview from './Settings/ShortcutOverview.vue'
import {
	IMPORT_STAGE_DEFAULT,
	IMPORT_STAGE_IMPORTING,
	IMPORT_STAGE_PROCESSING,
} from '../../models/consts.js'

import { getDefaultAlarms } from '../../defaults/defaultAlarmProvider.js'

import ContentCopy from 'vue-material-design-icons/ContentCopy.vue'
import InformationVariant from 'vue-material-design-icons/InformationVariant.vue'
import OpenInNewIcon from 'vue-material-design-icons/OpenInNew.vue'

import logger from '../../utils/logger.js'

export default {
	name: 'Settings',
	components: {
		ShortcutOverview,
		ActionButton,
		ActionCheckbox,
		ActionLink,
		AppNavigationSettings,
		NcSelect,
		SettingsImportSection,
		SettingsTimezoneSelect,
		SettingsAttachmentsFolder,
		ContentCopy,
		InformationVariant,
		OpenInNewIcon,
		CalendarPicker,
	},
	props: {
		loadingCalendars: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			savingBirthdayCalendar: false,
			savingEventLimit: false,
			savingTasks: false,
			savingPopover: false,
			savingSlotDuration: false,
			savingDefaultReminder: false,
			savingDefaultCalendarId: false,
			savingWeekend: false,
			savingWeekNumber: false,
			savingDefaultCalendar: false,
			displayKeyboardShortcuts: false,
		}
	},
	computed: {
		...mapStores(useSettingsStore, useCalendarsStore, useImportFilesStore, usePrincipalsStore),
		...mapState(useSettingsStore, [
			'eventLimit',
			'showTasks',
			'showPopover',
			'showWeekends',
			'showWeekNumbers',
			'slotDuration',
			'defaultReminder',
		]),
		...mapState(useSettingsStore, {
			locale: store => store.momentLocale,
		}),
		...mapState(usePrincipalsStore, {
			currentUserPrincipal: 'getCurrentUserPrincipal',
		}),
		isBirthdayCalendarDisabled() {
			return this.savingBirthdayCalendar || this.loadingCalendars
		},
		files() {
			return this.importFilesStore.importFiles
		},
		hasBirthdayCalendar() {
			return !!this.calendarsStore.getBirthdayCalendar
		},
		showUploadButton() {
			return this.importStateStore.importState.stage === IMPORT_STAGE_DEFAULT
		},
		showImportModal() {
			return this.importStateStore.importState.stage === IMPORT_STAGE_PROCESSING
		},
		showProgressBar() {
			return this.importStateStore.importState.stage === IMPORT_STAGE_IMPORTING
		},
		settingsTitle() {
			return this.$t('calendar', 'Calendar settings')
		},
		slotDurationOptions() {
			return [{
				label: moment.duration(5 * 60 * 1000).locale(this.locale).humanize(),
				value: '00:05:00',
			}, {
				label: moment.duration(10 * 60 * 1000).locale(this.locale).humanize(),
				value: '00:10:00',
			}, {
				label: moment.duration(15 * 60 * 1000).locale(this.locale).humanize(),
				value: '00:15:00',
			}, {
				label: moment.duration(20 * 60 * 1000).locale(this.locale).humanize(),
				value: '00:20:00',
			}, {
				label: moment.duration(30 * 60 * 1000).locale(this.locale).humanize(),
				value: '00:30:00',
			}, {
				label: moment.duration(60 * 60 * 1000).locale(this.locale).humanize(),
				value: '01:00:00',
			}]
		},
		selectedDurationOption() {
			return this.slotDurationOptions.find(o => o.value === this.slotDuration)
		},
		defaultReminderOptions() {
			const defaultAlarms = getDefaultAlarms().map(seconds => {
				const label = seconds === 0 ? t('calendar', 'At event start') : moment.duration(Math.abs(seconds) * 1000).locale(this.locale).humanize()
				return {
					label,
					value: seconds.toString(),
				}
			})

			return [{
				label: this.$t('calendar', 'No reminder'),
				value: 'none',
			}].concat(defaultAlarms)
		},
		selectedDefaultReminderOption() {
			return this.defaultReminderOptions.find(o => o.value === this.defaultReminder)
		},
		availabilitySettingsUrl() {
			return generateUrl('/settings/user/availability')
		},
		nextcloudVersion() {
			return parseInt(OC.config.version.split('.')[0])
		},
		defaultCalendarOptions() {
			return this.calendarsStore.calendars
				.filter(calendar => !calendar.readOnly
					&& !calendar.isSharedWithMe
					&& calendar.supportsEvents)
		},
		/**
		 * The default calendar for incoming inivitations
		 *
		 * @return {object|undefined} The default calendar or undefined if none is available
		 */
		defaultCalendar() {
			const defaultCalendarUrl = this.currentUserPrincipal.scheduleDefaultCalendarUrl
			const calendar = this.defaultCalendarOptions
				.find(calendar => calendar.url === defaultCalendarUrl)

			// If the default calendar is not or no longer available,
			// pick the first calendar in the list of available calendars.
			if (!calendar) {
				return this.defaultCalendarOptions[0]
			}

			return calendar
		},
	},
	methods: {
		async toggleBirthdayEnabled() {
			// change to loading status
			this.savingBirthdayCalendar = true
			try {
				await this.settingsStore.toggleBirthdayCalendarEnabled()
				this.savingBirthdayCalendar = false
			} catch (error) {
				console.error(error)
				showError(this.$t('calendar', 'New setting was not saved successfully.'))
				this.savingBirthdayCalendar = false
			}
		},
		async toggleEventLimitEnabled() {
			// change to loading status
			this.savingEventLimit = true
			try {
				await this.settingsStore.toggleEventLimitEnabled()
				this.savingEventLimit = false
			} catch (error) {
				console.error(error)
				showError(this.$t('calendar', 'New setting was not saved successfully.'))
				this.savingEventLimit = false
			}
		},
		async toggleTasksEnabled() {
			// change to loading status
			this.savingTasks = true
			try {
				await this.settingsStore.toggleTasksEnabled()
				this.savingTasks = false
			} catch (error) {
				console.error(error)
				showError(this.$t('calendar', 'New setting was not saved successfully.'))
				this.savingTasks = false
			}
		},
		async togglePopoverEnabled() {
			// change to loading status
			this.savingPopover = true
			try {
				await this.settingsStore.togglePopoverEnabled()
				this.savingPopover = false
			} catch (error) {
				console.error(error)
				showError(this.$t('calendar', 'New setting was not saved successfully.'))
				this.savingPopover = false
			}
		},
		async toggleWeekendsEnabled() {
			// change to loading status
			this.savingWeekend = true
			try {
				await this.settingsStore.toggleWeekendsEnabled()
				this.savingWeekend = false
			} catch (error) {
				console.error(error)
				showError(this.$t('calendar', 'New setting was not saved successfully.'))
				this.savingWeekend = false
			}
		},
		/**
		 * Toggles the setting for "Show week number"
		 */
		async toggleWeekNumberEnabled() {
			// change to loading status
			this.savingWeekNumber = true
			try {
				await this.settingsStore.toggleWeekNumberEnabled()
				this.savingWeekNumber = false
			} catch (error) {
				console.error(error)
				showError(this.$t('calendar', 'New setting was not saved successfully.'))
				this.savingWeekNumber = false
			}
		},
		/**
		 * Updates the setting for slot duration
		 *
		 * @param {object} option The new selected value
		 */
		async changeSlotDuration(option) {
			if (!option) {
				return
			}

			// change to loading status
			this.savingSlotDuration = true

			try {
				await this.settingsStore.setSlotDuration({ slotDuration: option.value })
				this.savingSlotDuration = false
			} catch (error) {
				console.error(error)
				showError(this.$t('calendar', 'New setting was not saved successfully.'))
				this.savingSlotDuration = false
			}
		},
		/**
		 * Updates the setting for the default reminder
		 *
		 * @param {object} option The new selected value
		 */
		async changeDefaultReminder(option) {
			if (!option) {
				return
			}

			// change to loading status
			this.savingDefaultReminder = true

			try {
				await this.settingsStore.setDefaultReminder({
					defaultReminder: option.value,
				})
				this.savingDefaultReminder = false
			} catch (error) {
				console.error(error)
				showError(this.$t('calendar', 'New setting was not saved successfully.'))
				this.savingDefaultReminder = false
			}
		},
		/**
		 * Changes the default calendar for incoming invitations
		 *
		 * @param {object} selectedCalendar The new selected default calendar
		 */
		async changeDefaultCalendar(selectedCalendar) {
			if (!selectedCalendar) {
				return
			}

			this.savingDefaultCalendar = true

			try {
				await this.principalsStore.changePrincipalScheduleDefaultCalendarUrl({
					principal: this.currentUserPrincipal,
					scheduleDefaultCalendarUrl: selectedCalendar.url,
				})
			} catch (error) {
				logger.error('Error while changing default calendar', {
					error,
					calendarUrl: selectedCalendar.url,
					selectedCalendar,
				})
				showError(this.$t('calendar', 'Failed to save default calendar'))
			} finally {
				this.savingDefaultCalendar = false
			}
		},
		/**
		 * Copies the primary CalDAV url to the user's clipboard.
		 */
		async copyPrimaryCalDAV() {
			try {
				await navigator.clipboard.writeText(generateRemoteUrl('dav'))
				showSuccess(this.$t('calendar', 'CalDAV link copied to clipboard.'))
			} catch (error) {
				console.debug(error)
				showError(this.$t('calendar', 'CalDAV link could not be copied to clipboard.'))
			}

		},
		/**
		 * Copies the macOS / iOS specific CalDAV url to the user's clipboard.
		 * This url is user-specific.
		 */
		async copyAppleCalDAV() {
			const rootURL = generateRemoteUrl('dav')
			const url = new URL(getCurrentUserPrincipal().principalUrl, rootURL)

			try {
				await navigator.clipboard.writeText(url)
				showSuccess(this.$t('calendar', 'CalDAV link copied to clipboard.'))
			} catch (error) {
				console.debug(error)
				showError(this.$t('calendar', 'CalDAV link could not be copied to clipboard.'))
			}
		},
		/**
		 * Show the keyboard shortcuts overview
		 */
		showKeyboardShortcuts() {
			this.displayKeyboardShortcuts = true
		},
		/**
		 * Hide the keyboard shortcuts overview
		 */
		hideKeyboardShortcuts() {
			this.displayKeyboardShortcuts = false
		},
		/**
		 * Toggles the keyboard shortcuts overview
		 */
		toggleKeyboardShortcuts() {
			this.displayKeyboardShortcuts = !this.displayKeyboardShortcuts
		},
	},
}
</script>

<style scoped>
.settings-fieldset-interior-item,
:deep(.v-select.select) {
	width: 100%;
}
</style>
