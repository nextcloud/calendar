<template>
	<Multiselect label="displayName"
		track-by="url"
		:disabled="isDisabled"
		:options="calendars"
		:value="value"
		:multiple="multiple"
		@select="change"
		@remove="remove">
		<template #singleLabel="{ option }">
			<CalendarPickerOption v-bind="option" />
		</template>
		<template #option="{ option }">
			<CalendarPickerOption v-bind="option" />
		</template>
		<template #tag="{ option }">
			<div class="calendar-picker__tag">
				<CalendarPickerOption v-bind="option" />
			</div>
		</template>
	</Multiselect>
</template>
<script>
import { NcMultiselect as Multiselect } from '@nextcloud/vue'
import CalendarPickerOption from './CalendarPickerOption.vue'
import { mapStores } from 'pinia'
import useCalendarsStore from '../../store/calendars.js'

export default {
	name: 'CalendarPicker',
	components: {
		CalendarPickerOption,
		Multiselect,
	},
	props: {
		value: {
			type: [Object, Array],
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
		multiple: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		isDisabled() {
			// for pickers where multiple can be selected (zero or more) we don't want to disable the picker
			// for calendars where only one calendar can be selected, disable if there are < 2
			return this.multiple ? this.calendars.length < 1 : this.calendars.length < 2
		},
		...mapStores({
			useCalendarsStore,
		}),
	},
	methods: {
		/**
		 * TODO: this should emit the calendar id instead
		 *
		 * @param {object} newCalendar The selected calendar
		 */
		change(newCalendar) {
			if (!newCalendar) {
				return
			}

			if (this.showCalendarOnSelect && !newCalendar.enabled) {
				this.calendarsStore.toggleCalendarEnabled({
					calendar: newCalendar,
				})
			}

			this.$emit('select-calendar', newCalendar)
		},
		remove(calendar) {
			if (this.multiple) {
				this.$emit('remove-calendar', calendar)
			}
		},
	},
}
</script>

<style lang="scss" scoped>
::v-deep .multiselect__tags {
	margin: 3px 0;
}

.calendar-picker__tag {
	border: 1px solid var(--color-border);
	border-radius: var(--border-radius);
	padding: 0 5px;
}

.calendar-picker__tag + .calendar-picker__tag {
	margin-left: 5px;
}
</style>
