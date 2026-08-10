<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { showError } from '@nextcloud/dialogs'
import { t } from '@nextcloud/l10n'
import { NcLoadingIcon, NcModal } from '@nextcloud/vue'
import { computed, onMounted, ref } from 'vue'
import EditFull from '@/views/EditFull.vue'
import { bootstrapEditor } from '@/services/editorBootstrapService.ts'
import useCalendarObjectInstanceStore from '@/store/calendarObjectInstance.js'
import logger from '@/utils/logger.js'

import '@nextcloud/dialogs/style.css'
import '@/styles/editor.scss'

const emit = defineEmits<{
	/** The dialog was closed and can be unmounted */
	close: []
}>()

const calendarObjectInstanceStore = useCalendarObjectInstanceStore()

/** Whether all stores the editor needs are set up */
const isBootstrapped = ref(false)

/** The editor is only rendered once it created the event to edit */
const isEditorVisible = computed(() => Boolean(calendarObjectInstanceStore.calendarObjectInstance))

onMounted(async () => {
	try {
		await bootstrapEditor()
		isBootstrapped.value = true
	} catch (error) {
		logger.error('Failed to set up the event editor', { error })
		showError(t('calendar', 'Could not open the event editor'))
		emit('close')
	}
})
</script>

<template>
	<EditFull
		v-if="isBootstrapped"
		isDialog
		@close="emit('close')" />
	<NcModal
		v-if="!isEditorVisible"
		size="full"
		:name="t('calendar', 'New event')"
		@close="emit('close')">
		<div class="new-event-dialog__loading">
			<NcLoadingIcon :size="44" :name="t('calendar', 'Loading the event editor')" />
		</div>
	</NcModal>
</template>

<style lang="scss" scoped>
.new-event-dialog__loading {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
}
</style>
