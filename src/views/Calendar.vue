<template>
	<div id="content" class="app-calendar" :class="classNames">
		<app-navigation :loading-calendars="loadingCalendars" />
		<AppContent>
			<!-- Full calendar -->
			<FullCalendar
				ref="fullCalendar"
				:default-view="defaultView"
				:editable="isEditable"
				:force-event-duration="true"
				:header="showHeader"
				height="parent"
				:slot-duration="slotDuration"
				:week-numbers="showWeekNumbers"
				:weekends="showWeekends"
				:event-sources="eventSources"
				:plugins="plugins"
				:time-zone="timezoneId"
				:event-allow="eventAllow"
				:default-date="defaultDate"
				:locales="locales"
				:locale="locale"
				:selectable="isSelectable"
				:select-mirror="true"
				:lazy-fetching="false"
				:progressive-event-rendering="true"
				@eventClick="eventClick"
				@eventDrop="eventDrop"
				@eventResize="eventResize"
				@select="select"
			/>
		</AppContent>
		<!-- Edit modal -->
		<router-view v-if="!loadingCalendars" />
	</div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue'
import '@fullcalendar/core/main.css'
import dayGridPlugin from '@fullcalendar/daygrid'
import '@fullcalendar/daygrid/main.css'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import '@fullcalendar/list/main.css'
import timeGridPlugin from '@fullcalendar/timegrid'
import '@fullcalendar/timegrid/main.css'
import allLocales from '@fullcalendar/core/locales-all'

import AppNavigation from '../components/AppNavigation.vue'
import { AppContent } from 'nextcloud-vue'
import { randomColor } from '../services/colorService'
import client from '../services/cdav.js'

import debounce from 'debounce'

import {
	dateFactory,
	getUnixTimestampFromDate,
	getYYYYMMDDFromFirstdayParam
} from '../services/date'

import { getConfigValueFromHiddenInput } from '../services/settingsService'

import eventAllow from '../fullcalendar/eventAllow'
import eventClick from '../fullcalendar/eventClick'
import eventDrop from '../fullcalendar/eventDrop'
import eventResize from '../fullcalendar/eventResize'
import eventSource from '../fullcalendar/eventSource'
import select from '../fullcalendar/select'

import VTimezoneNamedTimezone from '../fullcalendar/vtimezoneNamedTimezoneImpl'

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
		defaultView() {
			return this.$route.params.view
		},
		eventSources() {
			return this.$store.getters.enabledCalendars.map(eventSource(this.$store))
		},
		defaultDate() {
			return getYYYYMMDDFromFirstdayParam(this.$route.params.firstday)
		},
		slotDuration() {
			return '00:15:00'
		},
		showWeekNumbers() {
			return this.$store.state.settings.settings.showWeekNumbers
		},
		showWeekends() {
			return this.$store.state.settings.settings.showWeekends
		},
		plugins() {
			return [
				dayGridPlugin,
				interactionPlugin,
				listPlugin,
				timeGridPlugin,
				VTimezoneNamedTimezone
			]
		},
		timezoneId() {
			return this.$store.getters.getResolvedTimezone
		},
		eventAllow() {
			return eventAllow
		},
		locales() {
			return allLocales
		},
		locale() {
			return 'en'
		},
		isEditable() {
			// We do not allow drag and drop when the editor is open.
			return !this.isPublicShare
				&& this.$route.name !== 'EditPopoverView'
				&& this.$route.name !== 'EditSidebarView'
		},
		isSelectable() {
			return !this.isPublicShare
		},
		isPublicShare() {
			return false
		},
		isEmbedded() {
			return false
		},
		showHeader() {
			return this.isPublicShare && this.isEmbedded
		},
		classNames() {
			if (this.isEmbedded) {
				return 'app-calendar-public-embedded'
			}
			if (this.isPublicShare) {
				return 'app-calendar-public'
			}

			return null
		}
	},
	beforeRouteUpdate(to, from, next) {
		if (to.params.firstday !== from.params.firstday) {
			let calendarApi = this.$refs.fullCalendar.getApi()
			calendarApi.gotoDate(getYYYYMMDDFromFirstdayParam(to.params.firstday))
		}
		if (to.params.view !== from.params.view) {
			let calendarApi = this.$refs.fullCalendar.getApi()
			calendarApi.changeView(to.params.view)
			this.saveNewView(to.params.view)
		}

		next()
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
		}, 1000 * 60)
	},
	beforeMount() {
		this.$store.commit('loadSettingsFromServer', {
			appVersion: getConfigValueFromHiddenInput('app-version'),
			firstRun: getConfigValueFromHiddenInput('first-run') === 'true',
			showWeekends: getConfigValueFromHiddenInput('show-weekends') === 'true',
			showWeekNumbers: getConfigValueFromHiddenInput('show-week-numbers') === 'true',
			skipPopover: getConfigValueFromHiddenInput('skip-popover') === 'true',
			timezone: getConfigValueFromHiddenInput('timezone')
		})

		// get calendars then get events
		client.connect({ enableCalDAV: true })
			.then(() => this.$store.dispatch('fetchCurrentUserPrincipal'))
			.then(() => this.$store.dispatch('getCalendars'))
			.then((calendars) => {
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

				this.loadingCalendars = false
			})
	},
	methods: {
		saveNewView: debounce(function(initialView) {
			this.$store.dispatch('setInitialView', { initialView })
		}, 5000),
		eventClick(...args) {
			return eventClick(this.$store, this.$router)(...args)
		},
		eventDrop(...args) {
			return eventDrop(this.$store)(...args)
		},
		eventResize(...args) {
			return eventResize(this.$store)(...args)
		},
		select(...args) {
			return select(this.$store, this.$router)(...args)
		}
	}
}
</script>
