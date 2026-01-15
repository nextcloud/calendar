<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="attendee-display" :class="{ 'attendee-display--compact': hasMembers }">
		<div class="attendee-display__name">
			<slot name="displayname">
				{{ displayName }}
			</slot>
		</div>
		<span v-if="email && !hasMembers" :title="email" class="attendee-display__button-wrapper">
			<NcButton
				class="attendee-display__button"
				variant="tertiary-no-background"
				:aria-label="$t('calendar', 'Copy name and email address')"
				@click="handleCopy">
				<template #icon>
					<ContentCopy :size="16" />
				</template>
			</NcButton>
		</span>
	</div>
</template>

<script>
import { showError, showSuccess } from '@nextcloud/dialogs'
import { NcButton } from '@nextcloud/vue'
import ContentCopy from 'vue-material-design-icons/ContentCopy.vue'

export default {
	name: 'AttendeeDisplay',
	components: {
		NcButton,
		ContentCopy,
	},

	props: {
		displayName: {
			type: String,
			required: true,
		},

		email: {
			type: String,
			required: true,
		},

		hasMembers: {
			type: Boolean,
			default: false,
		},
	},

	methods: {
		async handleCopy() {
			try {
				const text = `${this.displayName} <${this.email}>`
				await navigator.clipboard.writeText(text)
				showSuccess(this.$t('calendar', 'Copied to clipboard'))
			} catch (e) {
				showError(this.$t('calendar', 'Failed to copy'))
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.attendee-display {
	display: flex;
	align-items: center;
	gap: var(--default-grid-baseline);
	overflow: hidden;
	margin-bottom: calc(var(--default-grid-baseline) * 4);

	&--compact {
		margin-bottom: 0;
	}

	&__name {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}

	&__button-wrapper {
		flex-shrink: 0;
		display: flex;
	}

	&__button {
		flex-shrink: 0;
	}
}
</style>
