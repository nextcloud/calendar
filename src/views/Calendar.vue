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
	<Content app-name="calendar" :class="classNames">
		<AppNavigation v-if="!isEmbedded">
			<!-- Date Picker, View Buttons, Today Button -->
			<AppNavigationHeader />
			<!-- Calendar / Subscription List -->
			<CalendarList
				:is-public="!isAuthenticatedUser"
				:loading-calendars="loadingCalendars" />
			<!-- Settings and import -->
			<Settings
				v-if="isAuthenticatedUser"
				:loading-calendars="loadingCalendars" />
		</AppNavigation>
		<EmbedTopNavigation v-if="isEmbedded" />
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
				:unselect-auto="false"
				@eventClick="eventClick"
				@eventDrop="eventDrop"
				@eventResize="eventResize"
				@eventRender="eventRender"
				@select="select" />

			<EmptyCalendar
				v-if="showEmptyCalendarScreen" />
		</AppContent>
		<!-- Edit modal -->
		<router-view v-if="!loadingCalendars" />
	</Content>
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
import {
	AppNavigation,
	AppContent,
	Content
} from '@nextcloud/vue'
import debounce from 'debounce'
import { getRandomColor } from '../utils/color.js'
import client from '../services/caldavService.js'
import { getConfigValueFromHiddenInput } from '../utils/settings.js'
import {
	dateFactory,
	getUnixTimestampFromDate,
	getYYYYMMDDFromFirstdayParam
} from '../utils/date.js'
import eventAllow from '../fullcalendar/eventAllow'
import eventClick from '../fullcalendar/eventClick'
import eventDrop from '../fullcalendar/eventDrop'
import eventResize from '../fullcalendar/eventResize'
import eventSource from '../fullcalendar/eventSource'
import select from '../fullcalendar/select'
import VTimezoneNamedTimezone from '../fullcalendar/vtimezoneNamedTimezoneImpl'
import AppNavigationHeader from '../components/AppNavigation/AppNavigationHeader.vue'
import CalendarList from '../components/AppNavigation/CalendarList.vue'
import Settings from '../components/AppNavigation/Settings.vue'
import {
	mapGetters,
	mapState
} from 'vuex'
import eventRender from '../fullcalendar/eventRender.js'
import EmbedTopNavigation from '../components/AppNavigation/EmbedTopNavigation.vue'
import EmptyCalendar from '../components/EmptyCalendar.vue'

export default {
	name: 'Calendar',
	components: {
		EmptyCalendar,
		EmbedTopNavigation,
		Settings,
		CalendarList,
		AppNavigationHeader,
		Content,
		AppContent,
		AppNavigation,
		FullCalendar
	},
	data() {
		return {
			loadingCalendars: true,
			timeFrameCacheExpiryJob: null,
			showEmptyCalendarScreen: false
		}
	},
	computed: {
		...mapGetters({
			timezoneId: 'getResolvedTimezone'
		}),
		...mapState({
			skipPopover: state => state.settings.skipPopover,
			showWeekends: state => state.settings.showWeekends,
			showWeekNumbers: state => state.settings.showWeekNumbers,
			timezone: state => state.settings.timezone,
			modificationCount: state => state.calendarObjects.modificationCount
		}),
		defaultDate() {
			return getYYYYMMDDFromFirstdayParam(this.$route.params.firstDay)
		},
		defaultView() {
			return this.$route.params.view
		},
		eventSources() {
			return this.$store.getters.enabledCalendars.map(eventSource(this.$store))
		},
		slotDuration() {
			return '00:15:00'
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
				&& !this.isEmbedded
				&& this.$route.name !== 'EditPopoverView'
				&& this.$route.name !== 'EditSidebarView'
		},
		isSelectable() {
			return !this.isPublicShare && !this.isEmbedded
		},
		isAuthenticatedUser() {
			return !this.isPublicShare && !this.isEmbedded
		},
		isPublicShare() {
			return this.$route.name.startsWith('Public')
		},
		isEmbedded() {
			return this.$route.name.startsWith('Embed')
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
		if (to.params.firstDay !== from.params.firstDay) {
			let calendarApi = this.$refs.fullCalendar.getApi()
			calendarApi.gotoDate(getYYYYMMDDFromFirstdayParam(to.params.firstDay))
		}
		if (to.params.view !== from.params.view) {
			let calendarApi = this.$refs.fullCalendar.getApi()
			calendarApi.changeView(to.params.view)
			this.saveNewView(to.params.view)
		}

		if ((from.name === 'NewPopoverView' || from.name === 'NewSidebarView')
			&& to.name !== 'NewPopoverView'
			&& to.name !== 'NewSidebarView') {
			let calendarApi = this.$refs.fullCalendar.getApi()
			calendarApi.unselect()
		}

		next()

		next()
	},
	watch: {
		modificationCount: debounce(function() {
			let calendarApi = this.$refs.fullCalendar.getApi()
			calendarApi.refetchEvents()
		}, 50)
	},
	created() {
		this.timeFrameCacheExpiryJob = setInterval(() => {
			const timestamp = (getUnixTimestampFromDate(dateFactory()) - 60 * 10)
			const timeRanges = this.$store.getters.getAllTimeRangesOlderThan(timestamp)

			for (const timeRange of timeRanges) {
				this.$store.commit('removeTimeRange', {
					timeRangeId: timeRange.id
				})
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
		this.$store.dispatch('initializeCalendarJsConfig')

		if (this.$route.name.startsWith('Public') || this.$route.name.startsWith('Embed')) {
			client._createPublicCalendarHome()
			const tokens = this.$route.params.tokens.split('-')
			this.$store.dispatch('getPublicCalendars', { tokens })
				.then((calendars) => {
					this.loadingCalendars = false

					if (calendars.length === 0) {
						this.showEmptyCalendarScreen = true
					}
				})
		} else {
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
						this.$store.dispatch('fetchPrincipalByUrl', {
							url: owner
						})
					})

					const writeableCalendarIndex = calendars.findIndex((calendar) => {
						return !calendar.readOnly
					})

					// No writeable calendars? Create a new one!
					if (writeableCalendarIndex === -1) {
						this.loadingCalendars = true
						this.$store.dispatch('appendCalendar', {
							displayName: this.$t('calendars', 'Personal'),
							color: getRandomColor(), // TODO - use uid2color
							order: 0
						}).then(() => {
							this.loadingCalendars = false
						})
					}

					this.loadingCalendars = false
				})
		}
	},
	methods: {
		saveNewView: debounce(function(initialView) {
			if (this.isAuthenticatedUser) {
				this.$store.dispatch('setInitialView', { initialView })
			}
		}, 5000),
		eventClick(...args) {
			return eventClick(this.$store, this.$router, this.$route, window)(...args)
		},
		eventDrop(...args) {
			return eventDrop(this.$store, this.$refs.fullCalendar.getApi())(...args)
		},
		eventResize(...args) {
			return eventResize(this.$store)(...args)
		},
		select(...args) {
			return select(this.$store, this.$router)(...args)
		},
		eventRender(...args) {
			return eventRender(...args)
		}
	}
}
</script>
