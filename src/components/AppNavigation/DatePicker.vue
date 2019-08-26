<template>
	<div class="button-group">
		<button :aria-label="goBackLabel" :title="goBackLabel" type="button"
			class="button icon icon-leftarrow" @click="prev()"
		/>
		<label for="app-navigation-datepicker-input" class="button datepicker-label">{{ date | formatDate(view) }}</label>
		<datetime-picker v-model="date" :lang="lang" :first-day-of-week="firstDay"
			:not-before="minimumDate" :not-after="maximumDate" @change="selectInDatepicker"
		/>
		<button :aria-label="goForwardLabel" :title="goForwardLabel" type="button"
			class="button icon icon-rightarrow" @click="next()"
		/>
	</div>
</template>

<script>
import { DatetimePicker } from 'nextcloud-vue'
import { getYYYYMMDDFromDate } from '../../services/date.js'
import moment from 'moment'

export default {
	name: 'DatePicker',
	components: {
		DatetimePicker
	},
	filters: {
		formatDate(value, currentView) {
			switch (currentView) {
			case 'agendaDay':
				return moment(value).format('ll')

			case 'agendaWeek':
				return t('calendar', 'Week {number} of {year}', {
					number: moment(value).week(),
					year: moment(value).year()
				})

			case 'month':
			default:
				return moment(value).format('MMMM YYYY')
			}
		}
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
		date() {
			return new Date(this.$route.params.firstday || 'now')
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
		selectInDatepicker() {
			this.goTo(this.date)
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
