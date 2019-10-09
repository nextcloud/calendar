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
	<div class="button-group">
		<button
			:aria-label="previousLabel"
			class="button icon icon-leftarrow"
			:title="previousLabel"
			type="button"
			@click="navigateToPreviousTimeRange"
		/>
		<label
			for="app-navigation-datepicker-input"
			class="button datepicker-label">
			{{ selectedDate | formatDateRage(view) }}
		</label>
		<datetime-picker
			:first-day-of-week="firstDay"
			:lang="lang"
			:clearable="false"
			:editable="false"
			:not-before="minimumDate"
			:not-after="maximumDate"
			:value="selectedDate"
			:input-attr="inputItemAttributes"
			@change="navigateToDate"
		/>
		<button
			:aria-label="nextLabel"
			class="button icon icon-rightarrow"
			:title="nextLabel"
			type="button"
			@click="navigateToNextTimeRange"
		/>
	</div>
</template>

<script>
import {
	DatetimePicker
} from 'nextcloud-vue'
import {
	getYYYYMMDDFromDate,
	getDateFromFirstdayParam,
	modifyDate
} from '../../../utils/date.js'
import formatDateRage from '../../../filters/dateRangeFormat.js'
import { getLocale } from 'nextcloud-l10n'

export default {
	name: 'AppNavigationHeaderDatePicker',
	components: {
		DatetimePicker
	},
	data: function() {
		return {
			isDatepickerOpen: false,
			locale: 'en', // this is just during initialization
			firstDay: window.firstDay + 1, // provided by nextcloud
			lang: {
				days: window.dayNamesShort, // provided by nextcloud
				months: window.monthNamesShort, // provided by nextcloud
				placeholder: {
					// this should never be visible in theory
					// just have something to replace the chinese default
					date: this.$t('calendar', 'Select date to navigate to')
				}
			}
		}
	},
	filters: {
		formatDateRage
	},
	computed: {
		selectedDate() {
			return getDateFromFirstdayParam(this.$route.params.firstDay)
		},
		minimumDate() {
			return new Date(this.$store.state.davRestrictions.minimumDate)
		},
		maximumDate() {
			return new Date(this.$store.state.davRestrictions.maximumDate)
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
		inputItemAttributes() {
			return {
				id: 'app-navigation-datepicker-input'
			}
		}
	},
	mounted() {
		// Load the locale
		// convert format like en_GB to en-gb for `moment.js`
		let locale = getLocale().replace('_', '-').toLowerCase()
		// default load e.g. fr-fr
		import('moment/locale/' + this.locale)
			.then(() => {
				// force locale change to update
				// the component once done loading
				this.locale = locale
			})
			.catch(() => {
				// failure: fallback to fr
				import('moment/locale/' + locale.split('-')[0])
					.then(() => {
						this.locale = locale.split('-')[0]
					})
					.catch(() => {
						// failure, fallback to english
						this.locale = 'en'
					})
			})
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
					day: factor
				})
				break

			case 'timeGridWeek':
				newDate = modifyDate(this.selectedDate, {
					week: factor
				})
				break

			case 'dayGridMonth':
			default:
				newDate = modifyDate(this.selectedDate, {
					month: factor
				})
				break
			}

			this.navigateToDate(newDate)
		},
		navigateToDate(date) {
			const name = this.$route.name
			const params = Object.assign({}, this.$route.params, {
				firstDay: getYYYYMMDDFromDate(date)
			})

			// Don't push new route when day didn't change
			if (this.$route.params.firstDay === getYYYYMMDDFromDate(date)) {
				return
			}

			this.$router.push({ name, params })
		}
	}
}
</script>
