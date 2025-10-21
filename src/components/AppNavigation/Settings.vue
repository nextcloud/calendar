<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcAppNavigationItem
		class="navigation-calendar-settings"
		:name="settingsTitle"
		:pinned="true"
		@click.prevent="onShowSettings">
		<template #icon>
			<CogIcon :size="20" decorative />
		</template>
		<template #extra>
			<NcAppSettingsDialog
				id="app-settings-modal"
				class="app-settings-modal"
				:name="t('mail', 'Calendar settings')"
				:show-navigation="true"
				:additional-trap-elements="[]"
				:open="showSettingsModal"
				@update:open="(val) => showSettingsModal = val">
				<NcAppSettingsSection
					id="settings-modal-general"
					class="calendar-settings-modal-section"
					:name="t('calendar', 'General')">
					<SettingsImportSection
						class="settings-fieldset-interior-item"
						:is-disabled="loadingCalendars" />
					<NcButton
						variant="tertiary"
						target="_blank"
						:href="availabilitySettingsUrl">
						<template #icon>
							<CalendarClockIcon :size="20" decorative />
						</template>
						<span class="button-content-with-icon">
							{{ $t('calendar', 'Availability settings') }}
							<OpenInNewIcon :size="20" decorative />
						</span>
					</NcButton>
					<h4>{{ t('calendar', 'CalDAV') }}</h4>
					<span>{{ t('calendar', 'Access Nextcloud calendars from other apps and devices') }}</span>
					<NcButton
						variant="tertiary"
						@click.prevent.stop="copyPrimaryCalDAV">
						<template #icon>
							<ContentCopy :size="20" decorative />
						</template>
						{{ $t('calendar', 'CalDAV URL') }}
					</NcButton>
					<NcButton
						variant="tertiary"
						@click.prevent.stop="copyAppleCalDAV">
						<template #icon>
							<ContentCopy :size="20" decorative />
						</template>
						{{ $t('calendar', 'Copy iOS/macOS CalDAV address') }}
					</NcButton>
				</NcAppSettingsSection>
				<NcAppSettingsSection
					id="app-settings-modal-view"
					class="calendar-settings-modal-section"
					:name="t('calendar', 'Appearance')">
					<SettingsTimezoneSelect
						class="settings-fieldset-interior-item"
						:is-disabled="loadingCalendars" />
					<NcCheckboxRadioSwitch
						class="settings-fieldset-interior-item"
						:model-value="hasBirthdayCalendar"
						:disabled="isBirthdayCalendarDisabled"
						@update:model-value="toggleBirthdayEnabled">
						{{ $t('calendar', 'Birthday calendar') }}
					</NcCheckboxRadioSwitch>
					<NcCheckboxRadioSwitch
						class="settings-fieldset-interior-item"
						:model-value="showTasks"
						:disabled="savingTasks"
						@update:model-value="toggleTasksEnabled">
						{{ $t('calendar', 'Tasks in calendar') }}
					</NcCheckboxRadioSwitch>
					<NcCheckboxRadioSwitch
						class="settings-fieldset-interior-item"
						:model-value="showWeekends"
						:disabled="savingWeekend"
						@update:model-value="toggleWeekendsEnabled">
						{{ $t('calendar', 'Weekends') }}
					</NcCheckboxRadioSwitch>
					<NcCheckboxRadioSwitch
						class="settings-fieldset-interior-item"
						:model-value="showWeekNumbers"
						:disabled="savingWeekNumber"
						@update:model-value="toggleWeekNumberEnabled">
						{{ $t('calendar', 'Week numbers') }}
					</NcCheckboxRadioSwitch>
					<NcCheckboxRadioSwitch
						class="settings-fieldset-interior-item"
						:model-value="eventLimit"
						:disabled="savingEventLimit"
						@update:model-value="toggleEventLimitEnabled">
						<span class="no-wrap-label">
							{{ $t('calendar', 'Limit number of events shown in Month view') }}
						</span>
					</NcCheckboxRadioSwitch>
					<NcSelect
						:id="slotDuration"
						:options="slotDurationOptions"
						:value="selectedDurationOption"
						:disabled="savingSlotDuration"
						:clearable="false"
						:input-label="$t('calendar', 'Density in Day and Week View')"
						input-id="value"
						label="label"
						@option:selected="changeSlotDuration" />
				</NcAppSettingsSection>
				<NcAppSettingsSection
					id="app-settings-modal-editing"
					class="calendar-settings-modal-section"
					:name="t('calendar', 'Editing')">
					<NcCheckboxRadioSwitch
						class="settings-fieldset-interior-item"
						:model-value="!skipPopover"
						:disabled="savingPopover"
						@update:model-value="togglePopoverEnabled">
						{{ $t('calendar', 'Simple event editor') }}<br>
						{{ $t('calendar', '"More details" opens the detailed editor') }}
					</NcCheckboxRadioSwitch>
					<!-- Hidden: default calendar picker -->
					<div v-if="false" class="settings-fieldset-interior-item">
						<CalendarPicker
							:value="defaultCalendar"
							:calendars="defaultCalendarOptions"
							:disabled="savingDefaultCalendarId"
							:input-label="$t('calendar', 'Default calendar for incoming invitations')"
							:clearable="false"
							@select-calendar="changeDefaultCalendar" />
					</div>
					<div class="settings-fieldset-interior-item">
						<NcSelect
							:options="defaultReminderOptions"
							:value="selectedDefaultReminderOption"
							:disabled="savingDefaultReminder"
							:clearable="false"
							:input-label="$t('calendar', 'Default reminder')"
							input-id="value"
							label="label"
							@option:selected="changeDefaultReminder" />
					</div>
					<div class="settings-fieldset-interior-item">
						<SettingsAttachmentsFolder />
					</div>
				</NcAppSettingsSection>
				<NcAppSettingsSection
					id="app-settings-modal-keyboard"
					class="calendar-settings-modal-section"
					:name="t('calendar', 'Keyboard shortcuts')">
					<ShortcutOverview />
				</NcAppSettingsSection>
			</NcAppSettingsDialog>
		</template>
	</NcAppNavigationItem>
</template>

<script>
import {
	showError,
	showSuccess,
} from '@nextcloud/dialogs'
import moment from '@nextcloud/moment'
import {
	generateRemoteUrl,
	generateUrl,
} from '@nextcloud/router'
import {
	NcAppNavigationItem,
	NcAppSettingsDialog,
	NcAppSettingsSection,
	NcButton,
	NcCheckboxRadioSwitch,
	NcSelect,
} from '@nextcloud/vue'
import { mapState, mapStores } from 'pinia'
import CalendarClockIcon from 'vue-material-design-icons/CalendarClock.vue'
import CogIcon from 'vue-material-design-icons/CogOutline.vue'
import ContentCopy from 'vue-material-design-icons/ContentCopy.vue'
import OpenInNewIcon from 'vue-material-design-icons/OpenInNew.vue'
import CalendarPicker from '../Shared/CalendarPicker.vue'
import SettingsAttachmentsFolder from './Settings/SettingsAttachmentsFolder.vue'
import SettingsImportSection from './Settings/SettingsImportSection.vue'
import SettingsTimezoneSelect from './Settings/SettingsTimezoneSelect.vue'
import ShortcutOverview from './Settings/ShortcutOverview.vue'
import { getDefaultAlarms } from '../../defaults/defaultAlarmProvider.js'
import {
	IMPORT_STAGE_DEFAULT,
	IMPORT_STAGE_IMPORTING,
	IMPORT_STAGE_PROCESSING,
} from '../../models/consts.js'
import { getCurrentUserPrincipal } from '../../services/caldavService.js'
import useCalendarsStore from '../../store/calendars.js'
import useImportFilesStore from '../../store/importFiles.js'
import usePrincipalsStore from '../../store/principals.js'
import useSettingsStore from '../../store/settings.js'
import logger from '../../utils/logger.js'

export default {
	name: 'Settings',
	components: {
		NcButton,
		NcCheckboxRadioSwitch,
		NcAppNavigationItem,
		NcAppSettingsDialog,
		NcAppSettingsSection,
		NcSelect,
		SettingsImportSection,
		SettingsTimezoneSelect,
		SettingsAttachmentsFolder,
		ContentCopy,
		CalendarPicker,
		ShortcutOverview,
		CogIcon,
		OpenInNewIcon,
		CalendarClockIcon,
	},

	props: {
		loadingCalendars: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			showSettingsModal: false,
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
		}
	},

	computed: {
		...mapStores(useSettingsStore, useCalendarsStore, useImportFilesStore, usePrincipalsStore),
		...mapState(useSettingsStore, [
			'eventLimit',
			'showTasks',
			'skipPopover',
			'showWeekends',
			'showWeekNumbers',
			'slotDuration',
			'defaultReminder',
		]),

		...mapState(useSettingsStore, {
			locale: (store) => store.momentLocale,
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
			return this.slotDurationOptions.find((o) => o.value === this.slotDuration)
		},

		defaultReminderOptions() {
			const defaultAlarms = getDefaultAlarms().map((seconds) => {
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
			return this.defaultReminderOptions.find((o) => o.value === this.defaultReminder)
		},

		availabilitySettingsUrl() {
			return generateUrl('/settings/user/availability')
		},

		nextcloudVersion() {
			return parseInt(OC.config.version.split('.')[0])
		},

		defaultCalendarOptions() {
			return this.calendarsStore.calendars
				.filter((calendar) => !calendar.readOnly
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
				.find((calendar) => calendar.url === defaultCalendarUrl)

			// If the default calendar is not or no longer available,
			// pick the first calendar in the list of available calendars.
			if (!calendar) {
				return this.defaultCalendarOptions[0]
			}

			return calendar
		},
	},

	methods: {
		onShowSettings() {
			this.showSettingsModal = true
		},

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
	},
}
</script>

<style lang="scss">
.navigation-calendar-settings {
	padding-inline-start: calc(var(--default-grid-baseline) * 2);
	padding-bottom: calc(var(--default-grid-baseline) * 2);
}
</style>
