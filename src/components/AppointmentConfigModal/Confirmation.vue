<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type AppointmentConfig from '@/models/appointmentConfig.js'

import { showError, showSuccess } from '@nextcloud/dialogs'
import { t } from '@nextcloud/l10n'
import { NcEmptyContent as EmptyContent, NcButton } from '@nextcloud/vue'
import { computed } from 'vue'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import logger from '@/utils/logger.js'

const props = defineProps<{
	config: AppointmentConfig
	isNew: boolean
}>()

const title = computed<string>(() => {
	if (props.isNew) {
		return t('calendar', 'Appointment schedule successfully created')
	}

	return t('calendar', 'Appointment schedule successfully updated')
})

function hasClipboard(): boolean {
	return Boolean(navigator && navigator.clipboard)
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
	<div class="app-config-modal-confirmation">
		<EmptyContent :name="title">
			<template #icon>
				<CheckIcon />
			</template>
		</EmptyContent>
		<div class="app-config-modal-confirmation__buttons">
			<NcButton
				:href="config.bookingUrl"
				target="_blank"
				rel="noopener noreferrer">
				{{ t('calendar', 'Preview') }}
			</NcButton>
			<NcButton
				v-if="hasClipboard()"
				@click="copyLink">
				{{ t('calendar', 'Copy link') }}
			</NcButton>
		</div>
	</div>
</template>
