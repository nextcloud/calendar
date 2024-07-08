<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="internal-link">
		<div class="internal-link__icon">
			<OpenInNewIcon :size="20" />
		</div>

		<p class="internal-link__label">
			{{ t('calendar', 'Internal link') }}
			<span class="internal-link__label__hint">
				{{ t('calendar', 'A private link that can be used with external clients') }}
			</span>
		</p>

		<NcActions>
			<NcActionButton @click.prevent.stop="copyLink">
				<template #icon>
					<ContentCopy :size="20" />
				</template>
				{{ t('calendar', 'Copy internal link') }}
			</NcActionButton>
		</NcActions>
	</div>
</template>

<script>
import { NcActions, NcActionButton } from '@nextcloud/vue'
import { generateRemoteUrl } from '@nextcloud/router'
import { showSuccess, showError } from '@nextcloud/dialogs'
import OpenInNewIcon from 'vue-material-design-icons/OpenInNew.vue'
import ContentCopy from 'vue-material-design-icons/ContentCopy.vue'

export default {
	name: 'InternalLink',
	components: {
		NcActions,
		NcActionButton,
		OpenInNewIcon,
		ContentCopy,
	},
	props: {
		calendar: {
			type: Object,
			required: true,
		},
	},
	methods: {
		/**
		 * Copies the private calendar link
		 * to be used with clients like Thunderbird
		 */
		async copyLink() {
			const rootUrl = generateRemoteUrl('dav')
			const url = new URL(this.calendar.url, rootUrl)

			try {
				await navigator.clipboard.writeText(url)
				showSuccess(this.$t('calendar', 'Calendar link copied to clipboard.'))
			} catch (error) {
				console.debug(error)
				showError(this.$t('calendar', 'Calendar link could not be copied to clipboard.'))
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.internal-link {
	display: flex;
	align-items: center;
	gap: 10px;

	&__icon {
		display: flex;
		width: 32px;
		height: 32px;
		border-radius: 16px;
		color: white;
		background-color: var(--color-text-maxcontrast);
		align-items: center;
		justify-content: center;
	}

	&__label {
		display: flex;
		flex-direction: column;
		flex: 1 auto;
		line-height: 1.2em;

		&__hint {
			color: var(--color-text-maxcontrast);
		}
	}
}
</style>
