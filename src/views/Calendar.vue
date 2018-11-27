<template>
	<div id="content" class="app-calendar">
		<app-navigation :loading-calendars="loadingCalendars" />
		<div id="app-content">
			<!-- Full calendar -->
			<full-calendar :events="events" :event-sources="eventSources" :config="config" />
		</div>
		<!-- Edit modal -->
		<router-view />
	</div>
</template>

<script>
import AppNavigation from '../components/AppNavigation.vue'
import FullCalendar from '../components/FullCalendar.vue'

import client from '../services/cdav.js'
import { generateTextColorFromRGB } from '../services/colorService'
import fullCalendarEventService from '../services/fullCalendarEventService'

import moment from 'moment'

export default {
	name: 'Calendar',
	components: {
		AppNavigation,
		FullCalendar
	},
	data() {
		return {
			loadingCalendars: true
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
			console.debug(this.$store.getters.enabledCalendars)
			return this.$store.getters.enabledCalendars.map((enabledCalendar) => ({
				id: enabledCalendar.id,
				// coloring
				backgroundColor: enabledCalendar.color,
				borderColor: enabledCalendar.color,
				textColor: generateTextColorFromRGB(enabledCalendar.color),
				// html foo
				className: enabledCalendar.id,
				editable: !enabledCalendar.readOnly,

				events: fullCalendarEventService(enabledCalendar, (...args) => console.error(args)),
			}))
		},
		config() {
			console.debug(this.$store)
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
		}
	},
	beforeMount() {
		// get calendars then get events
		client.connect({ enableCalDAV: true }).then(() => {
			console.debug('Connected to dav!', client)
			this.$store.dispatch('getCalendars')
				.then((calendars) => {
					this.loadingCalendars = false

					// No calendars? Create a new one!
					if (calendars.length === 0) {
						this.$store.dispatch('appendCalendar', { displayName: t('calendars', 'Calendars') })
							.then(() => {
								this.fetchEvents()
							})
						// else, let's get those events!
					} else {
						this.fetchEvents()
					}
				})
			// check local storage for orderKey
			// if (localStorage.getItem('orderKey')) {
			// 	// run setOrder mutation with local storage key
			// 	this.$store.commit('setOrder', localStorage.getItem('orderKey'))
			// }
		})
	},
}
</script>
