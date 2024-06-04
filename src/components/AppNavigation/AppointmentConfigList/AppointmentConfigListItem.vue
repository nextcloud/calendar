<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
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
