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
import { randomColor } from '../services/colorService';

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
			this.$store.dispatch('getCalendars')
				.then((calendars) => {
					this.loadingCalendars = false

					// No calendars? Create a new one!
					if (calendars.length === 0) {
						this.$store.dispatch('appendCalendar', {
							displayName: t('calendars', 'Personal'),
							color: randomColor(),
							order: 0
						})
					}
				})
		})
	},
}
</script>
