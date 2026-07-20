<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="time-suggestion" role="status" aria-live="polite">
		<ClockOutlineIcon :size="16" class="time-suggestion__icon" decorative />
		<span class="time-suggestion__text">{{ suggestionLabel }}</span>
		<NcButton size="small" variant="tertiary" @click="$emit('apply')">
			{{ t('calendar', 'Apply') }}
		</NcButton>
		<NcButton
			size="small"
			variant="tertiary"
			:aria-label="t('calendar', 'Dismiss time suggestion')"
			@click="$emit('dismiss')">
			<template #icon>
				<CloseIcon :size="16" />
			</template>
		</NcButton>
	</div>
</template>

<script>
import { t } from '@nextcloud/l10n'
import { NcButton } from '@nextcloud/vue'
import ClockOutlineIcon from 'vue-material-design-icons/ClockOutline.vue'
import CloseIcon from 'vue-material-design-icons/Close.vue'

export default {
	name: 'TimeSuggestion',

	components: {
		NcButton,
		ClockOutlineIcon,
		CloseIcon,
	},

	props: {
		suggestion: {
			type: Object,
			required: true,
		},
	},

	emits: ['apply', 'dismiss'],

	computed: {
		suggestionLabel() {
			const { type, displayText } = this.suggestion
			switch (type) {
				case 'all-day':
					return t('calendar', 'Mark as all-day event')
				case 'time-range':
					return t('calendar', 'Set time: {displayText}', { displayText })
				case 'time-only':
					return t('calendar', 'Set time: {displayText}', { displayText })
				case 'date-range':
					return t('calendar', 'Set date range: {displayText}', { displayText })
				case 'date':
					return t('calendar', 'Set date: {displayText}', { displayText })
				case 'datetime':
					return t('calendar', 'Set date and time: {displayText}', { displayText })
				default:
					return displayText
			}
		},
	},

	methods: { t },
}
</script>

<style lang="scss" scoped>
.time-suggestion {
	display: flex;
	align-items: center;
	gap: calc(var(--default-grid-baseline) * 1);
	padding: calc(var(--default-grid-baseline) * 1) calc(var(--default-grid-baseline) * 2);
	margin-top: calc(var(--default-grid-baseline) * 1);
	border-radius: var(--border-radius);
	background-color: var(--color-background-dark);
	font-size: var(--font-size-small);

	&__icon {
		flex-shrink: 0;
		color: var(--color-text-maxcontrast);
	}

	&__text {
		flex: 1;
		color: var(--color-text-maxcontrast);
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}
</style>
