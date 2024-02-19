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
	<div>
		<AppNavigationItem :name="config.name"
			@click.prevent>
			<template #icon>
				<CalendarCheckIcon :size="20" decorative />
			</template>
			<template #actions>
				<ActionLink :href="config.bookingUrl"
					target="_blank">
					<template #icon>
						<OpenInNewIcon :size="20" />
					</template>
					{{ t('calendar', 'Preview') }}
				</ActionLink>
				<ActionButton v-if="hasClipboard"
					:close-after-click="true"
					@click="copyLink">
					<template #icon>
						<LinkVariantIcon :size="20" />
					</template>
					{{ t('calendar', 'Copy link') }}
				</ActionButton>
				<ActionButton :close-after-click="true"
					@click="showModal = true">
					<template #icon>
						<PencilIcon :size="20" />
					</template>
					{{ t('calendar', 'Edit') }}
				</ActionButton>
				<ActionButton :close-after-click="true"
					@click="$emit('delete', $event)">
					<template #icon>
						<DeleteIcon :size="20" />
					</template>
					{{ t('calendar', 'Delete') }}
				</ActionButton>
			</template>
		</AppNavigationItem>
		<AppointmentConfigModal v-if="showModal"
			:is-new="false"
			:config="config"
			@close="closeModal" />
	</div>
</template>

<script>
import {
	NcAppNavigationItem as AppNavigationItem,
	NcActionButton as ActionButton,
	NcActionLink as ActionLink,
} from '@nextcloud/vue'
import CalendarCheckIcon from 'vue-material-design-icons/CalendarCheck.vue'
import DeleteIcon from 'vue-material-design-icons/Delete.vue'
import OpenInNewIcon from 'vue-material-design-icons/OpenInNew.vue'
import PencilIcon from 'vue-material-design-icons/Pencil.vue'
import AppointmentConfig from '../../../models/appointmentConfig.js'
import AppointmentConfigModal from '../../AppointmentConfigModal.vue'
import LinkVariantIcon from 'vue-material-design-icons/LinkVariant.vue'
import { showError, showSuccess } from '@nextcloud/dialogs'
import logger from '../../../utils/logger.js'

export default {
	name: 'AppointmentConfigListItem',
	components: {
		AppointmentConfigModal,
		AppNavigationItem,
		ActionButton,
		ActionLink,
		DeleteIcon,
		OpenInNewIcon,
		PencilIcon,
		CalendarCheckIcon,
		LinkVariantIcon,
	},
	props: {
		config: {
			type: AppointmentConfig,
			required: true,
		},
	},
	data() {
		return {
			showModal: false,
			loading: false,
		}
	},
	computed: {
		hasClipboard() {
			return navigator && navigator.clipboard
		},
	},
	methods: {
		closeModal() {
			this.showModal = false
		},
		async copyLink() {
			try {
				await navigator.clipboard.writeText(this.config.bookingUrl)
				showSuccess(this.$t('calendar', 'Appointment link was copied to clipboard'))
			} catch (error) {
				logger.error('Failed to copy appointment link to clipboard', { error })
				showError(this.$t('calendar', 'Appointment link could not be copied to clipboard'))
			}
		},
	},
}
</script>
