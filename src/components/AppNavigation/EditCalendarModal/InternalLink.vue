<!--
  - @copyright Copyright (c) 2023 Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
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
					<ClipboardArrowLeftOutline :size="20" />
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
import ClipboardArrowLeftOutline from 'vue-material-design-icons/ClipboardArrowLeftOutline.vue'

export default {
	name: 'InternalLink',
	components: {
		NcActions,
		NcActionButton,
		OpenInNewIcon,
		ClipboardArrowLeftOutline,
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
