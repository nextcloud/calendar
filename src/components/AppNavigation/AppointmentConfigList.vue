<!--
  - @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
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
	<!--
	 The appointments feature requires at least one calendar in the vuex store.
	 Trying to use it before calendars are loaded will result in an error.
	-->
	<div v-if="hasAtLeastOneCalendar"
		class="appointment-config-list">
		<AppNavigationCaption class="appointment-config-list__caption"
			:name="t('calendar', 'Appointments')">
			<template v-if="hasUserEmailAddress"
				#actions>
				<ActionButton :close-after-click="true"
					@click="showModalForNewConfig = true">
					<template #icon>
						<PlusIcon :size="20" decorative />
					</template>
					{{ t('calendar', 'Add new') }}
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
import useAppointmentConfigStore from '../../store/appointmentConfigs.js'
import { mapStores } from 'pinia'

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
		...mapStores(useAppointmentConfigStore),
		configs() {
			return this.appointmentConfigStore.allConfigs
		},
		defaultConfig() {
			return AppointmentConfig.createDefault(
				this.calendarUrlToUri(this.$store.getters.ownSortedCalendars[0].url),
				this.$store.getters.scheduleInbox,
				this.$store.getters.getResolvedTimezone,
			)
		},
		hasAtLeastOneCalendar() {
			return !!this.$store.getters.ownSortedCalendars[0]
		},
		hasUserEmailAddress() {
			const principal = this.$store.getters.getCurrentUserPrincipal
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
				await this.appointmentConfigStore.deleteConfig({ id: config.id })

				logger.info('Config deleted', { config })
			} catch (error) {
				logger.error('Deleting appointment config failed', { config })
			}
		},
	},
}
</script>
