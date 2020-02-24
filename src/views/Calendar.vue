<!--
  - @copyright Copyright (c) 2020 Georg Ehrke <oc.list@georgehrke.com>
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
			<AppNavigationHeader :is-public="!isAuthenticatedUser" />
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
				:height="windowResize"
				:slot-duration="slotDuration"
				:week-numbers="showWeekNumbers"
				:weekends="showWeekends"
				:event-sources="eventSources"
				:event-order="eventOrder"
				:plugins="plugins"
				:time-zone="timezoneId"
				:day-render="dayRender"
				:event-allow="eventAllow"
				:event-limit="true"
				:event-limit-text="eventLimitText"
				:default-date="defaultDate"
				:locales="locales"
				:locale="fullCalendarLocale"
				:first-day="firstDay"
				:selectable="isSelectable"
				:time-grid-event-min-height="16"
				:select-mirror="true"
				:lazy-fetching="false"
				:nav-links="true"
				:nav-link-day-click="navLinkDayClick"
				:nav-link-week-click="navLinkWeekClick"
				:now-indicator="true"
				:progressive-event-rendering="true"
				:unselect-auto="false"
				:week-numbers-within-days="true"
				:event-render="eventRender"
				@eventClick="eventClick"
				@eventDrop="eventDrop"
				@eventResize="eventResize"
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
import { AppNavigation } from '@nextcloud/vue/dist/Components/AppNavigation'
import { AppContent } from '@nextcloud/vue/dist/Components/AppContent'
import { Content } from '@nextcloud/vue/dist/Components/Content'
import debounce from 'debounce'
import { uidToHexColor } from '../utils/color.js'
import client from '../services/caldavService.js'
import { getConfigValueFromHiddenInput } from '../utils/settings.js'
import {
	dateFactory,
	getUnixTimestampFromDate,
	getYYYYMMDDFromFirstdayParam,
} from '../utils/date.js'
import eventAllow from '../fullcalendar/eventAllow'
import eventClick from '../fullcalendar/eventClick'
import eventDrop from '../fullcalendar/eventDrop'
import eventOrder from '../fullcalendar/eventOrder'
import eventResize from '../fullcalendar/eventResize'
import eventSource from '../fullcalendar/eventSource'
import navLinkDayClick from '../fullcalendar/navLinkDayClick.js'
import navLinkWeekClick from '../fullcalendar/navLinkWeekClick'
import select from '../fullcalendar/select'
import VTimezoneNamedTimezone from '../fullcalendar/vtimezoneNamedTimezoneImpl'
import AppNavigationHeader from '../components/AppNavigation/AppNavigationHeader.vue'
import CalendarList from '../components/AppNavigation/CalendarList.vue'
import Settings from '../components/AppNavigation/Settings.vue'
import getTimezoneManager from '../services/timezoneDataProviderService'
import {
	mapGetters,
	mapState,
} from 'vuex'
import eventRender from '../fullcalendar/eventRender.js'
import EmbedTopNavigation from '../components/AppNavigation/EmbedTopNavigation.vue'
import EmptyCalendar from '../components/EmptyCalendar.vue'
import { getLocale } from '@nextcloud/l10n'
import loadMomentLocalization from '../utils/moment.js'
import eventLimitText from '../fullcalendar/eventLimitText.js'
import windowResize from '../fullcalendar/windowResize.js'
import dayRender from '../fullcalendar/dayRender.js'

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
		FullCalendar,
	},
	data() {
		return {
			loadingCalendars: true,
			timeFrameCacheExpiryJob: null,
			updateTodayJob: null,
			updateTodayJobPreviousDate: null,
			showEmptyCalendarScreen: false,
			fullCalendarLocale: 'en',
			locales: [],
			firstDay: 0,
		}
	},
	computed: {
		...mapGetters({
			timezoneId: 'getResolvedTimezone',
		}),
		...mapState({
			skipPopover: state => state.settings.skipPopover,
			showWeekends: state => state.settings.showWeekends,
			showWeekNumbers: state => state.settings.showWeekNumbers,
			timezone: state => state.settings.timezone,
			modificationCount: state => state.calendarObjects.modificationCount,
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
				VTimezoneNamedTimezone,
			]
		},
		eventAllow() {
			return eventAllow
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
		},
		eventOrder() {
			return ['start', '-duration', 'allDay', eventOrder]
		},
	},
	beforeRouteUpdate(to, from, next) {
		if (to.params.firstDay !== from.params.firstDay) {
			const calendarApi = this.$refs.fullCalendar.getApi()
			calendarApi.gotoDate(getYYYYMMDDFromFirstdayParam(to.params.firstDay))
		}
		if (to.params.view !== from.params.view) {
			const calendarApi = this.$refs.fullCalendar.getApi()
			calendarApi.changeView(to.params.view)
			this.saveNewView(to.params.view)
		}

		if ((from.name === 'NewPopoverView' || from.name === 'NewSidebarView')
			&& to.name !== 'NewPopoverView'
			&& to.name !== 'NewSidebarView') {
			const calendarApi = this.$refs.fullCalendar.getApi()
			calendarApi.unselect()
		}

		next()

		next()
	},
	watch: {
		modificationCount: debounce(function() {
			const calendarApi = this.$refs.fullCalendar.getApi()
			calendarApi.refetchEvents()
		}, 50),
	},
	created() {
		this.timeFrameCacheExpiryJob = setInterval(() => {
			const timestamp = (getUnixTimestampFromDate(dateFactory()) - 60 * 10)
			const timeRanges = this.$store.getters.getAllTimeRangesOlderThan(timestamp)

			for (const timeRange of timeRanges) {
				this.$store.commit('removeTimeRange', {
					timeRangeId: timeRange.id,
				})
				this.$store.commit('deleteFetchedTimeRangeFromCalendar', {
					calendar: {
						id: timeRange.calendarId,
					},
					fetchedTimeRangeId: timeRange.id,
				})
			}
		}, 1000 * 60)

		this.updateTodayJob = setInterval(() => {
			const newDate = getYYYYMMDDFromFirstdayParam('now')

			if (this.updateTodayJobPreviousDate === null) {
				this.updateTodayJobPreviousDate = newDate
				return
			}

			if (this.updateTodayJobPreviousDate !== newDate) {
				this.updateTodayJobPreviousDate = newDate

				const calendarApi = this.$refs.fullCalendar.getApi()
				calendarApi.render()
			}
		}, 1000)
	},
	async beforeMount() {
		this.$store.commit('loadSettingsFromServer', {
			appVersion: getConfigValueFromHiddenInput('app-version'),
			firstRun: getConfigValueFromHiddenInput('first-run') === 'true',
			showWeekends: getConfigValueFromHiddenInput('show-weekends') === 'true',
			showWeekNumbers: getConfigValueFromHiddenInput('show-week-numbers') === 'true',
			skipPopover: getConfigValueFromHiddenInput('skip-popover') === 'true',
			talkEnabled: getConfigValueFromHiddenInput('talk-enabled') === 'true',
			timezone: getConfigValueFromHiddenInput('timezone'),
		})
		this.$store.dispatch('initializeCalendarJsConfig')

		if (this.$route.name.startsWith('Public') || this.$route.name.startsWith('Embed')) {
			client._createPublicCalendarHome()
			const tokens = this.$route.params.tokens.split('-')
			const calendars = await this.$store.dispatch('getPublicCalendars', { tokens })
			this.loadingCalendars = false

			if (calendars.length === 0) {
				this.showEmptyCalendarScreen = true
			}
		} else {
			await client.connect({ enableCalDAV: true })
			await this.$store.dispatch('fetchCurrentUserPrincipal')
			const calendars = await this.$store.dispatch('getCalendars')
			const owners = []
			calendars.forEach((calendar) => {
				if (owners.indexOf(calendar.owner) === -1) {
					owners.push(calendar.owner)
				}
			})
			owners.forEach((owner) => {
				this.$store.dispatch('fetchPrincipalByUrl', {
					url: owner,
				})
			})

			const writeableCalendarIndex = calendars.findIndex((calendar) => {
				return !calendar.readOnly
			})

			// No writeable calendars? Create a new one!
			if (writeableCalendarIndex === -1) {
				this.loadingCalendars = true
				await this.$store.dispatch('appendCalendar', {
					displayName: this.$t('calendars', 'Personal'),
					color: uidToHexColor(this.$t('calendars', 'Personal')),
					order: 0,
				})
			}

			this.loadingCalendars = false
		}
	},
	async mounted() {
		if (this.timezone === 'automatic' && this.timezoneId === 'UTC') {
			const { toastElement }
				= this.$toast.warning(this.$t('calendar', 'The automatic timezone detection determined your timezone to be UTC.\nThis is most likely the result of security measures of your web browser.\nPlease set your timezone manually in the calendar settings.'), { timeout: 60 })

			toastElement.classList.add('toast-calendar-multiline')
		}
		if (getTimezoneManager().getTimezoneForId(this.timezoneId) === null) {
			const { toastElement }
				= this.$toast.warning(this.$t('calendar', 'Your configured timezone ({timezoneId}) was not found. Falling back to UTC.\nPlease change your timezone in the settings and report this issue.', { timezoneId: this.timezoneId }), { timeout: 60 })

			toastElement.classList.add('toast-calendar-multiline')
		}

		this.loadFullCalendarLocale()
		this.loadMomentLocale()
	},
	methods: {
		saveNewView: debounce(function(initialView) {
			if (this.isAuthenticatedUser) {
				this.$store.dispatch('setInitialView', { initialView })
			}
		}, 5000),
		dayRender(...args) {
			return dayRender(...args)
		},
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
			return select(this.$store, this.$router, this.$route, window)(...args)
		},
		eventRender(...args) {
			return eventRender(...args)
		},
		navLinkDayClick(...args) {
			return navLinkDayClick(this.$router, this.$route)(...args)
		},
		navLinkWeekClick(...args) {
			return navLinkWeekClick(this.$router, this.$route)(...args)
		},
		eventLimitText(...args) {
			return eventLimitText(...args)
		},
		windowResize(...args) {
			return windowResize(window, document.querySelector('#header'))(...args)
		},
		/**
		 * Loads the locale data for full-calendar
		 *
		 * @returns {Promise<void>}
		 */
		async loadFullCalendarLocale() {
			let locale = getLocale().replace('_', '-').toLowerCase()
			try {
				// try to load the default locale first
				const fcLocale = await import('@fullcalendar/core/locales/' + locale)
				this.locales.push(fcLocale)
				// We have to update firstDay manually till https://github.com/fullcalendar/fullcalendar-vue/issues/36 is fixed
				this.firstDay = fcLocale.week.dow
				this.fullCalendarLocale = locale
			} catch (e) {
				try {
					locale = locale.split('-')[0]
					const fcLocale = await import('@fullcalendar/core/locales/' + locale)
					this.locales.push(fcLocale)
					// We have to update firstDay manually till https://github.com/fullcalendar/fullcalendar-vue/issues/36 is fixed
					this.firstDay = fcLocale.week.dow
					this.fullCalendarLocale = locale
				} catch (e) {
					console.debug('falling back to english locale')
				}
			}
		},
		/**
		 * Loads the locale data for moment.js
		 *
		 * @returns {Promise<void>}
		 */
		async loadMomentLocale() {
			const momentLocale = await loadMomentLocalization()
			this.$store.commit('setMomentLocale', momentLocale)
		},
	},
}
</script>
