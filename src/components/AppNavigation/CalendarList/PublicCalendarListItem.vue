<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { CalendarInterface } from '@/types/calendar.ts'

import { showError, showSuccess } from '@nextcloud/dialogs'
import { t } from '@nextcloud/l10n'
import { generateRemoteUrl } from '@nextcloud/router'
import {
	NcActionButton as ActionButton,
	NcActionLink as ActionLink,
	NcActionText as ActionText,
	NcAppNavigationIconBullet as AppNavigationIconBullet,
	NcAppNavigationItem as AppNavigationItem,
	NcAvatar as Avatar,
} from '@nextcloud/vue'
import { computed, ref } from 'vue'
import LinkIcon from 'vue-material-design-icons/Link.vue'
import Download from 'vue-material-design-icons/TrayArrowDown.vue'

const props = defineProps<{
	calendar: CalendarInterface
}>()

// copy subscription link:
const showCopySubscriptionLinkLabel = ref(true)
const showCopySubscriptionLinkSpinner = ref(false)
const showCopySubscriptionLinkSuccess = ref(false)
const showCopySubscriptionLinkError = ref(false)
// Status of actions menu:
const menuOpen = ref(false)

/**
 * Download url of the calendar
 */
const downloadUrl = computed<string>(() => props.calendar.url + '?export')

/**
 * TODO: this should use principals and principal.userId
 */
const owner = computed<string | null>(() => {
	const lastIndex = props.calendar.owner.lastIndexOf('dav/principals/users/')
	if (lastIndex === -1) {
		return null
	}

	// 'dav/principals/users/'.length => 21
	const userId = props.calendar.owner.slice(lastIndex + 21)
	if (userId.endsWith('/')) {
		return userId.slice(0, -1)
	}

	return userId
})

/**
 * Copies the webcal subscription link of this calendar to the clipboard
 */
async function copySubscriptionLink(): Promise<void> {
	menuOpen.value = true
	showCopySubscriptionLinkLabel.value = false
	showCopySubscriptionLinkSpinner.value = true
	showCopySubscriptionLinkSuccess.value = false
	showCopySubscriptionLinkError.value = false

	const rootURL = generateRemoteUrl('dav')
	const url = new URL(props.calendar.url + '?export', rootURL)

	url.protocol = 'webcal:'

	// copy link for calendar to clipboard
	try {
		await navigator.clipboard.writeText(url.href)
		menuOpen.value = true
		showCopySubscriptionLinkLabel.value = false
		showCopySubscriptionLinkSpinner.value = false
		showCopySubscriptionLinkSuccess.value = true
		showCopySubscriptionLinkError.value = false

		showSuccess(t('calendar', 'Calendar link copied to clipboard.'))
	} catch (error) {
		console.debug(error)
		menuOpen.value = true
		showCopySubscriptionLinkLabel.value = false
		showCopySubscriptionLinkSpinner.value = false
		showCopySubscriptionLinkSuccess.value = false
		showCopySubscriptionLinkError.value = true

		showError(t('calendar', 'Calendar link could not be copied to clipboard.'))
	} finally {
		setTimeout(() => {
			showCopySubscriptionLinkLabel.value = true
			showCopySubscriptionLinkSpinner.value = false
			showCopySubscriptionLinkSuccess.value = false
			showCopySubscriptionLinkError.value = false
		}, 2000)
	}
}
</script>

<template>
	<AppNavigationItem
		v-model:menuOpen="menuOpen"
		:loading="calendar.loading"
		:name="calendar.displayName || t('calendar', 'Untitled calendar')">
		<template #icon>
			<AppNavigationIconBullet :color="calendar.color" />
		</template>

		<template #counter>
			<Avatar
				:user="owner"
				:isGuest="true"
				:disableTooltip="true"
				:disableMenu="true" />
		</template>

		<template #actions>
			<ActionButton
				v-if="showCopySubscriptionLinkLabel"
				@click.prevent.stop="copySubscriptionLink">
				<template #icon>
					<LinkIcon :size="20" decorative />
				</template>
				{{ t('calendar', 'Copy subscription link') }}
			</ActionButton>
			<ActionText
				v-if="showCopySubscriptionLinkSpinner">
				<template #icon>
					<div class="icon icon-loading-small" />
				</template>
				{{ t('calendar', 'Copying link …') }}
			</ActionText>
			<ActionText v-if="showCopySubscriptionLinkSuccess">
				<template #icon>
					<LinkIcon :size="20" decorative />
				</template>
				{{ t('calendar', 'Copied link') }}
			</ActionText>
			<ActionText v-if="showCopySubscriptionLinkError">
				<template #icon>
					<LinkIcon :size="20" decorative />
				</template>
				{{ t('calendar', 'Could not copy link') }}
			</ActionText>

			<ActionLink
				target="_blank"
				:href="downloadUrl">
				<template #icon>
					<Download :size="20" decorative />
				</template>
				{{ t('calendar', 'Export') }}
			</ActionLink>
		</template>
	</AppNavigationItem>
</template>
