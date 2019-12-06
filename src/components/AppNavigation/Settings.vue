<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  - @author Georg Ehrke <oc.list@georgehrke.com>
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
	<AppNavigationSettings :title="$t('calendar', 'Settings & import')">
		<ul class="settings-fieldset-interior">
			<SettingsImportSection :is-disabled="loadingCalendars" />
			<ActionCheckbox
				class="settings-fieldset-interior-item"
				:checked="birthdayCalendar"
				:disabled="isBirthdayCalendarDisabled"
				@update:checked="toggleBirthdayEnabled">
				{{ $t('calendar', 'Enable birthday calendar') }}
			</ActionCheckbox>
			<ActionCheckbox
				class="settings-fieldset-interior-item"
				:checked="showPopover"
				:disabled="savingPopover"
				@update:checked="togglePopoverEnabled">
				{{ $t('calendar', 'Enable simplified editor') }}
			</ActionCheckbox>
			<ActionCheckbox
				class="settings-fieldset-interior-item"
				:checked="showWeekends"
				:disabled="savingWeekend"
				@update:checked="toggleWeekendsEnabled">
				{{ $t('calendar', 'Show weekends') }}
			</ActionCheckbox>
			<ActionCheckbox
				class="settings-fieldset-interior-item"
				:checked="showWeekNumbers"
				:disabled="savingWeekNumber"
				@update:checked="toggleWeekNumberEnabled">
				{{ $t('calendar', 'Show week numbers') }}
			</ActionCheckbox>
			<SettingsTimezoneSelect :is-disabled="loadingCalendars" />
			<ActionButton class="settings-fieldset-interior-item" icon="icon-clippy" @click.prevent.stop="copyPrimaryCalDAV">
				{{ $t('calendar', 'Copy primary CalDAV address') }}
			</ActionButton>
			<ActionButton class="settings-fieldset-interior-item" icon="icon-clippy" @click.prevent.stop="copyAppleCalDAV">
				{{ $t('calendar', 'Copy iOS/macOS CalDAV address') }}
			</ActionButton>
		</ul>
	</AppNavigationSettings>
</template>

<script>
import { ActionButton } from '@nextcloud/vue/dist/Components/ActionButton'
import { ActionCheckbox } from '@nextcloud/vue/dist/Components/ActionCheckbox'
import { AppNavigationSettings } from '@nextcloud/vue/dist/Components/AppNavigationSettings'
import {
	generateRemoteUrl,
} from '@nextcloud/router'
import {
	mapGetters,
	mapState,
} from 'vuex'

import SettingsImportSection from './Settings/SettingsImportSection.vue'
import SettingsTimezoneSelect from './Settings/SettingsTimezoneSelect.vue'

import client from '../../services/caldavService.js'

export default {
	name: 'Settings',
	components: {
		ActionButton,
		ActionCheckbox,
		AppNavigationSettings,
		SettingsImportSection,
		SettingsTimezoneSelect,
	},
	props: {
		loadingCalendars: {
			type: Boolean,
			default: false,
		},
	},
	data: function() {
		return {
			savingBirthdayCalendar: false,
			savingPopover: false,
			savingWeekend: false,
			savingWeekNumber: false,
		}
	},
	computed: {
		...mapGetters({
			birthdayCalendar: 'hasBirthdayCalendar',
		}),
		...mapState({
			showPopover: state => !state.settings.skipPopover,
			showWeekends: state => state.settings.showWeekends,
			showWeekNumbers: state => state.settings.showWeekNumbers,
			timezone: state => state.settings.timezone,
		}),
		isBirthdayCalendarDisabled() {
			return this.savingBirthdayCalendar || this.loadingCalendars
		},
		files() {
			return this.$store.state.importFiles.importFiles
		},
		showUploadButton() {
			return this.$store.state.importState.importState.stage === 'default'
		},
		showImportModal() {
			return this.$store.state.importState.importState.stage === 'processing'
		},
		showProgressBar() {
			return this.$store.state.importState.importState.stage === 'importing'
		},
	},
	methods: {
		async toggleBirthdayEnabled() {
			// change to loading status
			this.savingBirthdayCalendar = true
			try {
				await this.$store.dispatch('toggleBirthdayCalendarEnabled')
				this.savingBirthdayCalendar = false
			} catch (error) {
				console.error(error)
				this.$toast.error(this.$t('calendar', 'New setting was not saved successfully.'))
				this.savingBirthdayCalendar = false
			}
		},
		async togglePopoverEnabled() {
			// change to loading status
			this.savingPopover = true
			try {
				await this.$store.dispatch('togglePopoverEnabled')
				this.savingPopover = false
			} catch (error) {
				console.error(error)
				this.$toast.error(this.$t('calendar', 'New setting was not saved successfully.'))
				this.savingPopover = false
			}
		},
		async toggleWeekendsEnabled() {
			// change to loading status
			this.savingWeekend = true
			try {
				await this.$store.dispatch('toggleWeekendsEnabled')
				this.savingWeekend = false
			} catch (error) {
				console.error(error)
				this.$toast.error(this.$t('calendar', 'New setting was not saved successfully.'))
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
				await this.$store.dispatch('toggleWeekNumberEnabled')
				this.savingWeekNumber = false
			} catch (error) {
				console.error(error)
				this.$toast.error(this.$t('calendar', 'New setting was not saved successfully.'))
				this.savingWeekNumber = false
			}
		},
		/**
		 * Copies the primary CalDAV url to the user's clipboard.
		 */
		async copyPrimaryCalDAV() {
			try {
				await this.$copyText(generateRemoteUrl('dav'))
				this.$toast.success(this.$t('calendar', 'CalDAV link copied to clipboard.'))
			} catch (error) {
				console.debug(error)
				this.$toast.error(this.$t('calendar', 'CalDAV link could not be copied to clipboard.'))
			}

		},
		/**
		 * Copies the macOS / iOS specific CalDAV url to the user's clipboard.
		 * This url is user-specific.
		 */
		async copyAppleCalDAV() {
			const rootURL = generateRemoteUrl('dav')
			const url = new URL(client.currentUserPrincipal.principalUrl, rootURL)

			try {
				await this.$copyText(url)
				this.$toast.success(this.$t('calendar', 'CalDAV link copied to clipboard.'))
			} catch (error) {
				console.debug(error)
				this.$toast.error(this.$t('calendar', 'CalDAV link could not be copied to clipboard.'))
			}
		},
	},
}
</script>
