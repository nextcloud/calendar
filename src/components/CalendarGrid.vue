<!--
  - @copyright Copyright (c) 2020 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Richard Steinmetz <richard@steinmetz.cloud>
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
	<FullCalendar ref="fullCalendar"
		:options="options" />
</template>

<script>
// Import FullCalendar itself
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'

// Import event sources
import eventSource from '../fullcalendar/eventSources/eventSource.js'

// Import interaction handlers
import eventAllow from '../fullcalendar/interaction/eventAllow.js'
import eventClick from '../fullcalendar/interaction/eventClick.js'
import eventDrop from '../fullcalendar/interaction/eventDrop.js'
import eventResize from '../fullcalendar/interaction/eventResize.js'
import navLinkDayClick from '../fullcalendar/interaction/navLinkDayClick.js'
import navLinkWeekClick from '../fullcalendar/interaction/navLinkWeekClick.js'
import select from '../fullcalendar/interaction/select.js'

// Import localization plugins
import { getDateFormattingConfig } from '../fullcalendar/localization/dateFormattingConfig.js'
import { getFullCalendarLocale } from '../fullcalendar/localization/localeProvider.js'
import momentPluginFactory from '../fullcalendar/localization/momentPlugin.js'

// Import rendering handlers
import dayHeaderDidMount from '../fullcalendar/rendering/dayHeaderDidMount.js'
import eventDidMount from '../fullcalendar/rendering/eventDidMount.js'
import eventOrder from '../fullcalendar/rendering/eventOrder.js'
import noEventsDidMount from '../fullcalendar/rendering/noEventsDidMount.js'

// Import timezone plugins
import VTimezoneNamedTimezone from '../fullcalendar/timezones/vtimezoneNamedTimezoneImpl.js'

// Import other dependencies
import { mapGetters, mapState } from 'vuex'
import debounce from 'debounce'
import { getLocale } from '@nextcloud/l10n'
import { getYYYYMMDDFromFirstdayParam } from '../utils/date.js'
import { getFirstDayOfWeekFromMomentLocale } from '../utils/moment.js'

export default {
	name: 'CalendarGrid',
	components: {
		FullCalendar,
	},
	props: {
		/**
		 * Whether or not the user is authenticated
		 */
		isAuthenticatedUser: {
			type: Boolean,
			required: true,
		},
	},
	data() {
		return {
			updateTodayJob: null,
			updateTodayJobPreviousDate: null,
		}
	},
	computed: {
		...mapGetters({
			timezoneId: 'getResolvedTimezone',
		}),
		...mapState({
			locale: (state) => state.settings.momentLocale,
			eventLimit: state => state.settings.eventLimit,
			skipPopover: state => state.settings.skipPopover,
			showWeekends: state => state.settings.showWeekends,
			showWeekNumbers: state => state.settings.showWeekNumbers,
			slotDuration: state => state.settings.slotDuration,
			showTasks: state => state.settings.showTasks,
			timezone: state => state.settings.timezone,
			modificationCount: state => state.calendarObjects.modificationCount,
		}),
		options() {
			return {
				// Initialization:
				initialDate: getYYYYMMDDFromFirstdayParam(this.$route.params.firstDay),
				initialView: this.$route.params.view,
				// Data
				eventSources: this.eventSources,
				// Plugins
				plugins: this.plugins,
				// Interaction
				editable: this.isEditable,
				selectable: this.isAuthenticatedUser,
				eventAllow,
				eventClick: eventClick(this.$store, this.$router, this.$route, window),
				eventDrop: (...args) => eventDrop(this.$store, this.$refs.fullCalendar.getApi())(...args),
				eventResize: eventResize(this.$store),
				navLinkDayClick: navLinkDayClick(this.$router, this.$route),
				navLinkWeekClick: navLinkWeekClick(this.$router, this.$route),
				select: select(this.$store, this.$router, this.$route, window),
				navLinks: true,
				// Localization
				...getDateFormattingConfig(),
				locale: getFullCalendarLocale(getLocale(), this.locale),
				firstDay: getFirstDayOfWeekFromMomentLocale(this.locale),
				// Rendering
				dayHeaderDidMount,
				eventDidMount,
				noEventsDidMount,
				// FIXME: remove title if upstream is fixed (https://github.com/fullcalendar/fullcalendar/issues/6608#issuecomment-954241059)
				eventOrder: (this.$route.params.view === 'timeGridWeek' ? ['title'] : []).concat(['start', '-duration', 'allDay', eventOrder]),
				forceEventDuration: false,
				headerToolbar: false,
				height: '100%',
				slotDuration: this.slotDuration,
				expandRows: true,
				weekNumbers: this.showWeekNumbers,
				weekends: this.showWeekends,
				dayMaxEventRows: this.eventLimit,
				selectMirror: true,
				lazyFetching: false,
				nowIndicator: true,
				progressiveEventRendering: true,
				unselectAuto: false,
				// Timezones:
				timeZone: this.timezoneId,
				// Disable jumping in week view and day view when clicking on any event using the simple editor
				scrollTimeReset: false,
			}
		},
		eventSources() {
			return this.$store.getters.enabledCalendars.map(eventSource(this.$store))
		},
		/**
		 * FullCalendar Plugins
		 *
		 * @return {(PluginDef)[]}
		 */
		plugins() {
			return [
				dayGridPlugin,
				interactionPlugin,
				listPlugin,
				timeGridPlugin,
				momentPluginFactory(this.$store),
				VTimezoneNamedTimezone,
			]
		},
		isEditable() {
			// We do not allow drag and drop when the editor is open.
			return this.isAuthenticatedUser
				&& this.$route.name !== 'EditPopoverView'
				&& this.$route.name !== 'EditSidebarView'
		},
	},
	watch: {
		modificationCount: debounce(function() {
			const calendarApi = this.$refs.fullCalendar.getApi()
			calendarApi.refetchEvents()
		}, 50),
	},
	/**
	 * FullCalendar 5 is using calculated px values for the width
	 * of its views.
	 * Hence a simple `width: 100%` won't assure that the calendar-grid
	 * is always using the full available width.
	 *
	 * Toggling the AppNavigation or AppSidebar will change the amount
	 * of available space, but it will not be covered by the window
	 * resize event, because the actual window size did not change.
	 *
	 * To make sure, that the calendar-grid is always using all space,
	 * we have to register a resize-observer here, that will automatically
	 * update the fullCalendar size, when the available space changes.
	 */
	mounted() {
		if (window.ResizeObserver) {
			const resizeObserver = new ResizeObserver(debounce(() => {
				this.$refs.fullCalendar
					.getApi()
					.updateSize()
			}, 100))

			resizeObserver.observe(this.$refs.fullCalendar.$el)
		}
	},
	async created() {
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

		/**
		 * This view is not used as a router view,
		 * hence we can't use beforeRouteUpdate directly.
		 */
		this.$router.beforeEach((to, from, next) => {
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
		})

		// Trigger the select event programmatically on initial page load to show the new event
		// in the grid. Wait for the next tick because the ref isn't available right away.
		await this.$nextTick()
		if (['NewPopoverView', 'NewSidebarView'].includes(this.$route.name)) {
			const start = new Date(parseInt(this.$route.params.dtstart) * 1000)
			const end = new Date(parseInt(this.$route.params.dtend) * 1000)
			if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
				const calendarApi = this.$refs.fullCalendar.getApi()
				calendarApi.select({
					start,
					end,
					allDay: this.$route.params.allDay === '1',
				})
			}
		}
	},
	methods: {
		/**
		 * When a user changes the view, remember it and
		 * use it the next time they open the calendar app
		 */
		saveNewView: debounce(function(initialView) {
			if (this.isAuthenticatedUser) {
				this.$store.dispatch('setInitialView', { initialView })
			}
		}, 5000),
	},
}
</script>

<style lang="scss">
@import '../fonts/scss/iconfont-calendar-app.scss';

.calendar-grid-checkbox {
	border-color: transparent;
	@include iconfont('checkbox');
}

.calendar-grid-checkbox-checked {
	border-color: transparent;
	@include iconfont('checkbox-checked');
}
</style>
