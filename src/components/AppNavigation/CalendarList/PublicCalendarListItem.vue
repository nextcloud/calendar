<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<AppNavigationItem :loading="calendar.loading"
		:name="calendar.displayName || $t('calendar', 'Untitled calendar')"
		:menu-open.sync="menuOpen">
		<template #icon>
			<AppNavigationIconBullet :color="calendar.color" />
		</template>

		<template #counter>
			<Avatar :user="owner"
				:is-guest="true"
				:disable-tooltip="true"
				:disable-menu="true" />
		</template>

		<template #actions>
			<ActionButton v-if="showCopySubscriptionLinkLabel"
				@click.prevent.stop="copySubscriptionLink">
				<template #icon>
					<LinkVariant :size="20" decorative />
				</template>
				{{ $t('calendar', 'Copy subscription link') }}
			</ActionButton>
			<ActionText v-if="showCopySubscriptionLinkSpinner"
				icon="icon-loading-small">
				<!-- eslint-disable-next-line no-irregular-whitespace -->
				{{ $t('calendar', 'Copying link …') }}
			</ActionText>
			<ActionText v-if="showCopySubscriptionLinkSuccess">
				<template #icon>
					<LinkVariant :size="20" decorative />
				</template>
				{{ $t('calendar', 'Copied link') }}
			</ActionText>
			<ActionText v-if="showCopySubscriptionLinkError">
				<template #icon>
					<LinkVariant :size="20" decorative />
				</template>
				{{ $t('calendar', 'Could not copy link') }}
			</ActionText>

			<ActionLink target="_blank"
				:href="downloadUrl">
				<template #icon>
					<Download :size="20" decorative />
				</template>
				{{ $t('calendar', 'Export') }}
			</ActionLink>
		</template>
	</AppNavigationItem>
</template>

<script>
import {
	NcAvatar as Avatar,
	NcActionButton as ActionButton,
	NcActionLink as ActionLink,
	NcActionText as ActionText,
	NcAppNavigationIconBullet as AppNavigationIconBullet,
	NcAppNavigationItem as AppNavigationItem,
} from '@nextcloud/vue'
import {
	generateRemoteUrl,
} from '@nextcloud/router'
import {
	showSuccess,
	showError,
} from '@nextcloud/dialogs'

import Download from 'vue-material-design-icons/Download.vue'
import LinkVariant from 'vue-material-design-icons/LinkVariant.vue'

export default {
	name: 'PublicCalendarListItem',
	components: {
		Avatar,
		ActionButton,
		ActionLink,
		ActionText,
		AppNavigationIconBullet,
		AppNavigationItem,
		Download,
		LinkVariant,
	},
	props: {
		calendar: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			// copy subscription link:
			showCopySubscriptionLinkLabel: true,
			showCopySubscriptionLinkSpinner: false,
			showCopySubscriptionLinkSuccess: false,
			showCopySubscriptionLinkError: false,
			// Status of actions menu:
			menuOpen: false,
		}
	},
	computed: {
		/**
		 * Download url of the calendar
		 *
		 * @return {string}
		 */
		downloadUrl() {
			return this.calendar.url + '?export'
		},
		/**
		 * TODO: this should use principals and principal.userId
		 *
		 * @return {string}
		 */
		owner() {
			const lastIndex = this.calendar.owner.lastIndexOf('dav/principals/users/')
			if (lastIndex === -1) {
				return null
			}

			// 'dav/principals/users/'.length => 21
			const userId = this.calendar.owner.slice(lastIndex + 21)
			if (userId.endsWith('/')) {
				return userId.slice(0, -1)
			}

			return userId
		},
	},
	methods: {
		async copySubscriptionLink() {
			this.menuOpen = true
			this.showCopySubscriptionLinkLabel = false
			this.showCopySubscriptionLinkSpinner = true
			this.showCopySubscriptionLinkSuccess = false
			this.showCopySubscriptionLinkError = false

			const rootURL = generateRemoteUrl('dav')
			const url = new URL(this.calendar.url + '?export', rootURL)

			url.protocol = 'webcal:'

			// copy link for calendar to clipboard
			try {
				await navigator.clipboard.writeText(url)
				this.menuOpen = true
				this.showCopySubscriptionLinkLabel = false
				this.showCopySubscriptionLinkSpinner = false
				this.showCopySubscriptionLinkSuccess = true
				this.showCopySubscriptionLinkError = false

				showSuccess(this.$t('calendar', 'Calendar link copied to clipboard.'))
			} catch (error) {
				console.debug(error)
				this.menuOpen = true
				this.showCopySubscriptionLinkLabel = false
				this.showCopySubscriptionLinkSpinner = false
				this.showCopySubscriptionLinkSuccess = false
				this.showCopySubscriptionLinkError = true

				showError(this.$t('calendar', 'Calendar link could not be copied to clipboard.'))
			} finally {
				setTimeout(() => {
					this.showCopySubscriptionLinkLabel = true
					this.showCopySubscriptionLinkSpinner = false
					this.showCopySubscriptionLinkSuccess = false
					this.showCopySubscriptionLinkError = false
				}, 2000)
			}
		},
	},
}
</script>
