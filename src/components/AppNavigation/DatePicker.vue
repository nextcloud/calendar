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
		<button :aria-label="goBackLabel" :title="goBackLabel" type="button"
			class="button icon icon-leftarrow" @click="prev()"
		/>
		<label for="app-navigation-datepicker-input" class="button datepicker-label">
			{{ date | formatDateRage(view) }}
		</label>
		<datetime-picker v-model="date" :lang="lang" :first-day-of-week="firstDay"
			:not-before="minimumDate" :not-after="maximumDate"
		/>
		<button :aria-label="goForwardLabel" :title="goForwardLabel" type="button"
			class="button icon icon-rightarrow" @click="next()"
		/>
	</div>
</template>

<script>
import { DatetimePicker } from 'nextcloud-vue'
import {
	getYYYYMMDDFromDate,
	getDateFromFirstdayParam
} from '../../services/date.js'
import moment from 'moment'

export default {
	name: 'DatePicker',
	components: {
		DatetimePicker
	},
	data: function() {
		return {
			locale: 'en', // this is just during initialization
			firstDay: window.firstDay + 1, // provided by nextcloud
			lang: {
				days: window.dayNamesShort, // provided by nextcloud
				months: window.monthNamesShort, // provided by nextcloud
				placeholder: {
					// this should never be visible in theory
					// just have something to replace the chinese default
					date: t('calendar', 'Select date to navigate to')
				}
			}
		}
	},
	computed: {
		date: {
			get() {
				return getDateFromFirstdayParam(this.$route.params.firstday)
			},
			set(date) {
				this.goTo(date)
			}
		},
		minimumDate() {
			return new Date(this.$store.state.davRestrictions.davRestrictions.minimumDate)
		},
		maximumDate() {
			return new Date(this.$store.state.davRestrictions.davRestrictions.maximumDate)
		},
		goBackLabel() {
			return t('calendar', 'Go back')
		},
		goForwardLabel() {
			return t('calendar', 'Go forward')
		},
		view() {
			return this.$route.params.view
		}
	},
	mounted() {
		this.$el.querySelector('.mx-input').id = 'app-navigation-datepicker-input'
		this.$el.querySelector('.mx-input-wrapper').style.display = 'none'

		// Load the locale
		// convert format like en_GB to en-gb for `moment.js`
		let locale = OC.getLocale().replace('_', '-').toLowerCase()
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
		prev() {
			this.goTo(this.nav(-1))
		},
		next() {
			this.goTo(this.nav(1))
		},
		goTo(date) {
			const name = this.$route.name
			const params = this.$route.params
			params.firstday = getYYYYMMDDFromDate(date)

			this.$router.push({ name, params })
		},
		nav(dir) {
			switch (this.$route.params.view) {
			case 'agendaDay':
				return moment(this.date)
					.add(dir, 'day')
					.toDate()

			case 'agendaWeek':
				return moment(this.date)
					.add(dir, 'week')
					// .startOf('week')
					.toDate()

			case 'month':
				return moment(this.date)
					.add(dir, 'month')
					// .startOf('month')
					.toDate()
			}
		},
	}
}
</script>
