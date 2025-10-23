<!--
 - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 - SPDX-License-Identifier: AGPL-3.0-or-later
 -->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import { NcButton, NcModal } from '@nextcloud/vue'
import { computed, defineEmits, defineProps } from 'vue'
import { DragRecurrenceDialogResult } from '../models/consts.ts'

const props = defineProps<{
	// TODO: exports some typings from @nextcloud/calendar-js
	eventComponent: {
		canCreateRecurrenceExceptions(): boolean
		isMasterItem(): boolean
		get isExactForkOfPrimary(): boolean
	}
}>()

const emit = defineEmits<{
	(e: 'close', result: string): void
}>()

const canCreateRecurrenceException = computed<boolean>(() => props.eventComponent?.canCreateRecurrenceExceptions() ?? false)

const forceThisAndAllFuture = computed<boolean>(() => {
	if (!props.eventComponent) {
		return false
	}

	return props.eventComponent.isMasterItem() || props.eventComponent.isExactForkOfPrimary
})
</script>

<template>
	<NcModal
		:name="t('calendar', 'Please confirm')"
		@close="emit('close', DragRecurrenceDialogResult.Cancel)">
		<div class="drag-recurrence-modal">
			<p>
				{{ t('calendar', 'You are dragging a single occurrence of an event. Please confirm your action.') }}
			</p>
			<div class="drag-recurrence-modal__buttons">
				<NcButton @click="emit('close', DragRecurrenceDialogResult.Cancel)">
					{{ t('calendar', 'Cancel') }}
				</NcButton>
				<NcButton
					v-if="canCreateRecurrenceException && !forceThisAndAllFuture"
					variant="primary"
					@click="emit('close', DragRecurrenceDialogResult.SaveThisOnly)">
					{{ t('calendar', 'Update this occurrence') }}
				</NcButton>
				<NcButton
					v-if="canCreateRecurrenceException"
					variant="primary"
					@click="emit('close', DragRecurrenceDialogResult.SaveThisAndAllFuture)">
					{{ t('calendar', 'Update this and all future') }}
				</NcButton>
			</div>
		</div>
	</NcModal>
</template>

<style scoped lang="scss">
.drag-recurrence-modal {
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 3);
	padding: calc(var(--default-grid-baseline) * 6);

	&__buttons {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: calc(var(--default-grid-baseline) * 2);
	}
}
</style>
