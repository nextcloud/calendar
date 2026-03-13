<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<NcSelect
		label="id"
		:inputId="inputId"
		:disabled="isDisabled"
		:options="options"
		:modelValue="valueIds"
		:multiple="multiple"
		:clearable="clearable"
		trackBy="id"
		:filterBy="selectFilterBy"
		:inputLabel="inputLabel"
		:labelOutside="inputLabel === ''"
		:selectable="selectable"
		@update:modelValue="handleSelectionUpdate">
		<template #option="{ id }">
			<CalendarPickerOption
				:color="getCalendarById(id).color"
				:displayName="getCalendarById(id).displayName"
				:isSharedWithMe="getCalendarById(id).isSharedWithMe"
				:owner="getCalendarById(id).owner" />
		</template>
		<template #selected-option="{ id }">
			<CalendarPickerOption
				:color="getCalendarById(id).color"
				:displayName="getCalendarById(id).displayName"
				:isSharedWithMe="getCalendarById(id).isSharedWithMe"
				:owner="getCalendarById(id).owner" />
		</template>
	</NcSelect>
</template>

<script>
import { NcSelect } from '@nextcloud/vue'
import { mapStores } from 'pinia'
import CalendarPickerOption from './CalendarPickerOption.vue'
import useCalendarsStore from '../../store/calendars.js'
import { randomId } from '../../utils/randomId.js'

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

		/**
		 * Decides whether a calendar is selectable or not.
		 * Non-selectable calendars are displayed but cannot be selected.
		 *
		 * @param {object} calendar
		 * @return {boolean}
		 */
		isCalendarSelectable: {
			type: Function,
			default: (calendar) => true,
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
				return this.value.filter((v) => v).map(({ id }) => id)
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
		change(optionId) {
			if (!optionId) {
				return
			}
			const newCalendar = this.getCalendarById(optionId.id)
			if (this.showCalendarOnSelect && !newCalendar.enabled) {
				this.calendarsStore.toggleCalendarEnabled({
					calendar: newCalendar,
				})
			}

			this.$emit('selectCalendar', newCalendar)
		},

		remove(optionId) {
			if (this.multiple) {
				this.$emit('removeCalendar', this.getCalendarById(optionId))
			}
		},

		handleSelectionUpdate(selection) {
			const previous = Array.isArray(this.valueIds) ? this.valueIds : [this.valueIds].filter(Boolean)
			const current = Array.isArray(selection) ? selection : [selection].filter(Boolean)

			if (this.multiple) {
				const added = current.filter((id) => !previous.includes(id))
				const removed = previous.filter((id) => !current.includes(id))
				added.forEach((id) => this.change(id))
				removed.forEach((id) => this.remove(id))
				return
			}

			const newId = current[0]
			if (newId && newId !== previous[0]) {
				this.change(newId)
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
		 * @param {string} search The search term
		 * @return {boolean} True if the search term matches
		 */
		selectFilterBy(option, label, search) {
			return option.displayName.toLowerCase().indexOf(search) !== -1
		},

		/**
		 * Decide whether the given option can be selected
		 *
		 * @param {object} option The calendar option
		 * @return {boolean} True if the option can be selected
		 */
		selectable(option) {
			const calendar = this.getCalendarById(option.id)
			return this.isCalendarSelectable(calendar)
		},
	},
}
</script>

<style lang="scss" scoped>
:deep(.multiselect__tags) {
	margin: 3px 0;
}

.calendar-picker__tag {
	border: 1px solid var(--color-border);
	border-radius: var(--border-radius);
	padding: 0 5px;
}

.calendar-picker__tag + .calendar-picker__tag {
	margin-inline-start: 5px;
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
