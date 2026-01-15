<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div>
		<AppNavigationItem
			:name="config.name"
			@click.prevent>
			<template #icon>
				<CalendarCheckIcon :size="20" decorative />
			</template>
			<template #actions>
				<ActionLink
					:href="config.bookingUrl"
					target="_blank">
					<template #icon>
						<OpenInNewIcon :size="20" />
					</template>
					{{ t('calendar', 'Preview') }}
				</ActionLink>
				<ActionButton
					v-if="hasClipboard"
					:close-after-click="true"
					@click="copyLink">
					<template #icon>
						<LinkVariantIcon :size="20" />
					</template>
					{{ t('calendar', 'Copy link') }}
				</ActionButton>
				<ActionButton
					:close-after-click="true"
					@click="duplicate">
					<template #icon>
						<ContentDuplicate :size="20" />
					</template>
					{{ t('calendar', 'Duplicate') }}
				</ActionButton>
				<ActionButton
					:close-after-click="true"
					@click="openEditModal">
					<template #icon>
						<PencilIcon :size="20" />
					</template>
					{{ t('calendar', 'Edit') }}
				</ActionButton>
				<ActionButton
					:close-after-click="true"
					@click="$emit('delete', $event)">
					<template #icon>
						<DeleteIcon :size="20" />
					</template>
					{{ t('calendar', 'Delete') }}
				</ActionButton>
			</template>
		</AppNavigationItem>
		<AppointmentConfigModal
			v-if="showModal"
			:is-new="isDuplicate"
			:is-duplicate="isDuplicate"
			:config="config"
			@close="closeModal" />
	</div>
</template>

<script>
import { showError, showSuccess } from '@nextcloud/dialogs'
import {
	NcActionButton as ActionButton,
	NcActionLink as ActionLink,
	NcAppNavigationItem as AppNavigationItem,
} from '@nextcloud/vue'
import CalendarCheckIcon from 'vue-material-design-icons/CalendarCheck.vue'
import ContentDuplicate from 'vue-material-design-icons/ContentDuplicate.vue'
import LinkVariantIcon from 'vue-material-design-icons/Link.vue'
import OpenInNewIcon from 'vue-material-design-icons/OpenInNew.vue'
import PencilIcon from 'vue-material-design-icons/PencilOutline.vue'
import DeleteIcon from 'vue-material-design-icons/TrashCanOutline.vue'
import AppointmentConfigModal from '../../AppointmentConfigModal.vue'
import AppointmentConfig from '../../../models/appointmentConfig.js'
import logger from '../../../utils/logger.js'

export default {
	name: 'AppointmentConfigListItem',
	components: {
		AppointmentConfigModal,
		AppNavigationItem,
		ActionButton,
		ActionLink,
		ContentDuplicate,
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
			isDuplicate: false,
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
			this.isDuplicate = false
		},

		openEditModal() {
			this.isDuplicate = false
			this.showModal = true
		},

		duplicate() {
			this.isDuplicate = true
			this.showModal = true
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
