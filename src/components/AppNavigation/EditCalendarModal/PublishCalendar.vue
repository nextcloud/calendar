<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="publish-calendar">
		<div class="publish-calendar__icon">
			<LinkIcon :size="20" />
		</div>

		<p class="publish-calendar__label">
			{{ $t('calendar', 'Share link') }}
		</p>

		<template v-if="isPublished">
			<NcActions>
				<NcActionButton @click.prevent.stop="copyPublicLink">
					<template #icon>
						<ContentCopy :size="20" decorative />
					</template>
					{{ $t('calendar', 'Copy public link') }}
				</NcActionButton>
			</NcActions>

			<NcActions>
				<NcActionButton v-if="showEMailLabel"
					@click.prevent.stop="openEMailLinkInput">
					<template #icon>
						<Email :size="20" decorative />
					</template>
					{{ $t('calendar', 'Send link to calendar via email') }}
				</NcActionButton>
				<NcActionInput v-if="showEMailInput"
					@submit.prevent.stop="sendLinkViaEMail">
					<template #icon>
						<Email :size="20" decorative />
					</template>
					{{ $t('calendar', 'Enter one address') }}
				</NcActionInput>
				<NcActionText v-if="showEMailSending"
					icon="icon-loading-small">
					<!-- eslint-disable-next-line no-irregular-whitespace -->
					{{ $t('calendar', 'Sending email …') }}
				</NcActionText>

				<NcActionButton v-if="showCopySubscriptionLinkLabel"
					@click.prevent.stop="copySubscriptionLink">
					<template #icon>
						<CalendarBlank :size="20" decorative />
					</template>
					{{ $t('calendar', 'Copy subscription link') }}
				</NcActionButton>
				<NcActionText v-if="showCopySubscriptionLinkSpinner"
					icon="icon-loading-small">
					<!-- eslint-disable-next-line no-irregular-whitespace -->
					{{ $t('calendar', 'Copying link …') }}
				</NcActionText>
				<NcActionText v-if="showCopySubscriptionLinkSuccess">
					<template #icon>
						<CalendarBlank :size="20" decorative />
					</template>
					{{ $t('calendar', 'Copied link') }}
				</NcActionText>
				<NcActionText v-if="showCopySubscriptionLinkError">
					<template #icon>
						<CalendarBlank :size="20" decorative />
					</template>
					{{ $t('calendar', 'Could not copy link') }}
				</NcActionText>

				<NcActionButton v-if="showCopyEmbedCodeLinkLabel"
					@click.prevent.stop="copyEmbedCode">
					<template #icon>
						<CodeBrackets :size="20" decorative />
					</template>
					{{ $t('calendar', 'Copy embedding code') }}
				</NcActionButton>
				<NcActionText v-if="showCopyEmbedCodeLinkSpinner"
					icon="icon-loading-small">
					<!-- eslint-disable-next-line no-irregular-whitespace -->
					{{ $t('calendar', 'Copying code …') }}
				</NcActionText>
				<NcActionText v-if="showCopyEmbedCodeLinkSuccess">
					<template #icon>
						<CodeBrackets :size="20" decorative />
					</template>
					{{ $t('calendar', 'Copied code') }}
				</NcActionText>
				<NcActionText v-if="showCopyEmbedCodeLinkError">
					<template #icon>
						<CodeBrackets :size="20" decorative />
					</template>
					{{ $t('calendar', 'Could not copy code') }}
				</NcActionText>

				<NcActionButton v-if="!unpublishingCalendar"
					@click.prevent.stop="unpublishCalendar">
					<template #icon>
						<Delete :size="20" decorative />
					</template>
					{{ $t('calendar', 'Delete share link') }}
				</NcActionButton>
				<NcActionText v-if="unpublishingCalendar"
					icon="icon-loading-small">
					<!-- eslint-disable-next-line no-irregular-whitespace -->
					{{ $t('calendar', 'Deleting share link …') }}
				</NcActionText>
			</NcActions>
		</template>
		<NcActions v-else>
			<NcActionButton aria-label="$t('calendar', 'Share link')"
				:disabled="publishingCalendar"
				@click.prevent.stop="publishCalendar">
				<template #icon>
					<PlusIcon :size="20" />
				</template>
			</NcActionButton>
		</NcActions>
	</div>
</template>

<script>
import { NcActions, NcActionButton, NcActionInput, NcActionText } from '@nextcloud/vue'
import ClickOutside from 'vue-click-outside'
import {
	generateRemoteUrl,
	generateUrl,
	linkTo,
} from '@nextcloud/router'
import {
	showSuccess,
	showError,
} from '@nextcloud/dialogs'
import HttpClient from '@nextcloud/axios'

import CalendarBlank from 'vue-material-design-icons/CalendarBlank.vue'
import ContentCopy from 'vue-material-design-icons/ContentCopy.vue'
import CodeBrackets from 'vue-material-design-icons/CodeBrackets.vue'
import Delete from 'vue-material-design-icons/Delete.vue'
import Email from 'vue-material-design-icons/Email.vue'
import LinkIcon from 'vue-material-design-icons/Link.vue'
import PlusIcon from 'vue-material-design-icons/Plus.vue'
import { mapStores } from 'pinia'
import useCalendarsStore from '../../../store/calendars.js'

export default {
	name: 'PublishCalendar',
	components: {
		NcActions,
		NcActionButton,
		NcActionInput,
		NcActionText,
		CalendarBlank,
		ContentCopy,
		CodeBrackets,
		Delete,
		Email,
		LinkIcon,
		PlusIcon,
	},
	directives: {
		ClickOutside,
	},
	props: {
		calendar: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			// is the calendar being published right now?
			publishingCalendar: false,
			// Send email action
			showEMailLabel: true,
			showEMailInput: false,
			showEMailSending: false,
			// copy public link:
			showCopyPublicLinkLabel: true,
			showCopyPublicLinkSpinner: false,
			// copy subscription link:
			showCopySubscriptionLinkLabel: true,
			showCopySubscriptionLinkSpinner: false,
			showCopySubscriptionLinkSuccess: false,
			showCopySubscriptionLinkError: false,
			// copy embed code:
			showCopyEmbedCodeLinkLabel: true,
			showCopyEmbedCodeLinkSpinner: false,
			showCopyEmbedCodeLinkSuccess: false,
			showCopyEmbedCodeLinkError: false,
			// delete public link
			unpublishingCalendar: false,
			// Status of actions menu:
			menuOpen: false,
		}
	},
	computed: {
		...mapStores(useCalendarsStore),
		isPublished() {
			return this.calendar.publishURL !== null
		},
	},
	methods: {
		async publishCalendar() {
			this.publishingCalendar = true

			try {
				await this.calendarsStore.publishCalendar({ calendar: this.calendar })
			} catch (error) {
				console.debug(error)
				showError(this.$t('calendar', 'An error occurred, unable to publish calendar.'))
			} finally {
				this.publishingCalendar = false
			}
		},
		openEMailLinkInput() {
			this.showEMailLabel = false
			this.showEMailInput = true
			this.showEMailSending = false
		},
		async sendLinkViaEMail(event) {
			this.showEMailLabel = false
			this.showEMailInput = false
			this.showEMailSending = true

			const emailAddress = event.target.querySelector('input[type=text]').value
			try {
				const url = [
					linkTo('calendar', 'index.php'),
					'v1/public/sendmail',
				].join('/')
				await HttpClient.post(url, {
					recipient: emailAddress,
					token: this.calendar.publishURL.split('/').slice(-1)[0],
					calendarName: this.calendar.displayName,
				})
			} catch (error) {
				console.error(error)
				showError(this.$t('calendar', 'An error occurred, unable to send email.'))
			} finally {
				this.showEMailLabel = true
				this.showEMailInput = false
				this.showEMailSending = false
			}
		},
		async copyPublicLink() {
			this.showCopyPublicLinkLabel = false
			this.showCopyPublicLinkSpinner = true

			const rootURL = generateRemoteUrl('dav')
			const token = this.calendar.publishURL.split('/').slice(-1)[0]
			const url = new URL(generateUrl('apps/calendar') + '/p/' + token, rootURL)

			// copy link for calendar to clipboard
			try {
				await navigator.clipboard.writeText(url)
				showSuccess(this.$t('calendar', 'Calendar link copied to clipboard.'))
			} catch (error) {
				console.debug(error)
				showError(this.$t('calendar', 'Calendar link could not be copied to clipboard.'))
			} finally {
				this.showCopyPublicLinkLabel = true
				this.showCopyPublicLinkSpinner = false
			}
		},
		async copySubscriptionLink() {
			this.menuOpen = true
			this.showCopySubscriptionLinkLabel = false
			this.showCopySubscriptionLinkSpinner = true
			this.showCopySubscriptionLinkSuccess = false
			this.showCopySubscriptionLinkError = false

			const rootURL = generateRemoteUrl('dav')
			const url = new URL(this.calendar.publishURL + '?export', rootURL)

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
		async copyEmbedCode() {
			this.menuOpen = true
			this.showCopyEmbedCodeLinkLabel = false
			this.showCopyEmbedCodeLinkSpinner = true
			this.showCopyEmbedCodeLinkSuccess = false
			this.showCopyEmbedCodeLinkError = false

			const rootURL = generateRemoteUrl('dav')
			const token = this.calendar.publishURL.split('/').slice(-1)[0]
			const url = new URL(generateUrl('apps/calendar') + '/embed/' + token, rootURL)

			const code = '<iframe width="400" height="215" src="' + url + '"></iframe>'

			// copy link for calendar to clipboard
			try {
				await navigator.clipboard.writeText(code)
				this.menuOpen = true
				this.showCopyEmbedCodeLinkLabel = false
				this.showCopyEmbedCodeLinkSpinner = false
				this.showCopyEmbedCodeLinkSuccess = true
				this.showCopyEmbedCodeLinkError = false

				showSuccess(this.$t('calendar', 'Embed code copied to clipboard.'))
			} catch (error) {
				console.debug(error)
				this.menuOpen = true
				this.showCopyEmbedCodeLinkLabel = false
				this.showCopyEmbedCodeLinkSpinner = false
				this.showCopyEmbedCodeLinkSuccess = false
				this.showCopyEmbedCodeLinkError = true

				showError(this.$t('calendar', 'Embed code could not be copied to clipboard.'))
			} finally {
				setTimeout(() => {
					this.showCopyEmbedCodeLinkLabel = true
					this.showCopyEmbedCodeLinkSpinner = false
					this.showCopyEmbedCodeLinkSuccess = false
					this.showCopyEmbedCodeLinkError = false
				}, 2000)
			}
		},
		async unpublishCalendar() {
			this.unpublishingCalendar = true

			const calendar = this.calendar
			try {
				await this.calendarsStore.unpublishCalendar({ calendar })
				this.unpublishingCalendar = false
			} catch (error) {
				console.debug(error)
				this.unpublishingCalendar = false
				showError(this.$t('calendar', 'Unpublishing calendar failed'))
			}
		},

	},
}
</script>

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
