<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<AppNavigationItem
		:loading="calendar.loading"
		:aria-description="descriptionAppNavigationItem"
		:name="calendarDisplayName || $t('calendar', 'Untitled calendar')"
		:class="{ deleted: isBeingDeleted, disabled: !calendar.enabled }"
		@update:menuOpen="actionsMenuOpen = $event"
		@click.prevent.stop="toggleEnabled">
		<template #icon>
			<CheckboxMarked
				v-if="calendar.enabled"
				:size="20"
				:fill-color="calendar.color"
				@click.prevent.stop="toggleEnabled" />
			<CheckboxBlank
				v-else
				:size="20"
				:fill-color="calendar.color"
				@click.prevent.stop="toggleEnabled" />
		</template>

		<template #counter>
			<LinkVariant v-if="isSharedByMe" :size="20" />
			<NcAvatar
				v-else-if="isSharedWithMe && loadedOwnerPrincipal && !actionsMenuOpen"
				:user="ownerUserId"
				:display-name="ownerDisplayname" />
			<div v-else-if="isSharedWithMe && !loadedOwnerPrincipal" class="icon icon-loading" />
		</template>

		<template #actions>
			<template v-if="!isBeingDeleted">
				<template v-if="isSharedWithMe">
					<NcActionCaption :name="$t('calendar', 'Shared with you by')" />
					<NcActionText :name="ownerDisplayname">
						<template #icon>
							<div class="actions-icon-avatar">
								<NcAvatar :user="ownerUserId" :display-name="ownerDisplayname" :size="30" />
							</div>
						</template>
					</NcActionText>
					<NcActionSeparator />
				</template>
				<ActionButton v-if="isPublished" @click.prevent.stop="copyPublicLink">
					<template #icon>
						<ContentCopy :size="20" decorative />
					</template>
					{{ $t('calendar', 'Copy public link') }}
				</ActionButton>
				<ActionButton @click.prevent.stop="showEditModal">
					<template #icon>
						<Pencil :size="20" decorative />
					</template>
					<template v-if="canBeShared">
						{{ $t('calendar', 'Edit and share calendar') }}
					</template>
					<template v-else>
						{{ $t('calendar', 'Edit calendar') }}
					</template>
				</ActionButton>
			</template>
			<template v-else>
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
		</template>
	</AppNavigationItem>
</template>

<script>
import { showError, showSuccess } from '@nextcloud/dialogs'
import { generateRemoteUrl, generateUrl } from '@nextcloud/router'
import {
	NcActionButton as ActionButton,
	NcAppNavigationItem as AppNavigationItem,
	NcActionCaption,
	NcActionSeparator,
	NcActionText,
	NcAvatar,
} from '@nextcloud/vue'
import { mapStores } from 'pinia'
import CheckboxBlank from 'vue-material-design-icons/CheckboxBlankOutline.vue'
import CheckboxMarked from 'vue-material-design-icons/CheckboxMarked.vue'
import ContentCopy from 'vue-material-design-icons/ContentCopy.vue'
import LinkVariant from 'vue-material-design-icons/Link.vue'
import Pencil from 'vue-material-design-icons/PencilOutline.vue'
import Undo from 'vue-material-design-icons/Undo.vue'
import useCalendarsStore from '../../../store/calendars.js'
import usePrincipalsStore from '../../../store/principals.js'

export default {
	name: 'CalendarListItem',
	components: {
		NcAvatar,
		ActionButton,
		AppNavigationItem,
		CheckboxMarked,
		CheckboxBlank,
		Pencil,
		Undo,
		LinkVariant,
		NcActionText,
		NcActionSeparator,
		NcActionCaption,
		ContentCopy,
	},

	props: {
		calendar: {
			type: Object,
			required: true,
		},
	},

	data() {
		return {
			actionsMenuOpen: false,
		}
	},

	computed: {
		...mapStores(usePrincipalsStore, useCalendarsStore),
		/**
		 * Whether to show the sharing section
		 *
		 * @return {boolean}
		 */
		canBeShared() {
			// The backend falsely reports incoming editable shares as being shareable
			// Ref https://github.com/nextcloud/calendar/issues/5755
			if (this.calendar.isSharedWithMe) {
				return false
			}

			return this.calendar.canBeShared || this.calendar.canBePublished
		},

		/**
		 * Whether the calendar is already published or not.
		 *
		 * @return {boolean}
		 */
		isPublished() {
			return this.calendar.publishURL !== null
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
		 * Is the calendar shared by me or published via a link?
		 *
		 * @return {boolean}
		 */
		isSharedByMe() {
			return this.calendar.shares.length > 0 || this.calendar.publishURL !== null
		},

		/**
		 * Whether or not the information about the owner principal was loaded
		 *
		 * @return {boolean}
		 */
		loadedOwnerPrincipal() {
			return this.principalsStore.getPrincipalByUrl(this.calendar.owner) !== undefined
		},

		ownerUserId() {
			const principal = this.principalsStore.getPrincipalByUrl(this.calendar.owner)
			if (principal) {
				return principal.userId
			}

			return ''
		},

		ownerDisplayname() {
			const principal = this.principalsStore.getPrincipalByUrl(this.calendar.owner)
			if (principal) {
				return principal.displayname
			}

			return ''
		},

		/**
		 * compute aria-description for AppNavigationItem link
		 *
		 * @return {string}
		 */
		descriptionAppNavigationItem() {
			if (this.calendar.enabled && this.calendar.displayName) {
				return t('calendar', 'Disable calendar "{calendar}"', { calendar: this.calendar.displayName })
			} else if (this.calendar.enabled && !this.calendar.displayName) {
				return t('calendar', 'Disable untitled calendar')
			} else if (!this.calendar.enabled && this.calendar.displayName) {
				return t('calendar', 'Enable calendar "{calendar}"', { calendar: this.calendar.displayName })
			} else {
				return t('calendar', 'Enable untitled calendar')
			}
		},

		/**
		 * Whether the calendar is currently being deleted
		 *
		 * @return {boolean}
		 */
		isBeingDeleted() {
			return !!this.calendar.deleteInterval
		},

		/**
		 * Countdown to the deletion of the calendar
		 *
		 * @return {number|undefined}
		 */
		countdown() {
			return this.calendar.countdown
		},

		calendarDisplayName() {
			if (this.calendar.displayName.substring(0, 5) === 'Deck:') {
				return this.calendar.displayName.substring(5)
			} else {
				return this.calendar.displayName
			}
		},
	},

	methods: {
		/**
		 * Toggles the enabled state of this calendar
		 */
		async toggleEnabled() {
			try {
				await this.calendarsStore.toggleCalendarEnabled({ calendar: this.calendar })
			} catch (error) {
				showError(this.$t('calendar', 'An error occurred, unable to change visibility of the calendar.'))
				console.error(error)
			}
		},

		/**
		 * Cancels the deletion of a calendar
		 */
		cancelDeleteCalendar() {
			this.calendarsStore.cancelCalendarDeletion({ calendar: this.calendar })
		},

		/**
		 * Open the calendar modal for this calendar item.
		 */
		showEditModal() {
			this.calendarsStore.editCalendarModal = { calendarId: this.calendar.id }
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
	},
}
</script>

<style lang="scss" scoped>
	.actions-icon-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
	}

	// Hide avatars if list item is hovered
	:deep(.app-navigation-entry:hover .app-navigation-entry__counter-wrapper) {
		display: none;
	}

	.app-navigation-entry__counter-wrapper .action-item.sharing .material-design-icon.share {
		opacity: .3;
	}
</style>
