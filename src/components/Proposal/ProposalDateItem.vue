<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="proposal-date__item">
		<div class="proposal-date__icon">
			<ItemIcon />
		</div>
		<div class="proposal-date__content" @click="$emit('date-focus')">
			{{ formattedDate }}
		</div>
		<div class="proposal-date__action">
			<DestroyIcon
				:title="t('calendar', 'Remove date')"
				@click="$emit('date-remove')" />
		</div>
	</div>
</template>

<script lang="ts">
import type { ProposalDateInterface } from '@/types/proposals/proposalInterfaces'

// types, object and stores
import { t } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'
// icons
import ItemIcon from 'vue-material-design-icons/Calendar'
import DestroyIcon from 'vue-material-design-icons/Close'

export default {
	name: 'ProposalDateItem',

	components: {
		ItemIcon,
		DestroyIcon,
	},

	props: {
		proposalDate: {
			type: Object as () => ProposalDateInterface,
			required: true,
		},

		timezoneId: {
			type: String,
			default: 'UTC',
		},
	},

	emits: ['date-remove', 'date-focus'],

	computed: {
		formattedDate(): string {
			if (!this.proposalDate.date) {
				return ''
			}
			// Get the timezone offset in minutes
			let timezoneOffset = 0
			try {
				const now = new Date()
				const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
				const targetDate = new Date(now.toLocaleString('en-US', { timeZone: this.timezoneId }))
				timezoneOffset = ((utcDate.getTime() - targetDate.getTime()) / (1000 * 60)) * -1
			} catch (e) {
				timezoneOffset = 0
			}
			const m = moment(this.proposalDate.date).utcOffset(timezoneOffset)
			// Examples: "Mon, Jul 8, 2:30 PM" (en), "Mon, 8 Jul, 14:30" (en-GB), "Mo, 8. Jul, 14:30" (de)
			return m.format('dddd, MMMM D, LT')
		},
	},

	methods: {
		t,
	},
}
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
