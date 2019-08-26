<template>
	<div id="content" class="app-calendar">
		<app-navigation :loading-calendars="loadingCalendars" />
		<AppContent>
			<!-- Full calendar -->
			<full-calendar :events="events" :event-sources="eventSources" :config="config"
				:view="view" :firstDay="firstDay" />
		</AppContent>
		<!-- Edit modal -->
		<router-view />
	</div>
</template>

<script>
import AppNavigation from '../components/AppNavigation.vue'
import FullCalendar from '../components/FullCalendar.vue'
import { AppContent } from 'nextcloud-vue'

import client from '../services/cdav.js'
import getTimezoneManager from '../services/timezoneDataProviderService'
import { randomColor, generateTextColorFromRGB } from '../services/colorService'
// import fullCalendarEventService from '../services/fullCalendarEventService'

import moment from 'moment'
import { dateFactory, getUnixTimestampFromDate } from '../services/date'
import { getFCEventFromEventComponent } from '../services/fullCalendarEventService'
import { getConfigValueFromHiddenInput } from '../services/settingsService'

import debounce from 'debounce'

export default {
	name: 'Calendar',
	components: {
		AppContent,
		AppNavigation,
		FullCalendar
	},
	data() {
		return {
			loadingCalendars: true,
			timeFrameCacheExpiryJob: null
		}
	},
	computed: {
		// store getters
		calendars() {
			return this.$store.getters.getCalendars
		},
		events() {
			return []
		},
		eventSources() {
			return this.$store.getters.enabledCalendars.map((enabledCalendar) => ({
				id: enabledCalendar.id,
				// coloring
				backgroundColor: enabledCalendar.color,
				borderColor: enabledCalendar.color,
				textColor: generateTextColorFromRGB(enabledCalendar.color),
				// html foo
				className: enabledCalendar.id,
				editable: !enabledCalendar.readOnly,

				// events: fullCalendarEventService(enabledCalendar, (...args) => console.error(args)),
				events: ({ start, startStr, end, endStr, timeZone }, successCallback, failureCallback) => {
					const timezoneObject = getTimezoneManager().getTimezoneForId(timeZone)
					const timeRange = this.$store.getters.getTimeRangeForCalendarCoveringRange(enabledCalendar.id, getUnixTimestampFromDate(start), getUnixTimestampFromDate(end))
					if (!timeRange) {
						this.$store.dispatch('getEventsFromCalendarInTimeRange', {
							calendar: enabledCalendar,
							from: start,
							to: end
						}).then(() => {
							const timeRange = this.$store.getters.getTimeRangeForCalendarCoveringRange(enabledCalendar.id, getUnixTimestampFromDate(start), getUnixTimestampFromDate(end))
							const calendarObjects = this.$store.getters.getCalendarObjectsByTimeRangeId(timeRange.id)
							successCallback(getFCEventFromEventComponent(calendarObjects, start, end, timezoneObject))
						})
					} else {
						const calendarObjects = this.$store.getters.getCalendarObjectsByTimeRangeId(timeRange.id)
						successCallback(getFCEventFromEventComponent(calendarObjects, start, end, timezoneObject))
					}
				}
			}))
		},
		config() {
			return {
				timeZone: 'America/New_York',
				weekNumbers: this.$store.state.settings.showWeekNumbers,
				weekends: this.$store.state.settings.showWeekends,
				dayNames: dayNames,
				dayNamesShort: dayNamesMin,
				monthNames: monthNames,
				monthNamesShort: monthNamesShort,
				weekNumbersWithinDays: true,
				firstDay: +moment().startOf('week').format('d')
			}
		},
		view() {
			return this.$store.state.route.params.view
		},
		firstDay() {
			return this.$store.state.route.params.firstday
		}
	},
	beforeRouteUpdate(to, from, next) {
		next()
		this.saveNewView(to.params.view)
	},
	created() {
		this.timeFrameCacheExpiryJob = setInterval(() => {
			const timestamp = (getUnixTimestampFromDate(dateFactory()) - 60 * 10)
			const timeRanges = this.$store.getters.getAllTimeRangesOlderThan(timestamp)

			for (const timeRange of timeRanges) {
				this.$store.commit('removeTimeRange', timeRange.id)
				this.$store.commit('deleteFetchedTimeRangeFromCalendar', {
					calendar: {
						id: timeRange.calendarId
					},
					fetchedTimeRangeId: timeRange.id
				})
			}

			console.debug('Cleaned timeranges')
		}, 1000 * 60)
	},
	beforeMount() {
		this.$store.commit('loadSettingsFromServer', {
			appVersion: getConfigValueFromHiddenInput('app-version', String),
			firstRun: getConfigValueFromHiddenInput('first-run', Boolean),
			showWeekends: getConfigValueFromHiddenInput('show-weekends', Boolean),
			showWeekNumbers: getConfigValueFromHiddenInput('show-week-numbers', Boolean),
			skipPopover: getConfigValueFromHiddenInput('skip-popover', Boolean),
			timezone: getConfigValueFromHiddenInput('timezone', String)
		})

		console.debug(client)
		// get calendars then get events
		client.connect({ enableCalDAV: true })
			.then(() => this.$store.dispatch('fetchCurrentUserPrincipal'))
			.then(() => this.$store.dispatch('getCalendars'))
			.then((calendars) => {
				this.loadingCalendars = false

				const owners = []
				calendars.forEach((calendar) => {
					if (owners.indexOf(calendar.owner) === -1) {
						owners.push(calendar.owner)
					}
				})
				owners.forEach((owner) => {
					this.$store.dispatch('fetchPrincipalByUrl', owner)
				})

				// No calendars? Create a new one!
				if (calendars.length === 0) {
					this.loadingCalendars = true
					this.$store.dispatch('appendCalendar', {
						displayName: t('calendars', 'Personal'),
						color: randomColor(),
						order: 0
					}).then(() => {
						this.loadingCalendars = false
					})
				}
			})
	},
	methods: {
		saveNewView: debounce(function(initialView) {
			this.$store.dispatch('setInitialView', { initialView })
		}, 5000)
	}
}
</script>
