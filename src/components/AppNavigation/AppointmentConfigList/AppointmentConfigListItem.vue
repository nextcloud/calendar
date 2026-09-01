<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type AppointmentConfig from '@/models/appointmentConfig.js'

import { showError, showSuccess } from '@nextcloud/dialogs'
import { t } from '@nextcloud/l10n'
import {
	NcActionButton as ActionButton,
	NcActionLink as ActionLink,
	NcAppNavigationItem as AppNavigationItem,
} from '@nextcloud/vue'
import { ref } from 'vue'
import CalendarCheckIcon from 'vue-material-design-icons/CalendarCheck.vue'
import ContentDuplicate from 'vue-material-design-icons/ContentDuplicate.vue'
import LinkVariantIcon from 'vue-material-design-icons/Link.vue'
import OpenInNewIcon from 'vue-material-design-icons/OpenInNew.vue'
import PencilIcon from 'vue-material-design-icons/PencilOutline.vue'
import DeleteIcon from 'vue-material-design-icons/TrashCanOutline.vue'
import AppointmentConfigModal from '@/components/AppointmentConfigModal.vue'
import logger from '@/utils/logger.js'

const props = defineProps<{
	config: AppointmentConfig
}>()

defineEmits<{
	delete: []
}>()

const showEditor = ref(false)
const isDuplicate = ref(false)

function openEditor(): void {
	isDuplicate.value = false
	showEditor.value = true
}

function closeEditor(): void {
	showEditor.value = false
	isDuplicate.value = false
}

function hasClipboard(): boolean {
	return Boolean(navigator && navigator.clipboard)
}

function duplicate(): void {
	isDuplicate.value = true
	showEditor.value = true
}

async function copyLink(): Promise<void> {
	try {
		await navigator.clipboard.writeText(props.config.bookingUrl)
		showSuccess(t('calendar', 'Appointment link was copied to clipboard'))
	} catch (error) {
		logger.error('Failed to copy appointment link to clipboard', { error })
		showError(t('calendar', 'Appointment link could not be copied to clipboard'))
	}
}
</script>

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
					v-if="hasClipboard()"
					:closeAfterClick="true"
					@click="copyLink">
					<template #icon>
						<LinkVariantIcon :size="20" />
					</template>
					{{ t('calendar', 'Copy link') }}
				</ActionButton>
				<ActionButton
					:closeAfterClick="true"
					@click="duplicate">
					<template #icon>
						<ContentDuplicate :size="20" />
					</template>
					{{ t('calendar', 'Duplicate') }}
				</ActionButton>
				<ActionButton
					:closeAfterClick="true"
					@click="openEditor">
					<template #icon>
						<PencilIcon :size="20" />
					</template>
					{{ t('calendar', 'Edit') }}
				</ActionButton>
				<ActionButton
					:closeAfterClick="true"
					@click="$emit('delete')">
					<template #icon>
						<DeleteIcon :size="20" />
					</template>
					{{ t('calendar', 'Delete') }}
				</ActionButton>
			</template>
		</AppNavigationItem>
		<AppointmentConfigModal
			v-if="showEditor"
			:isNew="isDuplicate"
			:isDuplicate="isDuplicate"
			:config="config"
			@close="closeEditor" />
	</div>
</template>
