<template>
	<multiselect
		label="displayName"
		track-by="displayName"
		:disabled="isDisabled"
		:options="calendars"
		:value="calendar"
		@select="change"
	/>
</template>
<script>
import {
	Multiselect
} from 'nextcloud-vue'

export default {
	name: 'CalendarPicker',
	components: {
		Multiselect
	},
	props: {
		calendar: {
			type: Object,
			required: true
		},
		calendars: {
			type: Array,
			required: true,
		},
		showCalendarOnSelect: {
			type: Boolean,
			required: true,
			default: false
		}
	},
	computed: {
		isDisabled() {
			return this.calendars.length < 2
		},
	},
	methods: {
		change(newCalendar) {
			if (!newCalendar) {
				return
			}

			if (!newCalendar.enabled) {
				this.$store.dispatch('toggleCalendarEnabled', {
					calendar: newCalendar
				})
			}

			this.$emit('selectCalendar', newCalendar)
		}
	}
}
</script>
