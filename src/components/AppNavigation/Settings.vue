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
				:name="t('calendar', 'Calendar settings')"
				:legacy="false"
				:show-navigation="true"
				:additional-trap-elements="[]"
				:open="showSettingsModal"
				@update:open="(val) => showSettingsModal = val">
				<NcAppSettingsSection
					id="settings-modal-general"
					:name="t('calendar', 'General')">
					<SettingsTimezoneSelect
						:is-disabled="loadingCalendars" />
					<NcFormBox>
						<NcFormBoxButton
							target="_blank"
							:href="availabilitySettingsUrl">
							{{ $t('calendar', 'Availability settings') }}
						</NcFormBoxButton>
					</NcFormBox>
					<SettingsImportSection
						:is-disabled="loadingCalendars" />
					<NcFormGroup :label="t('calendar', 'CalDAV')" :description="t('calendar', 'Access Nextcloud calendars from other apps and devices')">
						<NcFormBox>
							<NcFormBoxCopyButton :label="t('calendar', 'CalDAV URL')" :value="primaryCalDAV" />
							<NcFormBoxCopyButton :label="t('calendar', 'Server Address for iOS and macOS')" :value="appleCalDAV" />
						</NcFormBox>
					</NcFormGroup>
				</NcAppSettingsSection>
				<NcAppSettingsSection
					id="settings-modal-appearance"
					:name="t('calendar', 'Appearance')">
					<NcFormBox>
						<NcFormBoxSwitch
							v-model="hasBirthdayCalendarBinding"
							:disabled="isBirthdayCalendarDisabled"
							@update:modelValue="toggleBirthdayEnabled">
							{{ $t('calendar', 'Birthday calendar') }}
						</NcFormBoxSwitch>
						<NcFormBoxSwitch
							v-model="showTasksBinding"
							:disabled="savingTasks"
							@update:modelValue="toggleTasksEnabled">
							{{ $t('calendar', 'Tasks in calendar') }}
						</NcFormBoxSwitch>
						<NcFormBoxSwitch
							v-model="showWeekendsBinding"
							:disabled="savingWeekend"
							@update:modelValue="toggleWeekendsEnabled">
							{{ $t('calendar', 'Weekends') }}
						</NcFormBoxSwitch>
						<NcFormBoxSwitch
							v-model="showWeekNumbersBinding"
							:disabled="savingWeekNumber"
							@update:modelValue="toggleWeekNumberEnabled">
							{{ $t('calendar', 'Week numbers') }}
						</NcFormBoxSwitch>
					</NcFormBox>

					<NcFormBox>
						<NcFormBoxSwitch
							v-model="eventLimitBinding"
							:disabled="savingEventLimit"
							@update:modelValue="toggleEventLimitEnabled">
							{{ $t('calendar', 'Limit number of events shown in Month view') }}
						</NcFormBoxSwitch>
					</NcFormBox>

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
					:name="t('calendar', 'Editing')">
					<NcSelect
						:options="defaultReminderOptions"
						:value="selectedDefaultReminderOption"
						:disabled="savingDefaultReminder"
						:clearable="false"
						:input-label="$t('calendar', 'Default reminder')"
						input-id="value"
						label="label"
						@option:selected="changeDefaultReminder" />
					<NcFormBox>
						<NcFormBoxSwitch
							v-model="simpleEventEditorBinding"
							:disabled="savingPopover"
							:label="t('calendar', 'Simple event editor')"
							@update:modelValue="togglePopoverEnabled">
							<template #description>
								{{ $t('calendar', '"More details" opens the detailed editor') }}
							</template>
						</NcFormBoxSwitch>
					</NcFormBox>
					<NcFormGroup :label="t('calendar', 'Files')">
						<SettingsAttachmentsFolder />
					</NcFormGroup>
				</NcAppSettingsSection>
				<ShortcutOverview />
			</NcAppSettingsDialog>
		</template>
	</NcAppNavigationItem>
</template>

<script>
import {
	showError,
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
	NcFormBox,
	NcFormBoxButton,
	NcFormBoxCopyButton,
	NcFormBoxSwitch,
	NcFormGroup,
	NcSelect,
} from '@nextcloud/vue'
import { mapState, mapStores } from 'pinia'
import CogIcon from 'vue-material-design-icons/CogOutline.vue'
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
		NcAppNavigationItem,
		NcAppSettingsDialog,
		NcAppSettingsSection,
		NcSelect,
		SettingsImportSection,
		SettingsTimezoneSelect,
		SettingsAttachmentsFolder,
		ShortcutOverview,
		CogIcon,
		NcFormBox,
		NcFormBoxButton,
		NcFormGroup,
		NcFormBoxCopyButton,
		NcFormBoxSwitch,
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
			hasBirthdayCalendarBinding: false,
			showTasksBinding: false,
			showWeekendsBinding: false,
			showWeekNumbersBinding: false,
			eventLimitBinding: false,
			simpleEventEditorBinding: false,
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
		 * The default calendarci for incoming inivitations
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

		primaryCalDAV() {
			return generateRemoteUrl('dav')
		},

		appleCalDAV() {
			if (!this.currentUserPrincipal) {
				return ''
			}
			return new URL(this.currentUserPrincipal.url, this.primaryCalDAV).toString()
		},
	},

	async created() {
		this.hasBirthdayCalendarBinding = this.hasBirthdayCalendar
		this.showTasksBinding = this.showTasks
		this.showWeekendsBinding = this.showWeekends
		this.showWeekNumbersBinding = this.showWeekNumbers
		this.eventLimitBinding = this.eventLimit
		this.simpleEventEditorBinding = !this.skipPopover
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
	},
}
</script>

<style lang="scss" scoped>
// Needed for the cog icon the navigation sidebar to be aligned
.navigation-calendar-settings {
	padding-inline-start: calc(var(--default-grid-baseline) * 2);
	padding-bottom: calc(var(--default-grid-baseline) * 2);
}
</style>
