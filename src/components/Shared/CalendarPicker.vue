<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<NcSelect label="id"
		:input-id="inputId"
		:disabled="isDisabled"
		:options="options"
		:value="valueIds"
		:multiple="multiple"
		:clearable="clearable"
		:filter-by="selectFilterBy"
		:input-label="inputLabel"
		:label-outside="inputLabel === ''"
		@option:selected="change"
		@option:deselected="remove">
		<template #option="{ id }">
			<CalendarPickerOption :color="getCalendarById(id).color"
				:display-name="getCalendarById(id).displayName"
				:is-shared-with-me="getCalendarById(id).isSharedWithMe"
				:owner="getCalendarById(id).owner" />
		</template>
		<template #selected-option="{ id }">
			<CalendarPickerOption :color="getCalendarById(id).color"
				:display-name="getCalendarById(id).displayName"
				:is-shared-with-me="getCalendarById(id).isSharedWithMe"
				:owner="getCalendarById(id).owner" />
		</template>
	</NcSelect>
</template>

<script>
import { NcSelect } from '@nextcloud/vue'
import CalendarPickerOption from './CalendarPickerOption.vue'
import { randomId } from '../../utils/randomId.js'
import { mapStores } from 'pinia'
import useCalendarsStore from '../../store/calendars.js'

export default {
	name: 'CalendarPicker',
	components: {
		CalendarPickerOption,
		NcSelect,
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
		disabled: {
			type: Boolean,
			default: false,
		},
		clearable: {
			type: Boolean,
			default: true,
		},
		inputId: {
			type: String,
			default: () => randomId(),
		},
		inputLabel: {
			type: String,
			default: '',
		},
	},
	computed: {
		...mapStores(useCalendarsStore),
		isDisabled() {
			// for pickers where multiple can be selected (zero or more) we don't want to disable the picker
			// for calendars where only one calendar can be selected, disable if there are < 2
			return this.disabled || (this.multiple ? this.calendars.length < 1 : this.calendars.length < 2)
		},
		valueIds() {
			if (Array.isArray(this.value)) {
				// filter out falsy values (e.g. null, undefined)
				return this.value.filter(v => v).map(({ id }) => id)
			}

			return this.value.id
		},
		options() {
			return this.calendars.map((calendar) => ({
				id: calendar.id,
				displayName: calendar.displayName,
			}))
		},
	},
	methods: {
		/**
		 * TODO: this should emit the calendar id instead
		 *
		 * @param {{id: string}|{id: string}[]} options All selected options (including the new one)
		 */
		change(options) {
			if (!options || options.length === 0) {
				return
			}

			// The new option will always be the last element
			const newOption = Array.isArray(options) ? options[options.length - 1] : options
			const newCalendar = this.getCalendarById(newOption.id)
			if (this.showCalendarOnSelect && !newCalendar.enabled) {
				this.calendarsStore.toggleCalendarEnabled({
					calendar: newCalendar,
				})
			}

			this.$emit('select-calendar', newCalendar)
		},
		remove(option) {
			if (this.multiple) {
				this.$emit('remove-calendar', this.getCalendarById(option))
			}
		},

		/**
		 * @param {string} id The calendar id
		 * @return {object|undefined} The calendar object (if it exists)
		 */
		getCalendarById(id) {
			return this.calendars.find((cal) => cal.id === id)
		},

		/**
		 * Decide whether the given option matches the given search term
		 *
		 * @param {object} option The calendar option
		 * @param {string} label The label of the calendar option
		 * @param {string} id The search term
		 * @param search
		 * @return {boolean} True if the search term matches
		 */
		selectFilterBy(option, label, search) {
			return option.displayName.toLowerCase().indexOf(search) !== -1
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

<style lang="scss">
.vs__search {
	// Prevent search from collapsing the actual picked option
	flex-basis: 0;
}

.vs__dropdown-menu {
	z-index: 10000010 !important;
}
</style>
