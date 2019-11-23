<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  -
  - @license GNU AGPL version 3 or any later version
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
	<div class="datepicker-button-section">
		<button
			:aria-label="previousLabel"
			class="datepicker-button-section__previous button icon icon-leftarrow"
			:title="previousLabel"
			type="button"
			@click="navigateToPreviousTimeRange" />
		<button
			class="datepicker-button-section__datepicker-label button datepicker-label"
			@click.stop.prevent="toggleDatepicker"
			@mousedown.stop.prevent="doNothing"
			@mouseup.stop.prevent="doNothing">
			{{ selectedDate | formatDateRage(view, locale) }}
		</button>
		<DatePicker
			ref="datepicker"
			class="datepicker-button-section__datepicker"
			:date="selectedDate"
			:is-all-day="true"
			@change="navigateToDate" />
		<button
			:aria-label="nextLabel"
			class="datepicker-button-section__next button icon icon-rightarrow"
			:title="nextLabel"
			type="button"
			@click="navigateToNextTimeRange" />
	</div>
</template>

<script>
import {
	getYYYYMMDDFromDate,
	getDateFromFirstdayParam,
	modifyDate,
} from '../../../utils/date.js'
import { mapState } from 'vuex'
import formatDateRage from '../../../filters/dateRangeFormat.js'
import DatePicker from '../../Shared/DatePicker.vue'

export default {
	name: 'AppNavigationHeaderDatePicker',
	components: {
		DatePicker,
	},
	filters: {
		formatDateRage,
	},
	data: function() {
		return {
			isDatepickerOpen: false,
		}
	},
	computed: {
		...mapState({
			locale: (state) => state.settings.momentLocale,
		}),
		selectedDate() {
			return getDateFromFirstdayParam(this.$route.params.firstDay)
		},
		previousLabel() {
			switch (this.view) {
			case 'timeGridDay':
				return this.$t('calendar', 'Previous day')

			case 'timeGridWeek':
				return this.$t('calendar', 'Previous week')

			case 'dayGridMonth':
			default:
				return this.$t('calendar', 'Previous month')
			}
		},
		nextLabel() {
			switch (this.view) {
			case 'timeGridDay':
				return this.$t('calendar', 'Next day')

			case 'timeGridWeek':
				return this.$t('calendar', 'Next week')

			case 'dayGridMonth':
			default:
				return this.$t('calendar', 'Next month')
			}
		},
		view() {
			return this.$route.params.view
		},
	},
	methods: {
		navigateToPreviousTimeRange() {
			return this.navigateTimeRangeByFactor(-1)
		},
		navigateToNextTimeRange() {
			return this.navigateTimeRangeByFactor(1)
		},
		navigateTimeRangeByFactor(factor) {
			let newDate

			switch (this.$route.params.view) {
			case 'timeGridDay':
				newDate = modifyDate(this.selectedDate, {
					day: factor,
				})
				break

			case 'timeGridWeek':
				newDate = modifyDate(this.selectedDate, {
					week: factor,
				})
				break

			case 'dayGridMonth':
			default:
				newDate = modifyDate(this.selectedDate, {
					month: factor,
				})
				break
			}

			this.navigateToDate(newDate)
		},
		navigateToDate(date) {
			const name = this.$route.name
			const params = Object.assign({}, this.$route.params, {
				firstDay: getYYYYMMDDFromDate(date),
			})

			// Don't push new route when day didn't change
			if (this.$route.params.firstDay === getYYYYMMDDFromDate(date)) {
				return
			}

			this.$router.push({ name, params })
		},
		toggleDatepicker(event) {
			// This is not exactly the recommended approach,
			// but Datepicker does not expose the open property yet.
			// Version 3 will
			this.$refs.datepicker.$children[0].$children[0].popupVisible
				= !this.$refs.datepicker.$children[0].$children[0].popupVisible
		},
		doNothing() {
			// This function does nothing in itself,
			// it only captures and prevents the mousedown and mouseup of vue2-datepicker
		},
	},
}
</script>
