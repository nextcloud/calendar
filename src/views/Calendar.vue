<template>
	<div class="view">
		<!-- Full calendar -->
		<full-calendar />
		<!-- Edit modal -->
		<router-view />
	</div>
</template>
<script>

import FullCalendar from '../components/FullCalendar.vue'
import '../../node_modules/fullcalendar/dist/fullcalendar.css'

export default {
	name: 'Calendar',
	components: {
		FullCalendar
	},
	// props: {
	// 	view: {
	// 		type: String,
	// 		required: true,
	// 	},
	// 	firstday: {
	// 		type: String,
	// 		required: true,
	// 	}
	// },
	data() {
		return {
			calendar: null
		}
	},
	mounted() {
		// this.calendar = new Calendar(this.$refs.fullcalendar)
		// this.calendar.render()
	},
}
</script>
