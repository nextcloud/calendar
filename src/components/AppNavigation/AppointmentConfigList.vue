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
	<!--
	 The appointments feature requires at least one calendar in the vuex store.
	 Trying to use it before calendars are loaded will result in an error.
	-->
	<div v-if="hasAtLeastOneCalendar"
		class="appointment-config-list">
		<AppNavigationCaption class="appointment-config-list__caption"
			:title="t('calendar', 'Appointments')">
			<template v-if="hasUserEmailAddress"
				#actions>
				<ActionButton :close-after-click="true"
					@click="showModalForNewConfig = true">
					<PlusIcon slot="icon" :size="20" decorative />
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
import AppointmentConfigListItem from './AppointmentConfigList/AppointmentConfigListItem'
import AppNavigationCaption from '@nextcloud/vue/dist/Components/AppNavigationCaption'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'
import PlusIcon from 'vue-material-design-icons/Plus'
import AppointmentConfigModal from '../AppointmentConfigModal'
import AppointmentConfig from '../../models/appointmentConfig'
import logger from '../../utils/logger'
import { mapGetters } from 'vuex'
import NoEmailAddressWarning from '../AppointmentConfigModal/NoEmailAddressWarning'

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
		...mapGetters({
			configs: 'allConfigs',
		}),
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
				await this.$store.dispatch('deleteConfig', config)

				logger.info('Config deleted', { config })
			} catch (error) {
				logger.error('Deleting appointment config failed', { config })
			}
		},
	},
}
</script>
