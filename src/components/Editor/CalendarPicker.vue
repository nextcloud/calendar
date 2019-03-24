<template>
	<multiselect
		v-model="calendar"
		label="displayName"
		track-by="displayName"
		:select="selectCalendar"
		:disabled="calendars.length <= 1"
		:options="calendars">
	</multiselect>
</template>
<script>
import { Multiselect } from 'nextcloud-vue'

export default {
	name: 'CalendarPicker',
	props: {
		selectCalendar: {
			type: Function
		}
	},
	data() {
		return {
			calendar: null
		}
	},
	components: {
		Multiselect
	},
	computed: {
		calendars() {
			return this.$store.getters.sortedCalendars
		},
	},
}
</script>
