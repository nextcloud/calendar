<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  - @author Georg Ehrke <oc.list@georgehrke.com>
  -
  - @license GNU AGPL version 3 or any later version
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
	<AppNavigationItem
		:title="$t('calendar', 'Share link')"
		:menu-open.sync="menuOpen">
		<template slot="icon">
			<div :class="{published: isPublished, 'icon-public': !isPublished, 'icon-public-white': isPublished}" class="avatar" />
		</template>

		<template slot="actions" v-if="!isPublished">
			<ActionButton
				v-if="!publishingCalendar"
				icon="icon-add"
				@click.prevent.stop="publishCalendar">
				{{ $t('calendar', 'Publish calendar') }}
			</ActionButton>
			<ActionButton
				v-if="publishingCalendar"
				icon="icon-loading-small"
				:disabled="true">
				{{ $t('calendar', 'Publishing calendar') }}
			</ActionButton>
		</template>

		<template slot="counter" v-if="isPublished">
			<Actions>
				<ActionButton
					icon="icon-clippy"
					@click.prevent.stop="copyPublicLink">
					{{ $t('calendar', 'Copy public link') }}
				</ActionButton>
			</Actions>
		</template>
		<template slot="actions" v-if="isPublished">
			<ActionButton
				v-if="showEMailLabel"
				icon="icon-mail"
				@click.prevent.stop="openEMailLinkInput">
				{{ $t('calendar', 'Send link to calendar via email')}}
			</ActionButton>
			<ActionInput
				v-if="showEMailInput"
				icon="icon-mail"
				@submit.prevent.stop="sendLinkViaEMail" />
			<ActionText
				v-if="showEMailSending"
				icon="icon-loading-small">
				{{ $t('calendar', 'Sending email ...') }}
			</ActionText>

			<ActionButton
				v-if="showCopySubscriptionLinkLabel"
				icon="icon-calendar-dark"
				@click.prevent.stop="copySubscriptionLink">
				{{ $t('calendar', 'Copy subscription link') }}
			</ActionButton>
			<ActionText
				v-if="showCopySubscriptionLinkSpinner"
				icon="icon-loading-small">
				{{ $t('calendar', 'Copying link ...') }}
			</ActionText>
			<ActionText
				v-if="showCopySubscriptionLinkSuccess"
				icon="icon-calendar-dark">
				{{ $t('calendar', 'Copied link') }}
			</ActionText>
			<ActionText
				v-if="showCopySubscriptionLinkError"
				icon="icon-calendar-dark">
				{{ $t('calendar', 'Could not copy link') }}
			</ActionText>

			<ActionButton
				v-if="showCopyEmbedCodeLinkLabel"
				icon="icon-embed"
				@click.prevent.stop="copyEmbedCode">
				{{ $t('calendar', 'Copy embedding code') }}
			</ActionButton>
			<ActionText
				v-if="showCopyEmbedCodeLinkSpinner"
				icon="icon-loading-small">
				{{ $t('calendar', 'Copying code ...') }}
			</ActionText>
			<ActionText
				v-if="showCopyEmbedCodeLinkSuccess"
				icon="icon-embed">
				{{ $t('calendar', 'Copied code') }}
			</ActionText>
			<ActionText
				v-if="showCopyEmbedCodeLinkError"
				icon="icon-embed">
				{{ $t('calendar', 'Could not copy code') }}
			</ActionText>

			<ActionButton
				v-if="!unpublishingCalendar"
				icon="icon-delete"
				@click.prevent.stop="unpublishCalendar">
				{{ $t('calendar', 'Delete share link') }}
			</ActionButton>
			<ActionText
				v-if="unpublishingCalendar"
				icon="icon-loading-small">
				{{ $t('calendar', 'Deleting share link ...') }}
			</ActionText>
		</template>
	</AppNavigationItem>
</template>

<script>
import {
	ActionButton,
	ActionInput,
	ActionText,
	AppNavigationItem
} from '@nextcloud/vue'
import ClickOutside from 'vue-click-outside'
import {
	generateRemoteUrl,
	linkTo
} from '@nextcloud/router'

export default {
	name: 'CalendarListItemSharingPublishItem',
	components: {
		ActionButton,
		ActionInput,
		ActionText,
		AppNavigationItem
	},
	directives: {
		ClickOutside
	},
	props: {
		calendar: {
			type: Object,
			required: true
		}
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
		isPublished() {
			return this.calendar.publishURL !== null
		},
	},
	methods: {
		publishCalendar() {
			this.publishingCalendar = true

			this.$store.dispatch('publishCalendar', { calendar: this.calendar })
				.then(() => {
					this.publishingCalendar = false
				})
				.catch((error) => {
					console.debug(error)
					this.$toast.error(this.$t('calendar', 'An error occurred, unable to publish calendar.'))
					this.publishingCalendar = false
				})
		},
		openEMailLinkInput() {
			this.showEMailLabel = false
			this.showEMailInput = true
			this.showEMailSending = false
		},
		sendLinkViaEMail(event) {
			this.showEMailLabel = false
			this.showEMailInput = false
			this.showEMailSending = true

			// const emailAddress = event.target.querySelector('input[type=text]').value
			//
			// // HttpClient.post
			// event.stopPropagation()
			//
			// this.sendingEMailLink = true
			// this.showEMailLinkInput = false
			//
			// const value = event.target.querySelector('input[type=text]').value
			// console.debug(value)
		},
		copyPublicLink() {
			this.showCopyPublicLinkLabel = false
			this.showCopyPublicLinkSpinner = true

			const rootURL = generateRemoteUrl('dav')
			const token = this.calendar.publishURL.split('/').slice(-1)[0]
			const url = new URL(linkTo('calendar', 'index.php') + '/p/' + token, rootURL)

			// copy link for calendar to clipboard
			this.$copyText(url)
				.then(e => {
					this.showCopyPublicLinkLabel = true
					this.showCopyPublicLinkSpinner = false

					this.$toast.success(this.$t('calendar', 'Calendar link copied to clipboard.'))
				})
				.catch(e => {
					this.showCopyPublicLinkLabel = true
					this.showCopyPublicLinkSpinner = false

					this.$toast.error(this.$t('calendar', 'Calendar link could not be copied to clipboard.'))
				})
		},
		copySubscriptionLink() {
			this.menuOpen = true
			this.showCopySubscriptionLinkLabel = false
			this.showCopySubscriptionLinkSpinner = true
			this.showCopySubscriptionLinkSuccess = false
			this.showCopySubscriptionLinkError = false

			const rootURL = generateRemoteUrl('dav')
			const url = new URL(this.calendar.publishURL + '?export', rootURL)

			// copy link for calendar to clipboard
			this.$copyText(url)
				.then(e => {
					this.menuOpen = true
					this.showCopySubscriptionLinkLabel = false
					this.showCopySubscriptionLinkSpinner = false
					this.showCopySubscriptionLinkSuccess = true
					this.showCopySubscriptionLinkError = false

					this.$toast.success(this.$t('calendar', 'Calendar link copied to clipboard.'))
				})
				.catch(e => {
					this.menuOpen = true
					this.showCopySubscriptionLinkLabel = false
					this.showCopySubscriptionLinkSpinner = false
					this.showCopySubscriptionLinkSuccess = false
					this.showCopySubscriptionLinkError = true

					this.$toast.error(this.$t('calendar', 'Calendar link could not be copied to clipboard.'))
				}).then(() => {
					setTimeout(() => {
						this.showCopySubscriptionLinkLabel = true
						this.showCopySubscriptionLinkSpinner = false
						this.showCopySubscriptionLinkSuccess = false
						this.showCopySubscriptionLinkError = false
					}, 2000)
				})
		},
		copyEmbedCode() {
			this.menuOpen = true
			this.showCopyEmbedCodeLinkLabel = false
			this.showCopyEmbedCodeLinkSpinner = true
			this.showCopyEmbedCodeLinkSuccess = false
			this.showCopyEmbedCodeLinkError = false

			const rootURL = generateRemoteUrl('dav')
			const token = this.calendar.publishURL.split('/').slice(-1)[0]
			const url = new URL(linkTo('calendar', 'index.php') + '/e/' + token, rootURL)

			const code = '<iframe width="400" height="215" src="' + url + '"></iframe>'

			// copy link for calendar to clipboard
			this.$copyText(code)
				.then(e => {
					this.menuOpen = true
					this.showCopyEmbedCodeLinkLabel = false
					this.showCopyEmbedCodeLinkSpinner = false
					this.showCopyEmbedCodeLinkSuccess = true
					this.showCopyEmbedCodeLinkError = false

					this.$toast.success(this.$t('calendar', 'Embed code copied to clipboard.'))
				})
				.catch(e => {
					this.menuOpen = true
					this.showCopyEmbedCodeLinkLabel = false
					this.showCopyEmbedCodeLinkSpinner = false
					this.showCopyEmbedCodeLinkSuccess = false
					this.showCopyEmbedCodeLinkError = true

					this.$toast.error(this.$t('calendar', 'Embed code could not be copied to clipboard.'))
				}).then(() => {
					setTimeout(() => {
						this.showCopyEmbedCodeLinkLabel = true
						this.showCopyEmbedCodeLinkSpinner = false
						this.showCopyEmbedCodeLinkSuccess = false
						this.showCopyEmbedCodeLinkError = false
					}, 2000)
				})
		},
		unpublishCalendar() {
			this.unpublishingCalendar = true

			const calendar = this.calendar
			this.$store.dispatch('unpublishCalendar', { calendar }).then(() => {
				this.unpublishingCalendar = false
			}).catch((e) => {
				this.unpublishingCalendar = false
				this.$toast.error(this.$t('calendar', 'Unpublishing calendar failed'))
			})
		}

	}
}
</script>
