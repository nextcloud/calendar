<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
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
	<AppNavigationItem :loading="calendar.loading"
		:aria-description="descriptionAppNavigationItem"
		:title="calendar.displayName || $t('calendar', 'Untitled calendar')"
		:class="{deleted: isBeingDeleted, disabled: !calendar.enabled}"
		@click.prevent.stop="toggleEnabled"
		@update:menuOpen="actionsMenuOpen = $event">
		<template #icon>
			<CheckboxBlankCircle v-if="calendar.enabled"
				:size="20"
				:fill-color="calendar.color" />
			<CheckboxBlankCircleOutline v-else
				:size="20"
				:fill-color="calendar.color" />
		</template>

		<template #counter>
			<LinkVariant v-if="isSharedByMe" :size="20" />
			<NcAvatar v-else-if="isSharedWithMe && loadedOwnerPrincipal && !actionsMenuOpen"
				:user="ownerUserId"
				:display-name="ownerDisplayname" />
			<div v-else-if="isSharedWithMe && !loadedOwnerPrincipal" class="icon icon-loading" />
		</template>

		<template #actions>
			<template v-if="!isBeingDeleted">
				<template v-if="isSharedWithMe">
					<NcActionCaption :title="$t('calendar', 'Shared with you by')" />
					<NcActionText :title="ownerDisplayname">
						<template #icon>
							<div class="actions-icon-avatar">
								<NcAvatar :user="ownerUserId" :display-name="ownerDisplayname" :size="30" />
							</div>
						</template>
					</NcActionText>
					<NcActionSeparator />
				</template>
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
				<ActionButton v-if="calendar.isSharedWithMe"
					@click.prevent.stop="cancelDeleteCalendar">
					<template #icon>
						<Undo :size="20" decorative />
					</template>
					{{ $n('calendar', 'Unsharing the calendar in {countdown} second', 'Unsharing the calendar in {countdown} seconds', countdown, { countdown }) }}
				</ActionButton>
				<ActionButton v-else
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
import NcAvatar from '@nextcloud/vue/dist/Components/NcAvatar.js'
import ActionButton from '@nextcloud/vue/dist/Components/NcActionButton.js'
import AppNavigationItem from '@nextcloud/vue/dist/Components/NcAppNavigationItem.js'
import NcActionText from '@nextcloud/vue/dist/Components/NcActionText.js'
import NcActionSeparator from '@nextcloud/vue/dist/Components/NcActionSeparator.js'
import NcActionCaption from '@nextcloud/vue/dist/Components/NcActionCaption.js'
import { showError } from '@nextcloud/dialogs'
import CheckboxBlankCircle from 'vue-material-design-icons/CheckboxBlankCircle.vue'
import CheckboxBlankCircleOutline from 'vue-material-design-icons/CheckboxBlankCircleOutline.vue'
import Pencil from 'vue-material-design-icons/Pencil.vue'
import Undo from 'vue-material-design-icons/Undo.vue'
import LinkVariant from 'vue-material-design-icons/LinkVariant.vue'

export default {
	name: 'CalendarListItem',
	components: {
		NcAvatar,
		ActionButton,
		AppNavigationItem,
		CheckboxBlankCircle,
		CheckboxBlankCircleOutline,
		Pencil,
		Undo,
		LinkVariant,
		NcActionText,
		NcActionSeparator,
		NcActionCaption,
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
		/**
		 * Whether to show the sharing section
		 *
		 * @return {boolean}
		 */
		canBeShared() {
			return this.calendar.canBeShared || this.calendar.canBePublished
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
		 * Cancels the deletion of a calendar
		 */
		cancelDeleteCalendar() {
			this.$store.dispatch('cancelCalendarDeletion', { calendar: this.calendar })
		},

		/**
		 * Open the calendar modal for this calendar item.
		 */
		showEditModal() {
			this.$store.commit('showEditCalendarModal', {
				calendarId: this.calendar.id,
			})
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
	::v-deep .app-navigation-entry:hover .app-navigation-entry__counter-wrapper {
		display: none;
	}

	.app-navigation-entry__counter-wrapper .action-item.sharing .material-design-icon.share {
		opacity: .3;
	}
</style>
