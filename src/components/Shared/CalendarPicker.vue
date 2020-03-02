<template>
	<Multiselect
		label="displayName"
		track-by="displayName"
		:disabled="isDisabled"
		:options="calendars"
		:value="calendar"
		@select="change">
		<template slot="singleLabel" slot-scope="scope">
			<CalendarPickerOption v-bind="scope.option" />
		</template>
		<template slot="option" slot-scope="scope">
			<CalendarPickerOption v-bind="scope.option" />
		</template>
	</Multiselect>
</template>
<script>
import { Multiselect } from '@nextcloud/vue/dist/Components/Multiselect'
import CalendarPickerOption from './CalendarPickerOption.vue'

export default {
	name: 'CalendarPicker',
	components: {
		CalendarPickerOption,
		Multiselect,
	},
	props: {
		calendar: {
			type: Object,
			required: true,
		},
		calendars: {
			type: Array,
			required: true,
		},
		showCalendarOnSelect: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		isDisabled() {
			return this.calendars.length < 2
		},
	},
	methods: {
		/**
		 * TODO: this should emit the calendar id instead
		 * @param {Object} newCalendar The selected calendar
		 */
		change(newCalendar) {
			if (!newCalendar) {
				return
			}

			if (this.showCalendarOnSelect && !newCalendar.enabled) {
				this.$store.dispatch('toggleCalendarEnabled', {
					calendar: newCalendar,
				})
			}

			this.$emit('selectCalendar', newCalendar)
		},
	},
}
</script>
