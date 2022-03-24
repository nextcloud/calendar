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
	<div>
		<AppNavigationItem :title="config.name"
			@click.prevent>
			<template #icon>
				<CalendarCheckIcon :size="20" decorative />
			</template>
			<template #actions>
				<ActionLink :href="config.bookingUrl"
					target="_blank">
					<OpenInNewIcon slot="icon" :size="20" decorative />
					{{ t('calendar', 'Preview') }}
				</ActionLink>
				<ActionButton v-if="hasClipboard"
					:close-after-click="true"
					@click="copyLink">
					<LinkVariantIcon slot="icon" :size="20" decorative />
					{{ t('calendar', 'Copy link') }}
				</ActionButton>
				<ActionButton :close-after-click="true"
					@click="showModal = true">
					<PencilIcon slot="icon" :size="20" decorative />
					{{ t('calendar', 'Edit') }}
				</ActionButton>
				<ActionButton :close-after-click="true"
					@click="$emit('delete', $event)">
					<DeleteIcon slot="icon" :size="20" decorative />
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
import AppNavigationItem from '@nextcloud/vue/dist/Components/AppNavigationItem'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'
import ActionLink from '@nextcloud/vue/dist/Components/ActionLink'
import CalendarCheckIcon from 'vue-material-design-icons/CalendarCheck'
import DeleteIcon from 'vue-material-design-icons/Delete'
import OpenInNewIcon from 'vue-material-design-icons/OpenInNew.vue'
import PencilIcon from 'vue-material-design-icons/Pencil'
import AppointmentConfig from '../../../models/appointmentConfig'
import AppointmentConfigModal from '../../AppointmentConfigModal'
import LinkVariantIcon from 'vue-material-design-icons/LinkVariant'
import { showError, showSuccess } from '@nextcloud/dialogs'
import logger from '../../../utils/logger'

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
