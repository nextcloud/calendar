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
		class="app-navigation-entry-new-calendar"
		:class="{'app-navigation-entry-new-calendar--open': isOpen}"
		:title="$t('calendar', '+ New calendar')"
		:menu-open.sync="isOpen"
		menu-icon="icon-add"
		@click.prevent.stop="toggleDialog">
		<template slot="actions">
			<ActionButton
				v-if="showCreateCalendarLabel"
				icon="icon-new-calendar"
				@click.prevent.stop="openCreateCalendarInput">
				{{ $t('calendar', 'New calendar') }}
			</ActionButton>
			<ActionInput
				v-if="showCreateCalendarInput"
				icon="icon-new-calendar"
				@submit.prevent.stop="createNewCalendar" />
			<ActionText
				v-if="showCreateCalendarSaving"
				icon="icon-loading-small">
				{{ $t('calendar', 'Creating calendar …') }}
			</ActionText>

			<ActionButton
				v-if="showCreateCalendarTaskListLabel"
				icon="icon-new-calendar-with-task-list"
				@click.prevent.stop="openCreateCalendarTaskListInput">
				{{ $t('calendar', 'New calendar with task list') }}
			</ActionButton>
			<ActionInput
				v-if="showCreateCalendarTaskListInput"
				icon="icon-new-calendar-with-task-list"
				@submit.prevent.stop="createNewCalendarTaskList" />
			<ActionText
				v-if="showCreateCalendarTaskListSaving"
				icon="icon-loading-small">
				{{ $t('calendar', 'Creating calendar …') }}
			</ActionText>

			<ActionButton
				v-if="showCreateSubscriptionLabel"
				icon="icon-public"
				@click.prevent.stop="openCreateSubscriptionInput">
				{{ $t('calendar', 'New subscription from link') }}
			</ActionButton>
			<ActionInput
				v-if="showCreateSubscriptionInput"
				icon="icon-public"
				@submit.prevent.stop="createNewSubscription" />
			<ActionText
				v-if="showCreateSubscriptionSaving"
				icon="icon-loading-small">
				{{ $t('calendar', 'Creating subscription …') }}
			</ActionText>
		</template>
	</AppNavigationItem>
</template>

<script>
import { ActionButton } from '@nextcloud/vue/dist/Components/ActionButton'
import { ActionInput } from '@nextcloud/vue/dist/Components/ActionInput'
import { ActionText } from '@nextcloud/vue/dist/Components/ActionText'
import { AppNavigationItem } from '@nextcloud/vue/dist/Components/AppNavigationItem'

import { uidToHexColor } from '../../../utils/color.js'

export default {
	name: 'CalendarListNew',
	components: {
		ActionButton,
		ActionInput,
		ActionText,
		AppNavigationItem,
	},
	data: function() {
		return {
			// Open state
			isOpen: false,
			// New calendar
			showCreateCalendarLabel: true,
			showCreateCalendarInput: false,
			showCreateCalendarSaving: false,
			// New calendar with task list
			showCreateCalendarTaskListLabel: true,
			showCreateCalendarTaskListInput: false,
			showCreateCalendarTaskListSaving: false,
			// New subscription
			showCreateSubscriptionLabel: true,
			showCreateSubscriptionInput: false,
			showCreateSubscriptionSaving: false,
		}
	},
	watch: {
		isOpen() {
			if (this.isOpen) {
				return
			}

			this.closeMenu()
		},
	},
	methods: {
		/**
		 * Opens the Actions menu when clicking on the main item label
		 */
		toggleDialog() {
			this.isOpen = !this.isOpen
		},
		/**
		 * Opens the create calendar input
		 */
		openCreateCalendarInput() {
			this.showCreateCalendarLabel = false
			this.showCreateCalendarInput = true
			this.showCreateCalendarSaving = false

			this.showCreateCalendarTaskListLabel = true
			this.showCreateCalendarTaskListInput = false

			this.showCreateSubscriptionLabel = true
			this.showCreateSubscriptionInput = false
		},
		/**
		 * Opens the create calendar with task list input
		 */
		openCreateCalendarTaskListInput() {
			this.showCreateCalendarTaskListLabel = false
			this.showCreateCalendarTaskListInput = true
			this.showCreateCalendarTaskListSaving = false

			this.showCreateCalendarLabel = true
			this.showCreateCalendarInput = false

			this.showCreateSubscriptionLabel = true
			this.showCreateSubscriptionInput = false
		},
		/**
		 * Opens the create subscription input
		 */
		openCreateSubscriptionInput() {
			this.showCreateSubscriptionLabel = false
			this.showCreateSubscriptionInput = true
			this.showCreateSubscriptionSaving = false

			this.showCreateCalendarLabel = true
			this.showCreateCalendarInput = false

			this.showCreateCalendarTaskListLabel = true
			this.showCreateCalendarTaskListInput = false
		},
		/**
		 * Creates a new calendar
		 *
		 * @param {Event} event The submit event
		 */
		async createNewCalendar(event) {
			this.showCreateCalendarInput = false
			this.showCreateCalendarSaving = true

			const displayName = event.target.querySelector('input[type=text]').value

			try {
				await this.$store.dispatch('appendCalendar', {
					displayName,
					color: uidToHexColor(displayName),
				})
			} catch (error) {
				console.debug(error)
				this.$toast.error(this.$t('calendar', 'An error occurred, unable to create the calendar.'))
			} finally {
				this.showCreateCalendarSaving = false
				this.showCreateCalendarLabel = true
				this.isOpen = false
				this.closeMenu()
			}
		},
		/**
		 * Creates a new calendar with task list
		 *
		 * @param {Event} event The submit event
		 */
		async createNewCalendarTaskList(event) {
			this.showCreateCalendarTaskListInput = false
			this.showCreateCalendarTaskListSaving = true

			const displayName = event.target.querySelector('input[type=text]').value

			try {
				await this.$store.dispatch('appendCalendar', {
					displayName,
					color: uidToHexColor(displayName),
					components: ['VEVENT', 'VTODO'],
				})
			} catch (error) {
				console.debug(error)
				this.$toast.error(this.$t('calendar', 'An error occurred, unable to create the calendar.'))
			} finally {
				this.showCreateCalendarTaskListSaving = false
				this.showCreateCalendarTaskListLabel = true
				this.isOpen = false
				this.closeMenu()
			}
		},
		/**
		 * Creates a new subscription
		 *
		 * @param {Event} event The submit event
		 */
		async createNewSubscription(event) {
			this.showCreateSubscriptionInput = false
			this.showCreateSubscriptionSaving = true

			const link = event.target.querySelector('input[type=text]').value
			let url
			let hostname
			try {
				url = new URL(link)
				hostname = url.hostname
			} catch (error) {
				console.error(error)
				this.$toast.error(this.$t('calendar', 'Please enter a valid link (starting with http://, https://, webcal://, or webcals://)'))
				return
			}

			try {
				await this.$store.dispatch('appendSubscription', {
					displayName: hostname,
					color: uidToHexColor(link),
					source: link,
				})
			} catch (error) {
				console.debug(error)
				this.$toast.error(this.$t('calendar', 'An error occurred, unable to create the calendar.'))
			} finally {
				this.showCreateSubscriptionSaving = false
				this.showCreateSubscriptionLabel = true
				this.isOpen = false
				this.closeMenu()
			}
		},
		/**
		 * This resets the actions on close of menu
		 */
		closeMenu() {
			this.showCreateCalendarLabel = true
			this.showCreateCalendarInput = false
			this.showCreateCalendarSaving = false
			this.showCreateCalendarTaskListLabel = true
			this.showCreateCalendarTaskListInput = false
			this.showCreateCalendarTaskListSaving = false
			this.showCreateSubscriptionLabel = true
			this.showCreateSubscriptionInput = false
			this.showCreateSubscriptionSaving = false
		},
	},
}
</script>
