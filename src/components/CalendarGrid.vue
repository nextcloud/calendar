<!--
  - SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<FullCalendar ref="fullCalendar"
		:class="isWidget? 'fullcalendar-widget': ''"
		:options="options" />
</template>

<script>
// Import FullCalendar itself
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'
import multiMonthPlugin from '@fullcalendar/multimonth'

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
import debounce from 'debounce'
import { getYYYYMMDDFromFirstdayParam } from '../utils/date.js'
import useCalendarsStore from '../store/calendars.js'
import useSettingsStore from '../store/settings.js'
import useCalendarObjectsStore from '../store/calendarObjects.js'
import useWidgetStore from '../store/widget.js'
import { mapStores, mapState } from 'pinia'

export default {
	name: 'CalendarGrid',
	components: {
		FullCalendar,
	},
	props: {
		isWidget: {
			type: Boolean,
			default: false,
		},
		url: {
			type: String,
			required: false,
		},
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
		...mapStores(useCalendarsStore, useSettingsStore, useCalendarObjectsStore),
		...mapState(useSettingsStore, {
			locale: 'momentLocale',
			timezoneId: 'getResolvedTimezone',
		}),
		...mapState(useSettingsStore, [
			'eventLimit',
			'showWeekends',
			'showWeekNumbers',
			'slotDuration',
		]),
		...mapState(useCalendarObjectsStore, ['modificationCount']),
		...mapState(useWidgetStore, [
			'widgetView',
			'widgetDate',
		]),
		options() {
			return {
				// Initialization:
				initialDate: getYYYYMMDDFromFirstdayParam(this.$route?.params?.firstDay ?? 'now'),
				initialView: this.$route?.params.view ?? 'dayGridMonth',
				// Data
				eventSources: this.eventSources,
				// Plugins
				plugins: this.plugins,
				// Interaction
				editable: this.isEditable,
				selectable: this.isAuthenticatedUser,
				eventAllow,
				eventClick: eventClick(this.$router, this.$route, window, this.isWidget, this.$refs),
				eventDrop: this.isWidget ? false : (...args) => eventDrop(this.$refs.fullCalendar.getApi())(...args),
				eventResize: this.isWidget ? false : eventResize(),
				navLinkDayClick: this.isWidget ? false : navLinkDayClick(this.$router, this.$route),
				navLinkWeekClick: this.isWidget ? false : navLinkWeekClick(this.$router, this.$route),
				select: this.isWidget ? false : select(this.$router, this.$route, window),
				navLinks: true,
				selectLongPressDelay: 500,
				// Localization
				...getDateFormattingConfig(),
				...getFullCalendarLocale(),
				// Rendering
				dayHeaderDidMount,
				eventDidMount,
				noEventsDidMount,
				eventOrder: ['start', '-duration', 'allDay', eventOrder],
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
			if (this.isWidget) {
				const calendar = this.calendarsStore.getCalendarByUrl(this.url)
				if (!calendar) {
					return []
				}
				return [calendar].map(eventSource())
			}
			return this.calendarsStore.enabledCalendars.map(eventSource())
		},
		/**
		 * FullCalendar Plugins
		 *
		 * @return {(PluginDef)[]}
		 */
		plugins() {
			return [
				momentPluginFactory(),
				VTimezoneNamedTimezone,
				dayGridPlugin,
				interactionPlugin,
				listPlugin,
				timeGridPlugin,
				multiMonthPlugin,
			]
		},
		isEditable() {
			// We do not allow drag and drop when the editor is open.
			return this.isAuthenticatedUser
				&& this.$route?.name !== 'EditPopoverView'
				&& this.$route?.name !== 'EditSidebarView'
		},
	},
	watch: {
		widgetView(newView) {
			const calendarApi = this.$refs.fullCalendar.getApi()
			calendarApi.changeView(newView)
		},
		widgetDate(newDate) {
			const calendarApi = this.$refs.fullCalendar.getApi()
			calendarApi.gotoDate(getYYYYMMDDFromFirstdayParam(newDate))
		},
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
		if (!this.isWidget) {
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
		}
	},
	methods: {
		/**
		 * When a user changes the view, remember it and
		 * use it the next time they open the calendar app
		 */
		saveNewView: debounce(function(initialView) {
			if (this.isAuthenticatedUser) {
				this.settingsStore.setInitialView({ initialView })
			}
		}, 5000),
	},
}
</script>

<style scoped lang="scss">
.calendar-grid-checkbox {
	border-style: solid;
	border-width: 2px;
	border-radius: 4px;
	height: 16px;
	width: 16px;
}

.calendar-grid-checkbox-checked {
	border-style: solid;
	border-width: 8px;
	border-radius: 4px;
	height: 16px;
	width: 16px;
}
.fullcalendar-widget{
	min-height: 500px;
	:deep(.fc-col-header-cell-cushion){
		font-size: 9px;
	}
}
</style>
