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
		<template slot="icon">
			<Actions>
				<ActionButton @click.prevent.stop="toggleEnabled">
					<template #icon>
						<CheckboxBlankCircle
							v-if="calendar.enabled"
							:title="$t('calendar', 'Disable calendar')"
							:size="20"
							:fill-color="calendar.color" />
						<CheckboxBlankCircleOutline
							v-else
							:title="$t('calendar', 'Enable calendar')"
							:size="20"
							:fill-color="calendar.color" />
					</template>
				</ActionButton>
			</Actions>
		</template>

		<template v-if="!deleteTimeout" slot="counter">
			<Actions v-if="showSharingIcon" class="sharing">
				<ActionButton @click="toggleShareMenu">
					<template #icon>
						<LinkVariant v-if="isPublished" :size="20" decorative />
						<ShareVariant v-else
							:size="20"
							decorative
							:class="{share: !isShared}" />
					</template>
				</ActionButton>
			</Actions>
			<Avatar v-if="isSharedWithMe && loadedOwnerPrincipal" :user="ownerUserId" :display-name="ownerDisplayname" />
			<div v-if="isSharedWithMe && !loadedOwnerPrincipal" class="icon icon-loading" />
		</template>

		<template v-if="!deleteTimeout" slot="actions">
			<ActionButton
				v-if="showRenameLabel"
				@click.prevent.stop="openRenameInput">
				<template #icon>
					<Pencil :size="20" decorative />
				</template>
				{{ $t('calendar', 'Edit name') }}
			</ActionButton>
			<ActionInput
				v-if="showRenameInput"
				:value="calendar.displayName"
				@submit.prevent.stop="saveRenameInput">
				<template #icon>
					<Pencil :size="20" decorative />
				</template>
			</ActionInput>
			<ActionText
				v-if="showRenameSaving"
				icon="icon-loading-small">
				<!-- eslint-disable-next-line no-irregular-whitespace -->
				{{ $t('calendar', 'Saving name …') }}
			</ActionText>
			<ActionButton
				v-if="showColorLabel"
				@click.prevent.stop="openColorInput">
				<template #icon>
					<Pencil :size="20" decorative />
				</template>
				{{ $t('calendar', 'Edit color') }}
			</ActionButton>
			<ActionInput
				v-if="showColorInput"
				:value="calendar.color"
				type="color"
				@submit.prevent.stop="saveColorInput">
				<template #icon>
					<Pencil :size="20" decorative />
				</template>
			</ActionInput>
			<ActionText
				v-if="showColorSaving"
				icon="icon-loading-small">
				<!-- eslint-disable-next-line no-irregular-whitespace -->
				{{ $t('calendar', 'Saving color …') }}
			</ActionText>
			<ActionButton
				@click.stop.prevent="copyLink">
				<template #icon>
					<LinkVariant :size="20" decorative />
				</template>
				{{ $t('calendar', 'Copy private link') }}
			</ActionButton>
			<ActionLink
				target="_blank"
				:href="downloadUrl">
				<template #icon>
					<Download :size="20" decorative />
				</template>
				{{ $t('calendar', 'Download') }}
			</ActionLink>
			<ActionButton
				v-if="calendar.isSharedWithMe"
				@click.prevent.stop="deleteCalendar">
				<template #icon>
					<Close :size="20" decorative />
				</template>
				{{ $t('calendar', 'Unshare from me') }}
			</ActionButton>
			<ActionButton
				v-if="!calendar.isSharedWithMe"
				@click.prevent.stop="deleteCalendar">
				<template #icon>
					<Delete :size="20" decorative />
				</template>
				{{ $t('calendar', 'Delete') }}
			</ActionButton>
		</template>

		<template v-if="!!deleteTimeout" slot="actions">
			<ActionButton
				v-if="calendar.isSharedWithMe"
				@click.prevent.stop="cancelDeleteCalendar">
				<template #icon>
					<Undo :size="20" decorative />
				</template>
				{{ $n('calendar', 'Unsharing the calendar in {countdown} second', 'Unsharing the calendar in {countdown} seconds', countdown, { countdown }) }}
			</ActionButton>
			<ActionButton
				v-else
				@click.prevent.stop="cancelDeleteCalendar">
				<template #icon>
					<Undo :size="20" decorative />
				</template>
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
import Avatar from '@nextcloud/vue/dist/Components/Avatar'
import Actions from '@nextcloud/vue/dist/Components/Actions'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'
import ActionInput from '@nextcloud/vue/dist/Components/ActionInput'
import ActionLink from '@nextcloud/vue/dist/Components/ActionLink'
import ActionText from '@nextcloud/vue/dist/Components/ActionText'
import AppNavigationItem from '@nextcloud/vue/dist/Components/AppNavigationItem'
import ClickOutside from 'vue-click-outside'
import {
	showInfo,
	showSuccess,
	showError,
} from '@nextcloud/dialogs'
import {
	generateRemoteUrl,
} from '@nextcloud/router'

import CalendarListItemSharingSearch from './CalendarListItemSharingSearch.vue'
import CalendarListItemSharingPublishItem from './CalendarListItemSharingPublishItem.vue'
import CalendarListItemSharingShareItem from './CalendarListItemSharingShareItem.vue'
import CheckboxBlankCircle from 'vue-material-design-icons/CheckboxBlankCircle.vue'
import CheckboxBlankCircleOutline from 'vue-material-design-icons/CheckboxBlankCircleOutline.vue'
import Close from 'vue-material-design-icons/Close.vue'
import Delete from 'vue-material-design-icons/Delete.vue'
import Download from 'vue-material-design-icons/Download.vue'
import LinkVariant from 'vue-material-design-icons/LinkVariant.vue'
import Pencil from 'vue-material-design-icons/Pencil.vue'
import ShareVariant from 'vue-material-design-icons/ShareVariant.vue'
import Undo from 'vue-material-design-icons/Undo.vue'

export default {
	name: 'CalendarListItem',
	components: {
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
		CheckboxBlankCircle,
		CheckboxBlankCircleOutline,
		Close,
		Delete,
		Download,
		LinkVariant,
		Pencil,
		ShareVariant,
		Undo,
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
		 * @return {string}
		 */
		downloadUrl() {
			return this.calendar.url + '?export'
		},
		/**
		 * Whether or not to display the sharing icon.
		 * It will only be displayed when the calendar is either sharable or publishable
		 *
		 * @return {boolean}
		 */
		showSharingIcon() {
			return this.calendar.canBeShared || this.calendar.canBePublished
		},
		/**
		 * Whether or not the calendar is either shared or published
		 * This is used to figure out whether or not to display the Shared label
		 *
		 * @return {boolean}
		 */
		isSharedOrPublished() {
			return this.isShared || this.isPublished
		},
		/**
		 * Is the calendar shared?
		 *
		 * @return {boolean}
		 */
		isShared() {
			return !!this.calendar.shares.length
		},
		/**
		 * Is the calendar shared with me?
		 *
		 * @return {boolean}
		 */
		isSharedWithMe() {
			return this.calendar.isSharedWithMe
		},
		/**
		 * Is the calendar published
		 *
		 * @return {boolean}
		 */
		isPublished() {
			return !!this.calendar.publishURL
		},
		/**
		 * TODO: this should use principals and principal.userId
		 *
		 * @return {string}
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
		 * @return {boolean}
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
					showError(this.$t('calendar', 'An error occurred, unable to change visibility of the calendar.'))
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
			this.deleteTimeout = setTimeout(async () => {
				try {
					await this.$store.dispatch('deleteCalendar', { calendar: this.calendar })
				} catch (error) {
					showError(this.$t('calendar', 'An error occurred, unable to delete the calendar.'))
					console.error(error)
				} finally {
					clearInterval(this.deleteInterval)
					this.deleteTimeout = null
					this.deleteInterval = null
					this.countdown = 7
				}
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
		async copyLink() {
			const rootUrl = generateRemoteUrl('dav')
			const url = new URL(this.calendar.url, rootUrl)

			// TODO - use menuOpen to keep it open instead of toast

			try {
				await this.$copyText(url)
				showSuccess(this.$t('calendar', 'Calendar link copied to clipboard.'))
			} catch (error) {
				console.debug(error)
				showError(this.$t('calendar', 'Calendar link could not be copied to clipboard.'))
			}
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
		async saveRenameInput(event) {
			this.showRenameInput = false
			this.showRenameSaving = true

			const newName = event.target.querySelector('input[type=text]').value
			try {
				await this.$store.dispatch('renameCalendar', {
					calendar: this.calendar,
					newName,
				})
				this.showRenameLabel = true
				this.showRenameInput = false
				this.showRenameSaving = false
			} catch (error) {
				showInfo(this.$t('calendar', 'An error occurred, unable to rename the calendar.'))
				console.error(error)

				this.showRenameLabel = false
				this.showRenameInput = true
				this.showRenameSaving = false
			}
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
		async saveColorInput(event) {
			this.showColorInput = false
			this.showColorSaving = true

			const newColor = event.target.querySelector('input[type=color]').value
			try {
				await this.$store.dispatch('changeCalendarColor', {
					calendar: this.calendar,
					newColor,
				})
				this.showColorLabel = true
				this.showColorInput = false
				this.showColorSaving = false
			} catch (error) {
				showInfo(this.$t('calendar', 'An error occurred, unable to change the calendar\'s color.'))
				console.error(error)

				this.showColorLabel = false
				this.showColorInput = true
				this.showColorSaving = false
			}
		},
	},
}
</script>

<style lang="scss" scoped>
	.app-navigation-entry__counter-wrapper .action-item.sharing .material-design-icon.share {
		opacity: .3;
	}
</style>
