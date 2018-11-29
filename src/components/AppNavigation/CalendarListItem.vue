<template>
	<li v-click-outside="closeShareMenu" :class="{enabled: enabled, 'icon-loading-small': loading}" class="app-navigation-list-item">

		<div :style="{ backgroundColor: calendarColor }" class="app-navigation-entry-bullet" />

		<a :class="{selected: shareMenuOpen}" :title="displayName" href="#"
			@click="toggleEnabled">{{ displayName }}</a>

		<div class="app-navigation-entry-utils">
			<ul>
				<!-- share popovermenu -->
				<li v-if="showSharingIcon" :class="{'has-owner-avatar': isSharedWithMe, 'has-shared-label': (isShared || isPublished) && !isSharedWithMe}" class="app-navigation-entry-utils-menu-button">
					<button :class="{'icon-public': isPublished, 'icon-shared': !isPublished && isShared, 'icon-share': !isPublished && !isShared}" @click="toggleShareMenu" />
					<a v-if="(isShared || isPublished) && !isSharedWithMe" class="shared-label" @click="toggleShareMenu">{{ sharedLabel }}</a>
					<!-- TODO this needs a tooltip saying "shared with you by .... " -->
					<avatar v-if="isSharedWithMe && loadedOwnerPrincipal" :user="ownerUserId" :display-name="ownerDisplayname" />
					<div v-if="isSharedWithMe && !loadedOwnerPrincipal" class="icon icon-loading" />
				</li>

				<!-- more popovermenu -->
				<li v-click-outside="closeMoreMenu" class="app-navigation-entry-utils-menu-button">
					<button class="icon-more" @click="toggleMoreMenu" />
				</li>
			</ul>
		</div>

		<calendar-list-item-sharing v-if="shareMenuOpen" :calendar="calendar" />

		<div :class="{open: moreMenuOpen}" class="app-navigation-entry-menu popover-menu-container">
			<popover-menu :menu="moreMenu" />
		</div>
	</li>
</template>

<script>
import { Avatar, PopoverMenu } from 'nextcloud-vue'
import ClickOutside from 'vue-click-outside'
import CalendarListItemSharing from './CalendarListItemSharing.vue'

export default {
	name: 'CalendarListItem',
	components: {
		Avatar,
		CalendarListItemSharing,
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
	data: function() {
		return {
			shareMenuOpen: false,
			moreMenuOpen: false,
			// Edit button from menu
			editingName: false,
			savingName: false,
			editingColor: false,
			savingColor: false,
			// Copy button from menu
			copyLoading: false,
			copied: false,
			copySuccess: false,
			// Delete button
			deleteLoading: false
		}
	},
	computed: {
		displayName() {
			return this.calendar.displayName
		},
		calendarColor() {
			return this.enabled ? this.calendar.color : 'transparent'
		},
		enabled() {
			return this.calendar.enabled
		},
		loading() {
			return this.calendar.loading
		},
		showSharingIcon() {
			return this.calendar.canBeShared || this.calendar.canBePublished
		},
		canBeShared() {
			return this.calendar.canBeShared
		},
		isShared() {
			return !!this.calendar.shares.length
		},
		canBePublished() {
			return this.calendar.canBePublished
		},
		isPublished() {
			return !!this.calendar.publishURL
		},
		isSharedWithMe() {
			return this.calendar.isSharedWithMe
		},
		sharedLabel() {
			return t('calendar', 'Shared')
		},
		owner() {
			if (this.calendar.owner.indexOf('principal:principals/users/') === '0') {
				console.debug(this.calendar.owner.substr(27))
				return this.calendar.owner.substr(27)
			}

			return ''
		},
		loadedOwnerPrincipal() {
			console.debug(this.calendar.owner)
			console.debug(this.$store.getters.getPrincipalByUrl(this.calendar.owner))
			console.debug(this.$store.getters.getPrincipalByUrl(this.calendar.owner) !== undefined)
			return this.$store.getters.getPrincipalByUrl(this.calendar.owner) !== undefined
		},
		ownerUserId() {
			const principal = this.$store.getters.getPrincipalByUrl(this.calendar.owner)
			if (principal) {
				return principal.userId
			}

			return ''
		},
		ownerDisplayname() {
			const principal = this.$store.getters.getPrincipalByUrl(this.calendar.owner)
			if (principal) {
				return principal.displayname
			}

			return ''
		},
		moreMenu() {
			return [
				{
					text: this.savingName
						? t('calendar', 'Saving name ...')
						: t('calendar', 'Edit name'),
					icon: this.savingName
						? 'icon-loading-small'
						: 'icon-rename',
					input: this.editingName ? 'text' : false,
					action: this.editingName ? this.saveNameInput : this.openNameInput,
					value: this.calendar.displayName
				},
				{
					text: this.savingColor
						? t('calendar', 'Saving color ...')
						: t('calendar', 'Edit color'),
					icon: this.savingColor
						? 'icon-loading-small'
						: 'icon-edit', // TODO use color picker icon
					input: this.editingColor ? 'text' : false,
					action: this.editingColor ? this.saveColorInput : this.openColorInput,
					value: this.calendar.color
				},
				{
					href: this.calendar.url,
					icon: this.copyLoading ? 'icon-loading-small' : 'icon-clippy',
					text: !this.copied
						? t('calendar', 'Copy private link')
						: this.copySuccess
							? t('calendar', 'Copied')
							: t('calendar', 'Can not copy'),
					action: this.copyLink
				},
				{
					href: this.calendar.url + '?export',
					icon: 'icon-download',
					text: t('calendar', 'Download')
				},
				{
					text: this.deleteLoading
						? (this.calendar.isSharedWithMe ? t('calendar', 'Unsharing from me ...') : t('calendar', 'Deleting ...'))
						: (this.calendar.isSharedWithMe ? t('calendar', 'Unshare from me') : t('calendar', 'Delete')),
					icon: this.deleteLoading
						? 'icon-loading-small'
						: 'icon-delete',
					action: this.deleteCalendar
				}
			]
		}
	},
	methods: {
		toggleEnabled() {
			this.$store.dispatch('toggleCalendarEnabled', { calendar: this.calendar })
				.catch((error) => {
					console.error(error)
					OC.Notification.showTemporary(t('calendar', 'An error occurred, unable to change visibility of the calendar.'))
				})
		},
		deleteCalendar() {
			this.deleteLoading = true

			this.$store.dispatch('deleteCalendar', { calendar: this.calendar })
				.then(() => {
					this.deleteLoading = false
				})
				.catch((error) => {
					console.error(error)
					OC.Notification.showTemporary(t('calendar', 'An error occurred, unable to delete the calendar.'))

					this.deleteLoading = false
				})
		},
		closeShareMenu() {
			this.shareMenuOpen = false
		},
		toggleShareMenu() {
			this.shareMenuOpen = !this.shareMenuOpen
		},
		closeMoreMenu(event) {
			if (this.$el.querySelector('.popover-menu-container').contains(event.target)) {
				return
			}

			this.moreMenuOpen = false
			this.editingName = false
			this.editingColor = false
		},
		toggleMoreMenu() {
			this.moreMenuOpen = !this.moreMenuOpen
			if (!this.moreMenuOpen) {
				this.editingName = false
				this.editingColor = false
			}
		},
		copyLink(event) {
			// change to loading status
			this.copyLoading = true
			event.stopPropagation()

			const rootURL = OC.linkToRemote('dav')
			const url = new URL(this.calendar.url, rootURL)

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
		openNameInput() {
			event.stopPropagation()

			if (this.savingName) {
				return
			}

			this.editingColor = false
			this.editingName = true
		},
		saveNameInput(event) {
			event.stopPropagation()

			this.savingName = true
			this.editingName = false

			const value = event.target.querySelector('input[type=text]').value
			this.$store.dispatch('renameCalendar', { calendar: this.calendar, newName: value })
				.then(() => {
					this.savingName = false
				})
				.catch((error) => {
					console.error(error)
					OC.Notification.showTemporary(t('calendar', 'An error occurred, unable to rename the calendar.'))

					this.savingName = false
					this.editingName = true
				})
		},
		openColorInput() {
			event.stopPropagation()

			if (this.savingColor) {
				return
			}

			this.editingName = false
			this.editingColor = true
		},
		saveColorInput(event) {
			event.stopPropagation()

			this.savingColor = true
			this.editingColor = false

			const value = event.target.querySelector('input[type=text]').value
			this.$store.dispatch('changeCalendarColor', { calendar: this.calendar, newColor: value })
				.then(() => {
					this.savingColor = false
				})
				.catch((error) => {
					console.error(error)
					OC.Notification.showTemporary(t('calendar', 'An error occurred, unable to change the calendar\'s color.'))

					this.savingColor = false
					this.editingColor = true
				})
		}
	}
}
</script>
