<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<!--
	 The appointments feature requires at least one calendar in the vuex store.
	 Trying to use it before calendars are loaded will result in an error.
	-->
	<div v-if="hasAtLeastOneCalendar"
		class="appointment-config-list">
		<AppNavigationCaption class="appointment-config-list__caption"
			:name="t('calendar', 'Appointment schedules')">
			<template v-if="hasUserEmailAddress"
				#actions>
				<ActionButton :close-after-click="true"
					@click="showModalForNewConfig = true">
					<template #icon>
						<PlusIcon :size="20" decorative />
					</template>
					{{ t('calendar', 'Create new') }}
				</ActionButton>
			</template>
		</AppNavigationCaption>

		<template v-if="hasUserEmailAddress">
			<template v-if="sortedConfigs.length > 0">
				<AppointmentConfigListItem v-for="config in sortedConfigs"
					:key="config.id"
					:config="config"
					@delete="deleteConfig(config)" />
			</template>

			<AppointmentConfigModal v-if="showModalForNewConfig"
				:is-new="true"
				:config="defaultConfig"
				@close="closeModal" />
		</template>
		<NoEmailAddressWarning v-else />
	</div>
</template>

<script>
import AppointmentConfigListItem from './AppointmentConfigList/AppointmentConfigListItem.vue'
import {
	NcAppNavigationCaption as AppNavigationCaption,
	NcActionButton as ActionButton,
} from '@nextcloud/vue'
import PlusIcon from 'vue-material-design-icons/Plus.vue'
import AppointmentConfigModal from '../AppointmentConfigModal.vue'
import AppointmentConfig from '../../models/appointmentConfig.js'
import logger from '../../utils/logger.js'
import NoEmailAddressWarning from '../AppointmentConfigModal/NoEmailAddressWarning.vue'
import useAppointmentConfigsStore from '../../store/appointmentConfigs.js'
import usePrincipalsStore from '../../store/principals.js'
import useCalendarsStore from '../../store/calendars.js'
import useSettingsStore from '../../store/settings.js'
import { mapStores, mapState } from 'pinia'

export default {
	name: 'AppointmentConfigList',
	components: {
		AppointmentConfigListItem,
		AppNavigationCaption,
		ActionButton,
		PlusIcon,
		AppointmentConfigModal,
		NoEmailAddressWarning,
	},
	data() {
		return {
			showModalForNewConfig: false,
		}
	},
	computed: {
		...mapStores(useAppointmentConfigsStore, usePrincipalsStore, useCalendarsStore, useSettingsStore),
		...mapState(useAppointmentConfigsStore, {
			configs: (state) => state.allConfigs,
		}),
		defaultConfig() {
			return AppointmentConfig.createDefault(
				this.calendarUrlToUri(this.calendarsStore.ownSortedCalendars[0].url),
				this.calendarsStore.scheduleInbox,
				this.settingsStore.getResolvedTimezone,
			)
		},
		hasAtLeastOneCalendar() {
			return !!this.calendarsStore.ownSortedCalendars[0]
		},
		hasUserEmailAddress() {
			const principal = this.principalsStore.getCurrentUserPrincipal
			if (!principal) {
				return false
			}

			return !!principal.emailAddress
		},
		sortedConfigs() {
			return [...this.configs].sort((config1, config2) => config1.name.localeCompare(config2.name))
		},
	},
	methods: {
		closeModal() {
			this.showModalForNewConfig = false
		},
		calendarUrlToUri(url) {
			// Trim trailing slash and split into URL parts
			const parts = url.replace(/\/$/, '').split('/')
			// The last one is the URI
			return parts[parts.length - 1]
		},
		async deleteConfig(config) {
			logger.info('Deleting config', { config })

			try {
				await this.appointmentConfigsStore.deleteConfig({ id: config.id })

				logger.info('Config deleted', { config })
			} catch (error) {
				logger.error('Deleting appointment config failed', { config })
			}
		},
	},
}
</script>
