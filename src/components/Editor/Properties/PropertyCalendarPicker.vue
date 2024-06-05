<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div v-if="display"
		class="property-select"
		:class="{ 'property-select--readonly': isReadOnly }">
		<div class="property-select__input"
			:class="{ 'property-select__input--readonly-calendar-picker': isReadOnly }">
			<CalendarPicker v-if="!isReadOnly"
				:value="calendar"
				:calendars="calendars"
				:show-calendar-on-select="true"
				@select-calendar="selectCalendar" />

			<CalendarPickerOption v-else
				:color="calendar.color"
				:display-name="calendar.displayName"
				:is-shared-with-me="calendar.isSharedWithMe"
				:owner="calendar.owner" />
		</div>
	</div>
</template>

<script>
import CalendarPicker from '../../Shared/CalendarPicker.vue'
import CalendarPickerOption from '../../Shared/CalendarPickerOption.vue'

export default {
	name: 'PropertyCalendarPicker',
	components: {
		CalendarPickerOption,
		CalendarPicker,
	},
	props: {
		calendar: {
			type: Object,
			default: undefined,
		},
		calendars: {
			type: Array,
			required: true,
		},
		isReadOnly: {
			type: Boolean,
			required: true,
		},
	},
	computed: {
		display() {
			return this.calendar !== undefined
		},
	},
	methods: {
		/**
		 * Emits the select calendar event
		 *
		 * // TODO: this should emit the calendar id instead
		 *
		 * @param {object} value The calendar Object
		 */
		selectCalendar(value) {
			this.$emit('select-calendar', value)
		},
	},
}
</script>
