<template>
	<li>
		<div :class="{published: isPublished, 'icon-public': !isPublished, 'icon-public-white': isPublished}" class="avatar" />
		<span class="username">{{ label }}</span>
		<span class="sharingOptionsGroup">
			<a v-if="isPublished" :class="{'icon-clippy': !copyingShareLink, 'icon-loading-small': copyingShareLink}" href="#"
				class="icon icon-clippy" @click="copyPublicLink" />
			<div v-click-outside="closeMenu" v-if="isPublished" class="share-menu">
				<a href="#" class="icon icon-more" title="Copy public link"
					@click="toggleMenu" />
				<div :class="{open: menuOpen}" class="popovermenu">
					<popover-menu :menu="menu" />
				</div>
			</div>
			<div v-if="!isPublished" class="share-menu">
				<a :class="{hidden: publishingCalendar}" href="#" class="icon icon-add"
					@click="publishCalendar" />
				<a :class="{hidden: !publishingCalendar}" href="#" class="icon icon-loading-small" />
			</div>
		</span>
	</li>
</template>

<script>
import { PopoverMenu } from 'nextcloud-vue'
import ClickOutside from 'vue-click-outside'

export default {
	name: 'CalendarListItemSharingPublishItem',
	components: {
		PopoverMenu
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
			// Copy public link
			copyingShareLink: false,
			// Is the options menu open?
			menuOpen: false,
			// send sharing link as email
			showEMailLinkInput: false,
			sendingEMailLink: false,
			// Copy subscription link
			copyingSubscriptionLink: false,
			copiedSubscriptionLink: false,
			copySubscriptionLinkSuccess: false,
			// Copy embed code
			copyingEmbedCode: false,
			copiedEmbedCode: false,
			copyEmbedCodeSuccess: false,
			// unpublish
			unpublishingCalendar: false
		}
	},
	computed: {
		isPublished() {
			return this.calendar.publishURL !== null
		},
		label() {
			return t('calendar', 'Share link')
		},
		menu() {
			return [
				{
					text: this.sendingEMailLink
						? t('calendar', 'Sending email ...')
						: t('calendar', 'Email link'),
					icon: this.sendingEMailLink
						? 'icon-loading-small'
						: 'icon-mail',
					input: this.showEMailLinkInput ? 'text' : false,
					action: this.showEMailLinkInput ? this.sendLinkViaEMail : this.openEMailLinkInput,
					value: ''
				},
				{
					href: '#',
					icon: this.copyingSubscriptionLink
						? 'icon-loading-small'
						: 'icon-calendar-dark',
					text: !this.copiedSubscriptionLink
						? t('calendar', 'Copy subscription link')
						: this.copySubscriptionLinkSuccess
							? t('calendar', 'Copied')
							: t('calendar', 'Can not copy'),
					action: this.copySubscriptionLink
				},
				{
					href: '#',
					icon: this.copyingEmbedCode
						? 'icon-loading-small'
						: 'icon-embed',
					text: !this.copiedEmbedCode
						? t('calendar', 'Copy embed code')
						: this.copyEmbedCodeSuccess
							? t('calendar', 'Copied')
							: t('calendar', 'Can not copy'),
					action: this.copyEmbedCode
				},
				{
					text: this.unpublishingCalendar
						? t('calendar', 'Deleting share link ...')
						: t('calendar', 'Delete share link'),
					icon: this.unpublishingCalendar
						? 'icon-loading-small'
						: 'icon-delete',
					action: this.unpublishCalendar
				}
			]
		}
	},
	methods: {
		toggleMenu() {
			this.menuOpen = !this.menuOpen
		},
		closeMenu(event) {
			if (this.$el.querySelector('.share-menu').contains(event.target)) {
				return
			}

			this.menuOpen = false
			this.showEMailLinkInput = false
		},
		publishCalendar() {
			this.publishingCalendar = true

			const calendar = this.calendar
			this.$store.dispatch('publishCalendar', { calendar }).then(() => {
				this.publishingCalendar = false
			}).catch((e) => {
				this.publishingCalendar = false
				OC.Notification.showTemporary(t('calendar', 'Publishing calendar failed'))
			})
		},
		openEMailLinkInput() {
			event.stopPropagation()

			if (this.sendingEMailLink) {
				return
			}

			this.showEMailLinkInput = true
		},
		sendLinkViaEMail(event) {
			event.stopPropagation()

			this.sendingEMailLink = true
			this.showEMailLinkInput = false

			const value = event.target.querySelector('input[type=text]').value
			console.debug(value)
		},
		copyPublicLink() {
			// change to loading status
			this.copyLoading = true
			event.stopPropagation()

			const rootURL = OC.linkToRemote('dav')
			const token = this.calendar.publishURL.split('/').slice(-1)[0]
			const url = new URL(OC.linkTo('calendar', 'index.php') + '/p/' + token, rootURL)

			// copy link for calendar to clipboard
			this.$copyText(url)
				.then(e => {
					event.preventDefault()
					this.copySuccess = true
					this.copied = true
					// Notify calendar url was copied
					OC.Notification.showTemporary(t('calendar', 'Calendar link copied to clipboard'))
				}, e => {
					this.copySuccess = false
					this.copied = true
					OC.Notification.showTemporary(t('calendar', 'Calendar link was not copied to clipboard.'))
				}).then(() => {
					this.copyLoading = false
					setTimeout(() => {
						// stop loading status regardless of outcome
						this.copied = false
					}, 2000)
				})
		},
		copySubscriptionLink() {
			// change to loading status
			this.copyingSubscriptionLink = true
			event.stopPropagation()

			const rootURL = OC.linkToRemote('dav')
			const url = new URL(this.calendar.publishURL + '?export', rootURL)

			// copy link for calendar to clipboard
			this.$copyText(url)
				.then(e => {
					event.preventDefault()
					this.copySubscriptionLinkSuccess = true
					this.copiedSubscriptionLink = true
					// Notify calendar url was copied
					OC.Notification.showTemporary(t('calendar', 'Subscription link copied to clipboard'))
				}, e => {
					this.copySubscriptionLinkSuccess = false
					this.copiedSubscriptionLink = true
					OC.Notification.showTemporary(t('calendar', 'Subscription link was not copied to clipboard.'))
				}).then(() => {
					this.copyingSubscriptionLink = false
					setTimeout(() => {
						// stop loading status regardless of outcome
						this.copiedSubscriptionLink = false
					}, 2000)
				})
		},
		copyEmbedCode() {
			// change to loading status
			this.copyingEmbedCode = true
			event.stopPropagation()

			const rootURL = OC.linkToRemote('dav')
			const token = this.calendar.publishURL.split('/').slice(-1)[0]
			const url = new URL(OC.linkTo('calendar', 'index.php') + '/e/' + token, rootURL)

			const code = '<iframe width="400" height="215" src="' + url + '"></iframe>'

			// copy link for calendar to clipboard
			this.$copyText(code)
				.then(e => {
					event.preventDefault()
					this.copyEmbedCodeSuccess = true
					this.copiedEmbedCode = true
					// Notify calendar url was copied
					OC.Notification.showTemporary(t('calendar', 'Embed code copied to clipboard'))
				}, e => {
					this.copyEmbedCodeSuccess = false
					this.copiedEmbedCode = true
					OC.Notification.showTemporary(t('calendar', 'Embed code was not copied to clipboard.'))
				}).then(() => {
					this.copyingEmbedCode = false
					setTimeout(() => {
						// stop loading status regardless of outcome
						this.copiedEmbedCode = false
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
				OC.Notification.showTemporary(t('calendar', 'Unpublishing calendar failed'))
			})
		}

	}
}
</script>
