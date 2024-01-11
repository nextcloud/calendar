<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<draggable v-model="calendars"
		:disabled="disableDragging"
		v-bind="{swapThreshold: 0.30, delay: 500, delayOnTouchOnly: true, touchStartThreshold: 3}"
		draggable=".draggable-calendar-list-item"
		@update="update">
		<template v-if="!isPublic">
			<CalendarListItem v-for="calendar in calendars"
				:key="calendar.id"
				class="draggable-calendar-list-item"
				:calendar="calendar" />
		</template>
		<template v-else>
			<PublicCalendarListItem v-for="calendar in calendars"
				:key="calendar.id"
				:calendar="calendar" />
		</template>
		<!-- The header slot must be placed here, otherwise vuedraggable adds undefined as item to the array -->
		<template #footer>
			<CalendarListItemLoadingPlaceholder v-if="loadingCalendars" />
		</template>
	</draggable>
</template>

<script>
import CalendarListItem from './CalendarList/CalendarListItem.vue'
import PublicCalendarListItem from './CalendarList/PublicCalendarListItem.vue'
import CalendarListItemLoadingPlaceholder from './CalendarList/CalendarListItemLoadingPlaceholder.vue'
import draggable from 'vuedraggable'
import debounce from 'debounce'
import { showError } from '@nextcloud/dialogs'
import pLimit from 'p-limit'
import { mapStores, mapState } from 'pinia'
import useCalendarsStore from '../../store/calendars.js'

const limit = pLimit(1)

export default {
	name: 'CalendarList',
	components: {
		CalendarListItem,
		CalendarListItemLoadingPlaceholder,
		PublicCalendarListItem,
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
			disableDragging: false,
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
	},
	methods: {
		update: debounce(async function() {
			this.disableDragging = true
			const newOrder = this.calendars.reduce((newOrderObj, currentItem, currentIndex) => {
				newOrderObj[currentItem.id] = currentIndex
				return newOrderObj
			}, {})

			try {
				await limit(() => this.calendarsStore.updateCalendarListOrder({ newOrder }))
			} catch (err) {
				showError(this.$t('calendar', 'Could not update calendar order.'))
				// Reset calendar list order on error
				this.calendars = this.calendarsStore.sortedCalendarsSubscriptions
			} finally {
				this.disableDragging = false
			}
		}, 2500),
	},
}
</script>
