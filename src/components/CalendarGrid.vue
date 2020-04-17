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
  - but WITHOUT ANY WARRANTY without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
  -->
<template>
	<FullCalendar
		ref="fullCalendar"
		:options="options" />
</template>

<script>
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'
import { getYYYYMMDDFromFirstdayParam } from '../utils/date.js'
import eventAllow from '../fullcalendar/interaction/eventAllow.js'
import eventClick from '../fullcalendar/interaction/eventClick.js'
import eventDrop from '../fullcalendar/interaction/eventDrop.js'
import eventResize from '../fullcalendar/interaction/eventResize.js'
import navLinkDayClick from '../fullcalendar/interaction/navLinkDayClick.js'
import navLinkWeekClick from '../fullcalendar/interaction/navLinkWeekClick.js'
import select from '../fullcalendar/interaction/select.js'
import { getDateFormattingConfig } from '../fullcalendar/localization/dateFormattingConfig.js'
import { getFullCalendarLocale } from '../fullcalendar/localization/localeProvider.js'
import { getFirstDayOfWeekFromMomentLocale } from '../utils/moment.js'
import dayCellClassNames from '../fullcalendar/rendering/dayCellClassNames.js'
import eventContent from '../fullcalendar/rendering/eventContent.js'
import eventOrder from '../fullcalendar/rendering/eventOrder.js'
import MomentPlugin from '../fullcalendar/localization/momentPlugin.js'
import VTimezoneNamedTimezone from '../fullcalendar/timezones/vtimezoneNamedTimezoneImpl.js'
import eventSource from '../fullcalendar/eventSources/eventSource.js'
import { mapGetters, mapState } from 'vuex'
import debounce from 'debounce'
import { getLocale } from '@nextcloud/l10n'
import windowResize from '../fullcalendar/rendering/windowResize.js'

export default {
	name: 'CalendarGrid',
	components: {
		FullCalendar,
	},
	props: {
		isPublic: {
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
				selectable: !this.isPublic,
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
				dayCellClassNames,
				eventDidMount: eventContent,
				eventOrder: ['start', '-duration', 'allDay', eventOrder],
				forceEventDuration: false,
				headerToolbar: false,
				height: '100%', // Does this actually work for resize?
				slotDuration: this.slotDuration,
				weekNumbers: this.showWeekNumbers,
				weekends: this.showWeekends,
				dayMaxEventRows: this.eventLimit,
				selectMirror: true,
				lazyFetching: false,
				nowIndicator: true,
				progressiveEventRendering: true,
				unselectAuto: true,
				// Timezones:
				timeZone: this.timezoneId,
			}
		},
		eventSources() {
			console.debug(this.$store.getters.enabledCalendars)
			return this.$store.getters.enabledCalendars.map(eventSource(this.$store))
		},
		plugins() {
			return [
				dayGridPlugin,
				interactionPlugin,
				listPlugin,
				timeGridPlugin,
				MomentPlugin,
				VTimezoneNamedTimezone,
			]
		},
		isEditable() {
			// We do not allow drag and drop when the editor is open.
			return !this.isPublic
				&& this.$route.name !== 'EditPopoverView'
				&& this.$route.name !== 'EditSidebarView'
		},
	},
	watch: {
		modificationCount: debounce(function() {
			const calendarApi = this.$refs.fullCalendar.getApi()
			calendarApi.refetchEvents()
		}, 50),
		options() {
			console.debug(this.options)
		},
	},
	created() {
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

		this.$router.beforeEach(this.beforeRouteUpdate)
	},
	methods: {
		saveNewView: debounce(function(initialView) {
			if (this.isAuthenticatedUser) {
				this.$store.dispatch('setInitialView', { initialView })
			}
		}, 5000),
		windowResize(...args) {
			return windowResize(window, document.querySelector('#header'))(...args)
		},
		beforeRouteUpdate(to, from, next) {
			console.debug('route update')
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
		},
	},
}
</script>
