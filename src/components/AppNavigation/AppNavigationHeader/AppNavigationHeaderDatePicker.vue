<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="datepicker-button-section">
		<NcButton v-if="!isWidget"
			v-shortkey="previousShortKeyConf"
			:aria-label="previousLabel"
			class="datepicker-button-section__previous button"
			:name="previousLabel"
			@click="navigateToPreviousTimeRange"
			@shortkey="navigateToPreviousTimeRange">
			<template #icon>
				<ChevronLeftIcon :size="22" />
			</template>
		</NcButton>
		<NcButton v-if="!isWidget"
			class="datepicker-button-section__datepicker-label button datepicker-label"
			@click.stop.prevent="toggleDatepicker"
			@mousedown.stop.prevent="doNothing"
			@mouseup.stop.prevent="doNothing">
			{{ selectedDate | formatDateRange(view, locale) }}
		</NcButton>
		<DatePicker ref="datepicker"
			:class="isWidget ? 'datepicker-widget':'datepicker-button-section__datepicker'"
			:append-to-body="isWidget"
			:date="selectedDate"
			:is-all-day="true"
			:open.sync="isDatepickerOpen"
			:type="view === 'multiMonthYear' ? 'year' : 'date'"
			@change="navigateToDate" />
		<NcButton v-if="!isWidget"
			v-shortkey="nextShortKeyConf"
			:aria-label="nextLabel"
			class="datepicker-button-section__next button"
			:name="nextLabel"
			@click="navigateToNextTimeRange"
			@shortkey="navigateToNextTimeRange">
			<template #icon>
				<ChevronRightIcon :size="22" />
			</template>
		</NcButton>
	</div>
</template>

<script>
import {
	getYYYYMMDDFromDate,
	getDateFromFirstdayParam,
	modifyDate,
} from '../../../utils/date.js'
import { mapState } from 'vuex'
import formatDateRange from '../../../filters/dateRangeFormat.js'
import DatePicker from '../../Shared/DatePicker.vue'
import ChevronLeftIcon from 'vue-material-design-icons/ChevronLeft.vue'
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight.vue'
import { NcButton } from '@nextcloud/vue'

export default {
	name: 'AppNavigationHeaderDatePicker',
	components: {
		DatePicker,
		ChevronLeftIcon,
		ChevronRightIcon,
		NcButton,
	},
	filters: {
		formatDateRange,
	},
	props: {
		isWidget: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			isDatepickerOpen: false,
		}
	},
	computed: {
		...mapState({
			locale: (state) => state.settings.momentLocale,
		}),
		selectedDate() {
			if (this.isWidget) {
				return getDateFromFirstdayParam(this.$store.getters.widgetDate)
			}
			return getDateFromFirstdayParam(this.$route.params?.firstDay ?? 'now')
		},
		previousShortKeyConf() {
			return {
				previous_p: ['p'],
				previous_k: ['k'],
			}
		},
		previousLabel() {
			switch (this.view) {
			case 'timeGridDay':
				return this.$t('calendar', 'Previous day')

			case 'timeGridWeek':
				return this.$t('calendar', 'Previous week')

			case 'multiMonthYear':
				return this.$t('calendar', 'Previous year')

			case 'dayGridMonth':
			default:
				return this.$t('calendar', 'Previous month')
			}
		},
		nextShortKeyConf() {
			return {
				next_j: ['j'],
				next_n: ['n'],
			}
		},
		nextLabel() {
			switch (this.view) {
			case 'timeGridDay':
				return this.$t('calendar', 'Next day')

			case 'timeGridWeek':
				return this.$t('calendar', 'Next week')

			case 'multiMonthYear':
				return this.$t('calendar', 'Next year')

			case 'dayGridMonth':
			default:
				return this.$t('calendar', 'Next month')
			}
		},
		view() {
			if (this.isWidget) {
				return this.$store.getters.widgetView
			}
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

			case 'multiMonthYear':
				newDate = modifyDate(this.selectedDate, {
					year: factor,
				})
				break

			case 'dayGridMonth':
			case 'listMonth':
			default: {
				// modifyDate is just adding one month, so we have to manually
				// set the date of month to 1. Otherwise if your date is set to
				// January 30th and you add one month, February 30th doesn't exist
				// and it automatically changes to March 1st. Same happens on March 31st.
				const firstDayOfCurrentMonth = new Date(this.selectedDate.getTime())
				firstDayOfCurrentMonth.setDate(1)
				newDate = modifyDate(firstDayOfCurrentMonth, {
					month: factor,
				})
				break
			}
			}

			this.navigateToDate(newDate)
		},
		navigateToDate(date) {
			if (this.isWidget) {
				this.$store.commit('setWidgetDate', { widgetDate: getYYYYMMDDFromDate(date) })
			} else {
				const name = this.$route.name
				const params = Object.assign({}, this.$route.params, {
					firstDay: getYYYYMMDDFromDate(date),
				})

				// Don't push new route when day didn't change
				if (this.$route.params.firstDay === getYYYYMMDDFromDate(date)) {
					return
				}

				this.$router.push({ name, params })
			}
		},
		toggleDatepicker() {
			this.isDatepickerOpen = !this.isDatepickerOpen
		},
		doNothing() {
			// This function does nothing in itself,
			// it only captures and prevents the mousedown and mouseup of vue2-datepicker
		},
	},
}
</script>
<style lang="scss">
.datepicker-widget{
	width: 135px;
    margin: 2px 5px 5px 5px;
}
</style>
