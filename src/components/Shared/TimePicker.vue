<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcActions :manual-open="true"
		:open="isListOpen"
		@click="isListOpen = !isListOpen">
		<template #icon>
			<NcTextField :value.sync="date" :error="isInvalidTime">
				<ClockOutline/>
			</NcTextField>
		</template>
		<NcActionButton v-for="time in timeList" :key="time" @click="changeFromList(parse(time))">
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
			isInvalidTime: false,
			isListOpen: false,
		}
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
	watch: {
		date(value) {
			let isValidTime = false
			isValidTime = !isValidTime ? moment(value, 'LT', true).isValid() : isValidTime
			isValidTime = !isValidTime ? moment(value, 'HH:mm', true).isValid() : isValidTime
			isValidTime = !isValidTime ? moment(value, 'H:mm', true).isValid() : isValidTime

			// Meaning it was changed through textfield
			if (!(value instanceof Date) && isValidTime) {
				this.isInvalidTime = false

				const parsedDate = this.parse(value)
				this.$emit('change', parsedDate)
			} else if (!(value instanceof Date)) {
				this.isInvalidTime = true
			}
		},
	},
	mounted() {
		this.date = this.stringify(this.initialDate)
	},
	methods: {
		/**
		 * Emits a change event for the Date
		 *
		 * @param {Date} date The new Date object
		 */
		changeFromList(date) {
			this.isInvalidTime = false
			this.isListOpen = false

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
			try {
				return moment(value, 'LT', this.locale).toDate()
			} catch (e) {
				console.error(e)
			}
		},
	},
}
</script>

<style scoped>
:deep(.action-button__icon) {
	display: none;
}

:deep(.action-button__text) {
	margin: 0 8px;
}

:deep(.input-field__icon--trailing) {
	display: none;
}
</style>
