<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  - @copyright Copyright (c) 2022 Informatyka Boguslawski sp. z o.o. sp.k., http://www.ib.pl/
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
	<AppNavigationItem class="app-navigation-entry-new-calendar"
		:class="{'app-navigation-entry-new-calendar--open': isOpen}"
		:title="$t('calendar', 'New calendar')"
		:menu-open.sync="isOpen"
		@click.prevent.stop="toggleDialog">
		<template #icon>
			<Plus :size="20" />
		</template>
		<template #actions>
			<ActionButton v-if="showCreateCalendarLabel"
				@click.prevent.stop="openCreateCalendarInput">
				<template #icon>
					<CalendarBlank :size="20" decorative />
				</template>
				{{ $t('calendar', 'New calendar') }}
			</ActionButton>
			<ActionInput v-if="showCreateCalendarInput"
				:aria-label="$t('calendar', 'Name for new calendar')"
				@submit.prevent.stop="createNewCalendar">
				<template #icon>
					<CalendarBlank :size="20" decorative />
				</template>
			</ActionInput>
			<ActionText v-if="showCreateCalendarSaving"
				icon="icon-loading-small">
				<!-- eslint-disable-next-line no-irregular-whitespace -->
				{{ $t('calendar', 'Creating calendar …') }}
			</ActionText>

			<ActionButton v-if="showCreateCalendarTaskListLabel"
				@click.prevent.stop="openCreateCalendarTaskListInput">
				<template #icon>
					<CalendarCheck :size="20" decorative />
				</template>
				{{ $t('calendar', 'New calendar with task list') }}
			</ActionButton>
			<ActionInput v-if="showCreateCalendarTaskListInput"
				:aria-label="$t('calendar', 'Name for new calendar')"
				@submit.prevent.stop="createNewCalendarTaskList">
				<template #icon>
					<CalendarCheck :size="20" decorative />
				</template>
			</ActionInput>
			<ActionText v-if="showCreateCalendarTaskListSaving"
				icon="icon-loading-small">
				<!-- eslint-disable-next-line no-irregular-whitespace -->
				{{ $t('calendar', 'Creating calendar …') }}
			</ActionText>

			<ActionSeparator v-if="canSubscribeLink" />
			<ActionButton v-if="showCreateSubscriptionLabel && canSubscribeLink"
				@click.prevent.stop="openCreateSubscriptionInput">
				<template #icon>
					<LinkVariant :size="20" decorative />
				</template>
				{{ $t('calendar', 'New subscription from link (read-only)') }}
			</ActionButton>
			<ActionInput v-if="showCreateSubscriptionInput"
				:aria-label="$t('calendar', 'Name for new calendar')"
				@submit.prevent.stop="createNewSubscription">
				<template #icon>
					<LinkVariant :size="20" decorative />
				</template>
			</ActionInput>
			<ActionText v-if="showCreateSubscriptionSaving"
				icon="icon-loading-small">
				<!-- eslint-disable-next-line no-irregular-whitespace -->
				{{ $t('calendar', 'Creating subscription …') }}
			</ActionText>
			<ActionButton v-if="canSubscribeLink" @click="showHolidaySubscriptionPicker = true">
				{{ t('calendar', 'Add public holiday calendar') }}
				<template #icon>
					<Web :size="20" decorative />
				</template>
			</ActionButton>
			<ActionButton v-if="hasPublicCalendars" @click="showPublicCalendarSubscriptionPicker = true">
				{{ t('calendar', 'Add custom public calendar') }}
				<template #icon>
					<Web :size="20" decorative />
				</template>
			</ActionButton>
		</template>
		<template #extra>
			<PublicCalendarSubscriptionPicker v-if="showHolidaySubscriptionPicker"
				:show-holidays="true"
				@close="showHolidaySubscriptionPicker = false" />
			<PublicCalendarSubscriptionPicker v-if="showPublicCalendarSubscriptionPicker"
				@close="showPublicCalendarSubscriptionPicker = false" />
		</template>
	</AppNavigationItem>
</template>

<script>
import {
	NcActionButton as ActionButton,
	NcActionInput as ActionInput,
	NcActionSeparator as ActionSeparator,
	NcActionText as ActionText,
	NcAppNavigationItem as AppNavigationItem,
} from '@nextcloud/vue'
import {
	showError,
} from '@nextcloud/dialogs'

import { uidToHexColor } from '../../../utils/color.js'

import CalendarBlank from 'vue-material-design-icons/CalendarBlank.vue'
import CalendarCheck from 'vue-material-design-icons/CalendarCheck.vue'
import LinkVariant from 'vue-material-design-icons/LinkVariant.vue'
import Plus from 'vue-material-design-icons/Plus.vue'
import Web from 'vue-material-design-icons/Web.vue'
import { mapState } from 'vuex'

export default {
	name: 'CalendarListNew',
	components: {
		ActionButton,
		ActionInput,
		ActionSeparator,
		ActionText,
		AppNavigationItem,
		CalendarBlank,
		CalendarCheck,
		PublicCalendarSubscriptionPicker: () => import(/* webpackChunkName: "public-calendar-subscription-picker" */ '../../Subscription/PublicCalendarSubscriptionPicker.vue'),
		LinkVariant,
		Plus,
		Web,
	},
	data() {
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
			showHolidaySubscriptionPicker: false,
			showPublicCalendarSubscriptionPicker: false,
		}
	},
	computed: {
		...mapState({
			canSubscribeLink: state => state.settings.canSubscribeLink,
			hasPublicCalendars: state => Boolean(state.settings.publicCalendars),
		}),
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
				showError(this.$t('calendar', 'An error occurred, unable to create the calendar.'))
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
				showError(this.$t('calendar', 'An error occurred, unable to create the calendar.'))
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
				showError(this.$t('calendar', 'Please enter a valid link (starting with http://, https://, webcal://, or webcals://)'))
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
				showError(this.$t('calendar', 'An error occurred, unable to create the calendar.'))
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
