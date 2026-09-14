<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { CalendarInterface } from '@/types/calendar.ts'

import HttpClient from '@nextcloud/axios'
import {
	showError,
	showSuccess,
} from '@nextcloud/dialogs'
import { t } from '@nextcloud/l10n'
import {
	generateRemoteUrl,
	generateUrl,
	linkTo,
} from '@nextcloud/router'
import { NcActionButton, NcActionInput, NcActions, NcActionText } from '@nextcloud/vue'
import { computed, ref } from 'vue'
import CalendarBlank from 'vue-material-design-icons/CalendarBlankOutline.vue'
import CodeBrackets from 'vue-material-design-icons/CodeBrackets.vue'
import ContentCopy from 'vue-material-design-icons/ContentCopy.vue'
import Email from 'vue-material-design-icons/EmailOutline.vue'
import LinkIcon from 'vue-material-design-icons/Link.vue'
import PlusIcon from 'vue-material-design-icons/Plus.vue'
import Delete from 'vue-material-design-icons/TrashCanOutline.vue'
import useCalendarsStore from '@/store/calendars.js'
import logger from '@/utils/logger.js'

const props = defineProps<{
	calendar: CalendarInterface
}>()

const calendarsStore = useCalendarsStore()

// is the calendar being published right now?
const publishingCalendar = ref(false)
// Send email action
const showEMailLabel = ref(true)
const showEMailInput = ref(false)
const showEMailSending = ref(false)
// copy public link:
const showCopyPublicLinkLabel = ref(true)
const showCopyPublicLinkSpinner = ref(false)
// copy subscription link:
const showCopySubscriptionLinkLabel = ref(true)
const showCopySubscriptionLinkSpinner = ref(false)
const showCopySubscriptionLinkSuccess = ref(false)
const showCopySubscriptionLinkError = ref(false)
// copy embed code:
const showCopyEmbedCodeLinkLabel = ref(true)
const showCopyEmbedCodeLinkSpinner = ref(false)
const showCopyEmbedCodeLinkSuccess = ref(false)
const showCopyEmbedCodeLinkError = ref(false)
// delete public link
const unpublishingCalendar = ref(false)
// Status of actions menu:
const menuOpen = ref(false)

const isPublished = computed<boolean>(() => props.calendar.publishURL !== null)

async function publishCalendar(): Promise<void> {
	publishingCalendar.value = true

	try {
		await calendarsStore.publishCalendar({ calendar: props.calendar })
	} catch (error) {
		logger.debug(error)
		showError(t('calendar', 'An error occurred, unable to publish calendar.'))
	} finally {
		publishingCalendar.value = false
	}
}

function openEMailLinkInput(): void {
	showEMailLabel.value = false
	showEMailInput.value = true
	showEMailSending.value = false
}

async function sendLinkViaEMail(event: SubmitEvent): Promise<void> {
	showEMailLabel.value = false
	showEMailInput.value = false
	showEMailSending.value = true

	const emailAddress = (event.target as HTMLElement).querySelector<HTMLInputElement>('input[type=text]')!.value
	try {
		const url = [
			linkTo('calendar', 'index.php'),
			'v1/public/sendmail',
		].join('/')
		await HttpClient.post(url, {
			recipient: emailAddress,
			token: props.calendar.publishURL!.split('/').slice(-1)[0],
		})
	} catch (error) {
		logger.error(error)
		showError(t('calendar', 'An error occurred, unable to send email.'))
	} finally {
		showEMailLabel.value = true
		showEMailInput.value = false
		showEMailSending.value = false
	}
}

async function copyPublicLink(): Promise<void> {
	showCopyPublicLinkLabel.value = false
	showCopyPublicLinkSpinner.value = true

	const rootURL = generateRemoteUrl('dav')
	const token = props.calendar.publishURL!.split('/').slice(-1)[0]
	const url = new URL(generateUrl('apps/calendar') + '/p/' + token, rootURL)

	// copy link for calendar to clipboard
	try {
		await navigator.clipboard.writeText(url.toString())
		showSuccess(t('calendar', 'Calendar link copied to clipboard.'))
	} catch (error) {
		logger.debug(error)
		showError(t('calendar', 'Calendar link could not be copied to clipboard.'))
	} finally {
		showCopyPublicLinkLabel.value = true
		showCopyPublicLinkSpinner.value = false
	}
}

async function copySubscriptionLink(): Promise<void> {
	menuOpen.value = true
	showCopySubscriptionLinkLabel.value = false
	showCopySubscriptionLinkSpinner.value = true
	showCopySubscriptionLinkSuccess.value = false
	showCopySubscriptionLinkError.value = false

	const rootURL = generateRemoteUrl('dav')
	const url = new URL(props.calendar.publishURL + '?export', rootURL)

	// copy link for calendar to clipboard
	try {
		await navigator.clipboard.writeText(url.toString())
		menuOpen.value = true
		showCopySubscriptionLinkLabel.value = false
		showCopySubscriptionLinkSpinner.value = false
		showCopySubscriptionLinkSuccess.value = true
		showCopySubscriptionLinkError.value = false

		showSuccess(t('calendar', 'Calendar link copied to clipboard.'))
	} catch (error) {
		logger.debug(error)
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

async function copyEmbedCode(): Promise<void> {
	menuOpen.value = true
	showCopyEmbedCodeLinkLabel.value = false
	showCopyEmbedCodeLinkSpinner.value = true
	showCopyEmbedCodeLinkSuccess.value = false
	showCopyEmbedCodeLinkError.value = false

	const rootURL = generateRemoteUrl('dav')
	const token = props.calendar.publishURL!.split('/').slice(-1)[0]
	const url = new URL(generateUrl('apps/calendar') + '/embed/' + token, rootURL)

	const code = '<iframe width="400" height="215" src="' + url + '"></iframe>'

	// copy link for calendar to clipboard
	try {
		await navigator.clipboard.writeText(code)
		menuOpen.value = true
		showCopyEmbedCodeLinkLabel.value = false
		showCopyEmbedCodeLinkSpinner.value = false
		showCopyEmbedCodeLinkSuccess.value = true
		showCopyEmbedCodeLinkError.value = false

		showSuccess(t('calendar', 'Embed code copied to clipboard.'))
	} catch (error) {
		logger.debug(error)
		menuOpen.value = true
		showCopyEmbedCodeLinkLabel.value = false
		showCopyEmbedCodeLinkSpinner.value = false
		showCopyEmbedCodeLinkSuccess.value = false
		showCopyEmbedCodeLinkError.value = true

		showError(t('calendar', 'Embed code could not be copied to clipboard.'))
	} finally {
		setTimeout(() => {
			showCopyEmbedCodeLinkLabel.value = true
			showCopyEmbedCodeLinkSpinner.value = false
			showCopyEmbedCodeLinkSuccess.value = false
			showCopyEmbedCodeLinkError.value = false
		}, 2000)
	}
}

async function unpublishCalendar(): Promise<void> {
	unpublishingCalendar.value = true

	const calendar = props.calendar
	try {
		await calendarsStore.unpublishCalendar({ calendar })
		unpublishingCalendar.value = false
	} catch (error) {
		logger.debug(error)
		unpublishingCalendar.value = false
		showError(t('calendar', 'Unpublishing calendar failed'))
	}
}
</script>

<template>
	<div class="publish-calendar">
		<div class="publish-calendar__icon">
			<LinkIcon :size="20" />
		</div>

		<p class="publish-calendar__label">
			{{ t('calendar', 'Share link') }}
		</p>

		<template v-if="isPublished">
			<NcActions>
				<NcActionButton @click.prevent.stop="copyPublicLink">
					<template #icon>
						<ContentCopy :size="20" decorative />
					</template>
					{{ t('calendar', 'Copy public link') }}
				</NcActionButton>
			</NcActions>

			<NcActions>
				<NcActionButton
					v-if="showEMailLabel"
					@click.prevent.stop="openEMailLinkInput">
					<template #icon>
						<Email :size="20" decorative />
					</template>
					{{ t('calendar', 'Send link to calendar via email') }}
				</NcActionButton>
				<NcActionInput
					v-if="showEMailInput"
					@submit.prevent.stop="sendLinkViaEMail">
					<template #icon>
						<Email :size="20" decorative />
					</template>
					{{ t('calendar', 'Enter one address') }}
				</NcActionInput>
				<NcActionText
					v-if="showEMailSending"
					icon="icon-loading-small">
					<!-- eslint-disable-next-line no-irregular-whitespace -->
					{{ t('calendar', 'Sending email …') }}
				</NcActionText>

				<NcActionButton
					v-if="showCopySubscriptionLinkLabel"
					@click.prevent.stop="copySubscriptionLink">
					<template #icon>
						<CalendarBlank :size="20" decorative />
					</template>
					{{ t('calendar', 'Copy subscription link') }}
				</NcActionButton>
				<NcActionText
					v-if="showCopySubscriptionLinkSpinner"
					icon="icon-loading-small">
					<!-- eslint-disable-next-line no-irregular-whitespace -->
					{{ t('calendar', 'Copying link …') }}
				</NcActionText>
				<NcActionText v-if="showCopySubscriptionLinkSuccess">
					<template #icon>
						<CalendarBlank :size="20" decorative />
					</template>
					{{ t('calendar', 'Copied link') }}
				</NcActionText>
				<NcActionText v-if="showCopySubscriptionLinkError">
					<template #icon>
						<CalendarBlank :size="20" decorative />
					</template>
					{{ t('calendar', 'Could not copy link') }}
				</NcActionText>

				<NcActionButton
					v-if="showCopyEmbedCodeLinkLabel"
					@click.prevent.stop="copyEmbedCode">
					<template #icon>
						<CodeBrackets :size="20" decorative />
					</template>
					{{ t('calendar', 'Copy embedding code') }}
				</NcActionButton>
				<NcActionText
					v-if="showCopyEmbedCodeLinkSpinner"
					icon="icon-loading-small">
					<!-- eslint-disable-next-line no-irregular-whitespace -->
					{{ t('calendar', 'Copying code …') }}
				</NcActionText>
				<NcActionText v-if="showCopyEmbedCodeLinkSuccess">
					<template #icon>
						<CodeBrackets :size="20" decorative />
					</template>
					{{ t('calendar', 'Copied code') }}
				</NcActionText>
				<NcActionText v-if="showCopyEmbedCodeLinkError">
					<template #icon>
						<CodeBrackets :size="20" decorative />
					</template>
					{{ t('calendar', 'Could not copy code') }}
				</NcActionText>

				<NcActionButton
					v-if="!unpublishingCalendar"
					@click.prevent.stop="unpublishCalendar">
					<template #icon>
						<Delete :size="20" decorative />
					</template>
					{{ t('calendar', 'Delete share link') }}
				</NcActionButton>
				<NcActionText
					v-if="unpublishingCalendar"
					icon="icon-loading-small">
					<!-- eslint-disable-next-line no-irregular-whitespace -->
					{{ t('calendar', 'Deleting share link …') }}
				</NcActionText>
			</NcActions>
		</template>
		<NcActions v-else>
			<NcActionButton
				aria-label="t('calendar', 'Share link')"
				:disabled="publishingCalendar"
				@click.prevent.stop="publishCalendar">
				<template #icon>
					<PlusIcon :size="20" />
				</template>
			</NcActionButton>
		</NcActions>
	</div>
</template>

<style lang="scss" scoped>
.publish-calendar {
	display: flex;
	align-items: center;
	gap: 10px;

	&__icon {
		display: flex;
		width: 32px;
		height: 32px;
		border-radius: 16px;
		color: white;
		background-color: var(--color-primary-element);
		align-items: center;
		justify-content: center;
	}

	&__label {
		flex: 1 auto;
	}
}
</style>
