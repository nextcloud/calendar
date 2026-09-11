<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="proposal-date__item">
		<div class="proposal-date__icon">
			<ItemIcon />
		</div>
		<div class="proposal-date__content" @click="$emit('dateFocus')">
			{{ formattedDate }}
		</div>
		<div class="proposal-date__action">
			<DestroyIcon
				:title="t('calendar', 'Remove date')"
				@click="$emit('dateRemove')" />
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ProposalDateInterface } from '@/types/proposals/proposalInterfaces'

// types, object and stores
import { t } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'
import { computed } from 'vue'
// icons
import ItemIcon from 'vue-material-design-icons/Calendar'
import DestroyIcon from 'vue-material-design-icons/Close'
import { getTimezoneOffset } from '@/services/timezoneOffsetService'

const props = withDefaults(defineProps<{
	proposalDate: ProposalDateInterface
	timezoneId?: string
}>(), {
	timezoneId: 'UTC',
})

defineEmits<{
	dateRemove: []
	dateFocus: []
}>()

const formattedDate = computed<string>(() => {
	if (!props.proposalDate.date) {
		return ''
	}
	// Get the timezone offset in minutes
	const timezoneOffset = getTimezoneOffset(props.proposalDate.date, props.timezoneId)
	const m = moment(props.proposalDate.date).utcOffset(timezoneOffset)
	// Examples: "Mon, Jul 8, 2:30 PM" (en), "Mon, 8 Jul, 14:30" (en-GB), "Mo, 8. Jul, 14:30" (de)
	return m.format('dddd, MMMM D, LT')
})
</script>

<style lang="scss" scoped>
.proposal-date__item {
	display: flex;
	align-items: center;
	gap: calc(var(--default-grid-baseline) * 4);
	padding: var(--default-grid-baseline);
    transition: background-color 0.2s ease;

	&:hover {
		background-color: var(--color-background-hover);
	}
}

.proposal-date__icon {
	flex-shrink: 0;
}

.proposal-date__content {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	cursor: pointer;
}

.proposal-date__action {
	flex-shrink: 0;
}
</style>
