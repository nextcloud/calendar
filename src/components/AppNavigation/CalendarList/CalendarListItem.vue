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
		v-click-outside="closeShareMenu"
		:loading="calendar.loading"
		:title="calendar.displayName || $t('calendar', 'Untitled calendar')"
		:class="{deleted: !!deleteTimeout, disabled: !calendar.enabled, 'open-sharing': shareMenuOpen}"
		@click.prevent.stop="toggleEnabled">
		<AppNavigationColoredCheckbox
			slot="icon"
			:enabled="calendar.enabled"
			:color="calendar.color"
			@click="toggleEnabled" />

		<template v-if="!deleteTimeout" slot="counter">
			<Actions v-if="showSharingIcon">
				<ActionButton :icon="sharingIconClass" @click="toggleShareMenu" />
			</Actions>
			<span v-if="isSharedOrPublished" class="shared-label" @click.prevent.stop="toggleShareMenu">
				{{ $t('calendar', 'Shared') }}
			</span>
			<Avatar v-if="isSharedWithMe && loadedOwnerPrincipal" :user="ownerUserId" :display-name="ownerDisplayname" />
			<div v-if="isSharedWithMe && !loadedOwnerPrincipal" class="icon icon-loading" />
		</template>

		<template v-if="!deleteTimeout" slot="actions">
			<ActionButton
				v-if="showRenameLabel"
				icon="icon-rename"
				@click.prevent.stop="openRenameInput">
				{{ $t('calendar', 'Edit name') }}
			</ActionButton>
			<ActionInput
				v-if="showRenameInput"
				icon="icon-rename"
				:value="calendar.displayName"
				@submit.prevent.stop="saveRenameInput" />
			<ActionText
				v-if="showRenameSaving"
				icon="icon-loading-small">
				{{ $t('calendar', 'Saving name ...') }}
			</ActionText>
			<ActionButton
				v-if="showColorLabel"
				icon="icon-rename"
				@click.prevent.stop="openColorInput">
				{{ $t('calendar', 'Edit color') }}
			</ActionButton>
			<ActionInput
				v-if="showColorInput"
				icon="icon-rename"
				:value="calendar.color"
				type="color"
				@submit.prevent.stop="saveColorInput" />
			<ActionText
				v-if="showColorSaving"
				icon="icon-loading-small">
				{{ $t('calendar', 'Saving color ...') }}
			</ActionText>
			<ActionButton
				icon="icon-clippy"
				@click.stop.prevent="copyLink">
				{{ $t('calendar', 'Copy private link') }}
			</ActionButton>
			<ActionLink
				icon="icon-download"
				target="_blank"
				:href="downloadUrl">
				{{ $t('calendar', 'Download') }}
			</ActionLink>
			<ActionButton
				v-if="calendar.isSharedWithMe"
				icon="icon-delete"
				@click.prevent.stop="deleteCalendar">
				{{ $t('calendar', 'Unshare from me') }}
			</ActionButton>
			<ActionButton
				v-if="!calendar.isSharedWithMe"
				icon="icon-delete"
				@click.prevent.stop="deleteCalendar">
				{{ $t('calendar', 'Delete') }}
			</ActionButton>
		</template>

		<template v-if="!!deleteTimeout" slot="actions">
			<ActionButton
				v-if="calendar.isSharedWithMe"
				icon="icon-history"
				@click.prevent.stop="cancelDeleteCalendar">
				{{ $n('calendar', 'Unsharing the calendar in {countdown} second', 'Unsharing the calendar in {countdown} seconds', countdown, { countdown }) }}
			</ActionButton>
			<ActionButton
				v-if="!calendar.isSharedWithMe"
				icon="icon-history"
				@click.prevent.stop="cancelDeleteCalendar">
				{{ $n('calendar', 'Deleting the calendar in {countdown} second', 'Deleting the calendar in {countdown} seconds', countdown, { countdown }) }}
			</ActionButton>
		</template>

		<template v-if="!deleteTimeout">
			<div v-show="shareMenuOpen" class="sharing-section">
				<CalendarListItemSharingSearch v-if="calendar.canBeShared" :calendar="calendar" />
				<CalendarListItemSharingPublishItem v-if="calendar.canBePublished" :calendar="calendar" />
				<CalendarListItemSharingShareItem v-for="sharee in calendar.shares"
					v-show="shareMenuOpen"
					:key="sharee.uri"
					:sharee="sharee"
					:calendar="calendar" />
			</div>
		</template>
	</AppNavigationItem>
</template>

<script>
import {
	Avatar,
	Actions,
	ActionButton,
	ActionInput,
	ActionLink,
	ActionText,
	AppNavigationItem,
} from '@nextcloud/vue'
import ClickOutside from 'vue-click-outside'
import {
	generateRemoteUrl,
} from '@nextcloud/router'

import CalendarListItemSharingSearch from './CalendarListItemSharingSearch.vue'
import CalendarListItemSharingPublishItem from './CalendarListItemSharingPublishItem.vue'
import CalendarListItemSharingShareItem from './CalendarListItemSharingShareItem.vue'
import AppNavigationColoredCheckbox from './AppNavigationColoredCheckbox.vue'

export default {
	name: 'CalendarListItem',
	components: {
		AppNavigationColoredCheckbox,
		Avatar,
		Actions,
		ActionButton,
		ActionInput,
		ActionLink,
		ActionText,
		AppNavigationItem,
		CalendarListItemSharingSearch,
		CalendarListItemSharingPublishItem,
		CalendarListItemSharingShareItem,
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
	data: function() {
		return {
			// Rename action
			showRenameLabel: true,
			showRenameInput: false,
			showRenameSaving: false,
			// Color action
			showColorLabel: true,
			showColorInput: false,
			showColorSaving: false,
			// share menu
			shareMenuOpen: false,
			// Deleting
			deleteInterval: null,
			deleteTimeout: null,
			countdown: 7,
		}
	},
	computed: {
		/**
		 * Download url of the calendar
		 *
		 * @returns {String}
		 */
		downloadUrl() {
			return this.calendar.url + '?export'
		},
		/**
		 * Whether or not to display the sharing icon.
		 * It will only be displayed when the calendar is either sharable or publishable
		 *
		 * @returns {Boolean}
		 */
		showSharingIcon() {
			return this.calendar.canBeShared || this.calendar.canBePublished
		},
		/**
		 * The sharing icon class.
		 * This figures out what icon to display.
		 *
		 * The anchor icon when the calendar is published
		 * The sharing icon with high opacity when the calendar is shared
		 * The sharing icon with low opacity when the calendar is neither shared nor published
		 *
		 * @returns {String}
		 */
		sharingIconClass() {
			if (this.isPublished) {
				return 'icon-public'
			}

			if (this.isShared) {
				return 'icon-shared'
			}

			return 'icon-share'
		},
		/**
		 * Whether or not the calendar is either shared or published
		 * This is used to figure out whether or not to display the Shared label
		 *
		 * @returns {Boolean}
		 */
		isSharedOrPublished() {
			return this.isShared || this.isPublished
		},
		/**
		 * Is the calendar shared?
		 *
		 * @returns {Boolean}
		 */
		isShared() {
			return !!this.calendar.shares.length
		},
		/**
		 * Is the calendar shared with me?
		 *
		 * @returns {Boolean}
		 */
		isSharedWithMe() {
			return this.calendar.isSharedWithMe
		},
		/**
		 * Is the calendar published
		 *
		 * @returns {Boolean}
		 */
		isPublished() {
			return !!this.calendar.publishURL
		},
		/**
		 * TODO: this should use principals and principal.userId
		 *
		 * @returns {String}
		 */
		owner() {
			if (this.calendar.owner.indexOf('principal:principals/users/') === '0') {
				console.debug(this.calendar.owner.substr(27))
				return this.calendar.owner.substr(27)
			}

			return ''
		},
		/**
		 * Whether or not the information about the owner principal was loaded
		 *
		 * @returns {Boolean}
		 */
		loadedOwnerPrincipal() {
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
	},
	methods: {
		/**
		 * Toggles the enabled state of this calendar
		 */
		toggleEnabled() {
			this.$store.dispatch('toggleCalendarEnabled', { calendar: this.calendar })
				.catch((error) => {
					this.$toast.error(this.$t('calendar', 'An error occurred, unable to change visibility of the calendar.'))
					console.error(error)
				})
		},
		/**
		 * Deletes or unshares the calendar
		 */
		deleteCalendar() {
			this.deleteInterval = setInterval(() => {
				this.countdown--

				if (this.countdown < 0) {
					this.countdown = 0
				}
			}, 1000)
			this.deleteTimeout = setTimeout(() => {
				this.$store.dispatch('deleteCalendar', { calendar: this.calendar })
					.catch((error) => {
						this.$toast.error(this.$t('calendar', 'An error occurred, unable to delete the calendar.'))
						console.error(error)
					})
					.then(() => {
						clearInterval(this.deleteInterval)
						this.deleteTimeout = null
						this.deleteInterval = null
						this.countdown = 7
					})
			}, 7000)
		},
		/**
		 * Cancels the deletion of a calendar
		 */
		cancelDeleteCalendar() {
			clearTimeout(this.deleteTimeout)
			clearInterval(this.deleteInterval)
			this.deleteTimeout = null
			this.deleteInterval = null
			this.countdown = 7
		},
		/**
		 * Closes the share menu
		 * This is used with v-click-outside
		 *
		 * @param {Event} event The javascript click event
		 */
		closeShareMenu(event) {
			if (!event.isTrusted) {
				return
			}

			if (this.$el.contains(event.target)) {
				this.shareMenuOpen = true
				return
			}

			if (event.composedPath && event.composedPath().includes(this.$el)) {
				this.shareMenuOpen = true
				return
			}

			this.shareMenuOpen = false
		},
		/**
		 * Toggles the visibility of the share menu
		 */
		toggleShareMenu() {
			this.shareMenuOpen = !this.shareMenuOpen
			console.debug('toggled share menu')
		},
		/**
		 * Copies the private calendar link
		 * to be used with clients like Thunderbird
		 */
		copyLink() {
			const rootUrl = generateRemoteUrl('dav')
			const url = new URL(this.calendar.url, rootUrl)

			// TODO - use menuOpen to keep it open instead of toast

			this.$copyText(url)
				.then(e => this.$toast.success(this.$t('calendar', 'Calendar link copied to clipboard.')))
				.catch(e => this.$toast.error(this.$t('calendar', 'Calendar link could not be copied to clipboard.')))
		},
		/**
		 * Opens the input-field to rename the calendar
		 */
		openRenameInput() {
			// Hide label and show input
			this.showRenameLabel = false
			this.showRenameInput = true
			this.showRenameSaving = false
			// Reset color input if necessary
			this.showColorLabel = true
			this.showColorInput = false
			this.showColorSaving = false
		},
		/**
		 * Saves the modified name of a calendar
		 *
		 * @param {Event} event The submit event
		 */
		saveRenameInput(event) {
			this.showRenameInput = false
			this.showRenameSaving = true

			const newName = event.target.querySelector('input[type=text]').value
			this.$store.dispatch('renameCalendar', {
				calendar: this.calendar,
				newName,
			})
				.then(() => {
					this.showRenameLabel = true
					this.showRenameInput = false
					this.showRenameSaving = false
				})
				.catch((error) => {
					this.$toast(this.$t('calendar', 'An error occurred, unable to rename the calendar.'))
					console.error(error)

					this.showRenameLabel = false
					this.showRenameInput = true
					this.showRenameSaving = false
				})
		},
		/**
		 * Opens the color-picker
		 */
		openColorInput() {
			// Hide label and show input
			this.showColorLabel = false
			this.showColorInput = true
			this.showColorSaving = false
			// Reset rename input if necessary
			this.showRenameLabel = true
			this.showRenameInput = false
			this.showRenameSaving = false
		},
		/**
		 * Saves the modified color of a calendar
		 *
		 * @param {Event} event The submit event
		 */
		saveColorInput(event) {
			this.showColorInput = false
			this.showColorSaving = true

			const newColor = event.target.querySelector('input[type=color]').value
			this.$store.dispatch('changeCalendarColor', {
				calendar: this.calendar,
				newColor,
			})
				.then(() => {
					this.showColorLabel = true
					this.showColorInput = false
					this.showColorSaving = false
				})
				.catch((error) => {
					this.$toast(this.$t('calendar', 'An error occurred, unable to change the calendar\'s color.'))
					console.error(error)

					this.showColorLabel = false
					this.showColorInput = true
					this.showColorSaving = false
				})
		},
	},
}
</script>
