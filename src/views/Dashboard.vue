<!--
	- @copyright Copyright (c) 2020 Julius Härtl <jus@bitgrid.net>
	-
	- @author Julius Härtl <jus@bitgrid.net>
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
	<DashboardWidget id="calendar_panel"
		:items="items"
		:loading="loading">
		<template #default="{ item }">
			<EmptyContent v-if="item.isEmptyItem"
				id="calendar-widget-empty-content"
				class="half-screen"
				:name="t('calendar', 'No more events today')">
				<template #icon>
					<IconCheck :size="67" />
				</template>
			</EmptyContent>
			<DashboardWidgetItem v-else
				:main-text="item.mainText"
				:sub-text="item.subText"
				:target-url="item.targetUrl">
				<template #avatar>
					<div v-if="item.componentName === 'VEVENT'"
						class="calendar-dot"
						:style="{'background-color': item.calendarColor}"
						:name="item.calendarDisplayName" />
					<IconCheckbox v-else
						:fill-color="item.calendarColor" />
				</template>
			</DashboardWidgetItem>
		</template>
		<template #empty-content>
			<EmptyContent id="calendar-widget-empty-content"
				:name="t('calendar', 'No upcoming events')">
				<template #icon>
					<EmptyCalendar />
				</template>
			</EmptyContent>
			<div class="empty-label">
				<NcButton type="secondary" :href="clickStartNew">
					{{ t('calendar', 'Create a new event') }}
				</NcButton>
			</div>
		</template>
	</DashboardWidget>
</template>

<script>
import { DashboardWidget, DashboardWidgetItem } from '@nextcloud/vue-dashboard'
import { NcEmptyContent as EmptyContent, NcButton } from '@nextcloud/vue'
import EmptyCalendar from 'vue-material-design-icons/CalendarBlankOutline.vue'
import IconCheck from 'vue-material-design-icons/Check.vue'
import IconCheckbox from 'vue-material-design-icons/CheckboxBlankOutline.vue'
import { loadState } from '@nextcloud/initial-state'
import moment from '@nextcloud/moment'
import { imagePath, generateUrl } from '@nextcloud/router'
import { initializeClientForUserView } from '../services/caldavService.js'
import { dateFactory } from '../utils/date.js'
import pLimit from 'p-limit'
import { eventSourceFunction } from '../fullcalendar/eventSources/eventSourceFunction.js'
import loadMomentLocalization from '../utils/moment.js'
import { DateTimeValue } from '@nextcloud/calendar-js'
import { mapGetters } from 'vuex'

export default {
	name: 'Dashboard',
	components: {
	  DashboardWidget,
		DashboardWidgetItem,
	  NcButton,
		EmptyContent,
	  EmptyCalendar,
	  IconCheck,
	  IconCheckbox,
	},
	data() {
		return {
			events: null,
			locale: 'en',
			imagePath: imagePath('calendar', 'illustrations/calendar'),
			loading: true,
			now: dateFactory(),
		}
	},
	computed: {
		...mapGetters({
			timezoneObject: 'getResolvedTimezoneObject',
		}),
		/**
		 * Format loaded events
		 *
		 * @return {Array}
		 */
		items() {
			if (!Array.isArray(this.events) || this.events.length === 0) {
				return []
			}

			const firstEvent = this.events[0]
			const endOfToday = moment(this.now).endOf('day')
			if (endOfToday.isBefore(firstEvent.startDate)) {
				return [{
					isEmptyItem: true,
				}].concat(this.events.slice(0, 4))
			}

			return this.events
		},
		/**
		 * Redirects to the new event route
		 *
		 * @return {string}
		 */
		clickStartNew() {
			return generateUrl('apps/calendar') + '/new'
		},
	},
	mounted() {
		this.initialize()
	},
	methods: {
		/**
		 * Initialize the widget
		 */
		async initialize() {
			const start = dateFactory()
			const end = dateFactory()
			end.setDate(end.getDate() + 14)

			const startOfToday = moment(start).startOf('day').toDate()

			await this.initializeEnvironment()
			const expandedEvents = await this.fetchExpandedEvents(start, end)
			this.events = await this.formatEvents(expandedEvents, startOfToday)
			this.loading = false
		},
		/**
		 * Initialize everything necessary,
		 * before we can fetch events
		 *
		 * @return {Promise<void>}
		 */
		async initializeEnvironment() {
			await initializeClientForUserView()
			await this.$store.dispatch('fetchCurrentUserPrincipal')
			await this.$store.dispatch('loadCollections')

			const {
				show_tasks: showTasks,
				timezone,
			} = loadState('calendar', 'dashboard_data')
			const locale = await loadMomentLocalization()

			this.$store.commit('loadSettingsFromServer', {
				timezone,
				showTasks,
			})
			this.$store.commit('setMomentLocale', {
				locale,
			})
		},
		/**
		 * Fetch events
		 *
		 * @param {Date} from Start of time-range
		 * @param {Date} to End of time-range
		 * @return {Promise<object[]>}
		 */
		async fetchExpandedEvents(from, to) {
			const limit = pLimit(10)
			const fetchEventPromises = []
			for (const calendar of this.$store.getters.enabledCalendars) {
				fetchEventPromises.push(limit(async () => {
					let timeRangeId
					try {
						timeRangeId = await this.$store.dispatch('getEventsFromCalendarInTimeRange', {
							calendar,
							from,
							to,
						})
					} catch (e) {
						return []
					}

					const calendarObjects = this.$store.getters.getCalendarObjectsByTimeRangeId(timeRangeId)
					return eventSourceFunction(calendarObjects, calendar, from, to, this.timezoneObject)
				}))
			}

			const expandedEvents = await Promise.all(fetchEventPromises)
			return expandedEvents.flat()
		},
		/**
		 * @param {object[]} expandedEvents Array of fullcalendar events
		 * @param {Date} filterBefore filter events that start before date
		 * @return {object[]}
		 */
		formatEvents(expandedEvents, filterBefore) {
			return expandedEvents
				.sort((a, b) => a.start.getTime() - b.start.getTime())
				.filter(event => !event.classNames.includes('fc-event-nc-task-completed'))
				.filter(event => !event.classNames.includes('fc-event-nc-cancelled'))
				.filter(event => filterBefore.getTime() <= event.start.getTime())
				.slice(0, 7)
				.map((event) => ({
					isEmptyItem: false,
					componentName: event.extendedProps.objectType,
					targetUrl: event.extendedProps.objectType === 'VEVENT'
						? this.getCalendarAppUrl(event)
						: this.getTasksAppUrl(event),
					subText: this.formatSubtext(event),
					mainText: event.title,
					startDate: event.start,
					calendarColor: this.$store.state.calendars.calendarsById[event.extendedProps.calendarId].color,
					calendarDisplayName: this.$store.state.calendars.calendarsById[event.extendedProps.calendarId].displayname,
				}))
		},
		/**
		 * @param {object} event The full-calendar formatted event
		 * @return {string}
		 */
		formatSubtext(event) {
			const locale = this.$store.state.settings.momentLocale

			if (event.allDay) {
				return moment(event.start).locale(locale).calendar(null, {
					// TRANSLATORS Please translate only the text in brackets and keep the brackets!
					sameDay: t('calendar', '[Today]'),
					// TRANSLATORS Please translate only the text in brackets and keep the brackets!
					nextDay: t('calendar', '[Tomorrow]'),
					nextWeek: 'dddd',
					// TRANSLATORS Please translate only the text in brackets and keep the brackets!
					lastDay: t('calendar', '[Yesterday]'),
					// TRANSLATORS Please translate only the text in brackets and keep the brackets!
					lastWeek: t('calendar', '[Last] dddd'),
					sameElse: () => '[replace-from-now]',
				}).replace('replace-from-now', moment(event.start).locale(locale).fromNow())
			} else {
				const start = DateTimeValue.fromJSDate(event.start).getInTimezone(this.timezoneObject)
				const utcOffset = start.utcOffset() / 60
				return moment(event.start)
					.utcOffset(utcOffset)
					.locale(locale)
					.calendar(null, {
						sameElse: () => '[replace-from-now]',
					})
					.replace(
						'replace-from-now',
						moment(event.start).utcOffset(utcOffset).locale(locale).fromNow(),
					)
			}
		},
		/**
		 * @param {object} data The data destructuring object
		 * @param {object} data.extendedProps Extended Properties of the FC object
		 * @return {string}
		 */
		getCalendarAppUrl({ extendedProps }) {
			return generateUrl('apps/calendar') + '/edit/' + extendedProps.objectId + '/' + extendedProps.recurrenceId
		},
		/**
		 * @param {object} data The data destructuring object
		 * @param {object} data.extendedProps Extended Properties of the FC object
		 * @return {string}
		 */
		getTasksAppUrl({ extendedProps }) {
			const davUrlParts = extendedProps.davUrl.split('/')
			const taskId = davUrlParts.pop()
			const calendarId = davUrlParts.pop()
			return generateUrl('apps/tasks') + `/#/calendars/${calendarId}/tasks/${taskId}`
		},
	},
}
</script>

<style lang="scss">
#calendar_panel {
	.calendar-dot {
		flex-shrink: 0;
		height: 1rem;
		width: 1rem;
		margin-top: 0.2rem;
		border-radius: 50%;
	}

	#calendar-widget-empty-content {
		text-align: center;
		margin-top: 5vh;

		&.half-screen {
			margin-top: 0;
			height: 120px;
			margin-bottom: 2vh;
		}

	}

	.empty-label {
		display: flex;
		justify-content: center;
		margin-top: 5vh;
	}
}
</style>
