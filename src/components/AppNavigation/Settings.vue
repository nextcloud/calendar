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
import {
	ActionButton,
	ActionCheckbox,
	AppNavigationSettings,
} from '@nextcloud/vue'
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
		toggleBirthdayEnabled() {
			// change to loading status
			this.savingBirthdayCalendar = true
			this.$store.dispatch('toggleBirthdayCalendarEnabled').then(() => {
				this.savingBirthdayCalendar = false
			}).catch((err) => {
				console.error(err)
				this.$toast.error(this.$t('calendar', 'New setting was not saved successfully.'))
				this.savingBirthdayCalendar = false
			})
		},
		togglePopoverEnabled() {
			// change to loading status
			this.savingPopover = true
			this.$store.dispatch('togglePopoverEnabled').then(() => {
				this.savingPopover = false
			}).catch((err) => {
				console.error(err)
				this.$toast.error(this.$t('calendar', 'New setting was not saved successfully.'))
				this.savingPopover = false
			})
		},
		toggleWeekendsEnabled() {
			// change to loading status
			this.savingWeekend = true
			this.$store.dispatch('toggleWeekendsEnabled').then(() => {
				this.savingWeekend = false
			}).catch((err) => {
				console.error(err)
				this.$toast.error(this.$t('calendar', 'New setting was not saved successfully.'))
				this.savingWeekend = false
			})
		},
		/**
		 * Toggles the setting for "Show week number"
		 */
		toggleWeekNumberEnabled() {
			// change to loading status
			this.savingWeekNumber = true
			this.$store.dispatch('toggleWeekNumberEnabled').then(() => {
				this.savingWeekNumber = false
			}).catch((err) => {
				console.error(err)
				this.$toast.error(this.$t('calendar', 'New setting was not saved successfully.'))
				this.savingWeekNumber = false
			})
		},
		/**
		 * Copies the primary CalDAV url to the user's clipboard.
		 */
		copyPrimaryCalDAV() {
			this.$copyText(generateRemoteUrl('dav'))
				.then(e => this.$toast.success(this.$t('calendar', 'CalDAV link copied to clipboard.')))
				.catch(e => this.$toast.error(this.$t('calendar', 'CalDAV link could not be copied to clipboard.')))

		},
		/**
		 * Copies the macOS / iOS specific CalDAV url to the user's clipboard.
		 * This url is user-specific.
		 */
		copyAppleCalDAV() {
			const rootURL = generateRemoteUrl('dav')
			const url = new URL(client.currentUserPrincipal.principalUrl, rootURL)

			this.$copyText(url)
				.then(e => this.$toast.success(this.$t('calendar', 'CalDAV link copied to clipboard.')))
				.catch(e => this.$toast.error(this.$t('calendar', 'CalDAV link could not be copied to clipboard.')))
		},
	},
}
</script>
