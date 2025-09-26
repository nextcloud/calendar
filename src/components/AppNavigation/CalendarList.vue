<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="calendar-list-wrapper">
		<CalendarListNew />
		<template v-if="!isPublic">
			<draggable
				v-model="sortedCalendars.personal"
				:disabled="disableDragging"
				v-bind="{ swapThreshold: 0.30, delay: 500, delayOnTouchOnly: true, touchStartThreshold: 3 }"
				draggable=".draggable-calendar-list-item"
				@update="updateInput">
				<CalendarListItem
					v-for="calendar in sortedCalendars.personal"
					:key="calendar.id"
					class="draggable-calendar-list-item"
					:calendar="calendar" />
			</draggable>
		</template>
		<template v-else>
			<PublicCalendarListItem
				v-for="calendar in sortedCalendars.personal"
				:key="calendar.id"
				:calendar="calendar" />
		</template>

		<NcAppNavigationCaption v-if="sortedCalendars.shared.length" :name="$t('calendar', 'Shared calendars')" />
		<template v-if="!isPublic">
			<draggable
				v-model="sortedCalendars.shared"
				:disabled="disableDragging"
				v-bind="{ swapThreshold: 0.30, delay: 500, delayOnTouchOnly: true, touchStartThreshold: 3 }"
				draggable=".draggable-calendar-list-item"
				@update="updateInput">
				<CalendarListItem
					v-for="calendar in sortedCalendars.shared"
					:key="calendar.id"
					class="draggable-calendar-list-item"
					:calendar="calendar" />
			</draggable>
		</template>
		<template v-else>
			<PublicCalendarListItem
				v-for="calendar in sortedCalendars.shared"
				:key="calendar.id"
				:calendar="calendar" />
		</template>

		<NcAppNavigationCaption v-if="sortedCalendars.deck.length" :name="$t('calendar', 'Deck')" />
		<template v-if="!isPublic">
			<draggable
				v-model="sortedCalendars.deck"
				:disabled="disableDragging"
				v-bind="{ swapThreshold: 0.30, delay: 500, delayOnTouchOnly: true, touchStartThreshold: 3 }"
				draggable=".draggable-calendar-list-item"
				@update="updateInput">
				<CalendarListItem
					v-for="calendar in sortedCalendars.deck"
					:key="calendar.id"
					class="draggable-calendar-list-item"
					:calendar="calendar" />
			</draggable>
		</template>
		<template v-else>
			<PublicCalendarListItem
				v-for="calendar in sortedCalendars.deck"
				:key="calendar.id"
				:calendar="calendar" />
		</template>

		<NcAppNavigationSpacer />

		<!-- The header slot must be placed here, otherwise vuedraggable adds undefined as item to the array -->
		<template>
			<CalendarListItemLoadingPlaceholder v-if="loadingCalendars" />
		</template>
	</div>
</template>

<script>
import { showError } from '@nextcloud/dialogs'
import { NcAppNavigationCaption, NcAppNavigationSpacer } from '@nextcloud/vue'
import debounce from 'debounce'
import pLimit from 'p-limit'
import { mapState, mapStores } from 'pinia'
import draggable from 'vuedraggable'
import CalendarListItem from './CalendarList/CalendarListItem.vue'
import CalendarListItemLoadingPlaceholder from './CalendarList/CalendarListItemLoadingPlaceholder.vue'
import CalendarListNew from './CalendarList/CalendarListNew.vue'
import PublicCalendarListItem from './CalendarList/PublicCalendarListItem.vue'
import useCalendarsStore from '../../store/calendars.js'

const limit = pLimit(1)

export default {
	name: 'CalendarList',
	components: {
		CalendarListItem,
		CalendarListNew,
		CalendarListItemLoadingPlaceholder,
		PublicCalendarListItem,
		NcAppNavigationCaption,
		NcAppNavigationSpacer,
		draggable,
	},

	props: {
		isPublic: {
			type: Boolean,
			required: true,
		},

		loadingCalendars: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			calendars: [],
			/**
			 * Calendars sorted by personal, shared, and deck
			 */
			sortedCalendars: {
				personal: [],
				shared: [],
				deck: [],
			},

			disableDragging: false,
			showOrderModal: false,
		}
	},

	computed: {
		...mapStores(useCalendarsStore),
		...mapState(useCalendarsStore, {
			serverCalendars: 'sortedCalendarsSubscriptions',
		}),

		loadingKeyCalendars() {
			return this._uid + '-loading-placeholder-calendars'
		},
	},

	watch: {
		serverCalendars(val) {
			this.calendars = val
		},

		calendars() {
			this.sortCalendars()
		},
	},

	mounted() {
		this.calendarsStore.$onAction(({ name, args, after }) => {
			if (name === 'toggleCalendarEnabled') {
				after(() => {
					const calendar = this.calendars.find((calendar) => calendar.id === args[0].calendar.id)
					calendar.enabled = args[0].calendar.enabled
					this.sortCalendars()
					this.update()
				})
			}
		})
	},

	methods: {
		sortCalendars() {
			this.sortedCalendars = {
				personal: [],
				shared: [],
				deck: [],
			}

			this.calendars.forEach((calendar) => {
				if (calendar.isSharedWithMe) {
					this.sortedCalendars.shared.push(calendar)
					return
				}

				if (calendar.url.includes('app-generated--deck--board')) {
					this.sortedCalendars.deck.push(calendar)
					return
				}

				this.sortedCalendars.personal.push(calendar)
			})
		},

		updateInput: debounce(async function() {
			await this.update()
		}, 2500),

		async update() {
			this.disableDragging = true
			const currentCalendars = [
				...this.sortedCalendars.personal,
				...this.sortedCalendars.shared,
				...this.sortedCalendars.deck,
			]
			const newOrder = currentCalendars.reduce((newOrderObj, currentItem, currentIndex) => {
				newOrderObj[currentItem.id] = currentIndex
				return newOrderObj
			}, {})

			this.calendars = currentCalendars

			try {
				await limit(() => this.calendarsStore.updateCalendarListOrder({ newOrder }))
			} catch (err) {
				showError(this.$t('calendar', 'Could not update calendar order.'))
				// Reset calendar list order on error
				this.calendars = this.calendarsStore.sortedCalendarsSubscriptions
			} finally {
				this.disableDragging = false
			}
		},
	},
}
</script>
