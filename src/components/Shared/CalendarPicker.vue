<template>
	<Select label="displayName"
		input-id="url"
		:disabled="isDisabled"
		:options="options"
		:value="removeCircularStructure(value)"
		:multiple="multiple"
		@input="change"
		@option:deselected="remove">
		<template #option="option">
			<CalendarPickerOption :color="option.color"
				:display-name="option.displayName"
				:is-shared-with-me="option.isSharedWithMe"
				:owner="option.owner" />
		</template>
		<template #selected-option="option">
			<CalendarPickerOption :color="option.color"
				:display-name="option.displayName"
				:is-shared-with-me="option.isSharedWithMe"
				:owner="option.owner" />
		</template>
	</Select>
</template>
<script>
import { NcSelect as Select } from '@nextcloud/vue'
import CalendarPickerOption from './CalendarPickerOption.vue'

export default {
	name: 'CalendarPicker',
	components: {
		CalendarPickerOption,
		Select,
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
		options() {
			return this.calendars.map(this.removeCircularStructure)
		}
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
				this.$store.dispatch('toggleCalendarEnabled', {
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
		removeCircularStructure(calendar) {
			const { dav, ...rest } = calendar
			return rest
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

<style>
.vs__dropdown-menu {
  z-index: 10000010 !important;
}
</style>
