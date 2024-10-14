<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcActions>
		<template #icon>
			<NcTextField :value.sync="date">
				<template #trailing-button-icon>
					<ClockOutline/>
				</template>
			</NcTextField>
		</template>
		<NcActionButton v-for="time in timeList" :key="time" @click="change(parse(time))">
			<template #icon></template>
			{{ time }}
		</NcActionButton>
	</NcActions>
</template>

<script>
import { NcActions, NcTextField, NcActionButton } from '@nextcloud/vue'
import ClockOutline from 'vue-material-design-icons/ClockOutline.vue'
import moment from '@nextcloud/moment'
import { mapState } from 'pinia'
import useSettingsStore from '../../store/settings.js'

export default {
	name: 'TimePicker',
	components: {
		NcActions,
		NcTextField,
		NcActionButton,
		ClockOutline,
	},
	props: {
		initialDate: {
			type: Date,
			required: true,
		},
	},
	data() {
		return {
			date: '',
		}
	},
	mounted() {
		this.date = this.stringify(this.initialDate)
	},
	computed: {
		...mapState(useSettingsStore, {
			locale: 'momentLocale',
		}),
		/**
		 * Whether or not to offer am/pm in the timepicker
		 *
		 * @return {boolean}
		 */
		showAmPm() {
			const localeData = moment().locale(this.locale).localeData()
			const timeFormat = localeData.longDateFormat('LT').toLowerCase()

			return timeFormat.indexOf('a') !== -1
		},

		timeList() {
			const times = []
			let currentTime = moment(this.initialDate)

			for (let i = 0; i < 10; i++) {
				times.push(currentTime.format('LT'))
				currentTime = currentTime.add(15, 'minutes')
			}

			return times
		},
	},
	methods: {
		/**
		 * Emits a change event for the Date
		 *
		 * @param {Date} date The new Date object
		 */
		change(date) {
			this.date = this.stringify(date)
			this.$emit('change', date)
		},
		/**
		 * Formats the date string
		 *
		 * @param {Date} date The date for format
		 * @return {string}
		 */
		stringify(date) {
			return moment(date).locale(this.locale).format('LT')
		},
		/**
		 * Parses the user input from the input field
		 *
		 * @param {string} value The user-input to be parsed
		 * @return {Date}
		 */
		parse(value) {
			return moment(value, 'LT', this.locale).toDate()
		},
	},
}
</script>
