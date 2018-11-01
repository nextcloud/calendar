<template>
	<div class="view">
		<!-- Full calendar -->
		<div ref="fullcalendar" class="fullcalendar-wrapper" />
		<!-- Edit modal -->
		<router-view />
	</div>
</template>
<script>
import { Calendar } from 'fullcalendar'
import '../../node_modules/fullcalendar/dist/fullcalendar.css'

export default {
	name: 'View',
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
		this.calendar = new Calendar(this.$refs.fullcalendar)
		this.calendar.render()
	},
}
</script>
