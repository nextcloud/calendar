<template>
	<div id="app-content">
		<!-- Full calendar -->
		<full-calendar :events="events" :event-sources="eventSources" :config="config" />
		<!-- Edit modal -->
		<router-view />
	</div>
</template>

<script>
import FullCalendar from '../components/FullCalendar.vue'
import { generateTextColorFromRGB } from '../services/colorService'
import fullCalendarEventService from '../services/fullCalendarEventService'

export default {
	name: 'Calendar',
	components: {
		FullCalendar
	},
	computed: {
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

				events: fullCalendarEventService(enabledCalendar),
			}))
		},
		config() {
			return {}
		}
	}
}
</script>
