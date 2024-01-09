<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
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
