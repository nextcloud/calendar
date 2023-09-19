<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  - @author Georg Ehrke <oc.list@georgehrke.com>
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
import { mapGetters } from 'vuex'
import { showError } from '@nextcloud/dialogs'
import pLimit from 'p-limit'

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
		...mapGetters({
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
				await limit(() => this.$store.dispatch('updateCalendarListOrder', { newOrder }))
			} catch (err) {
				showError(this.$t('calendar', 'Could not update calendar order.'))
				// Reset calendar list order on error
				this.calendars = this.serverCalendars
			} finally {
				this.disableDragging = false
			}
		}, 2500),
	},
}
</script>
