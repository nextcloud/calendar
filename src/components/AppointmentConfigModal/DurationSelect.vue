<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<SelectWrapper :label="label"
		:value="value"
		:disabled="disabled"
		:options="options"
		@update:value="$emit('update:value', parseInt($event))" />
</template>

<script>
import SelectWrapper from './SelectWrapper.vue'

export default {
	name: 'DurationSelect',
	components: {
		SelectWrapper,
	},
	props: {
		label: {
			type: String,
			default: '',
		},
		value: {
			type: Number,
			default: 5 * 60,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		allowZero: {
			type: Boolean,
			default: false,
		},
		min: {
			type: Number,
			default: 0,
		},
		max: {
			type: [Number, null, undefined],
			default: 60 * 60,
		},
	},
	computed: {
		options() {
			let options = []

			if (this.allowZero) {
				options.push({ value: 0, label: this.t('calendar', '0 minutes') })
			}

			options.push(...[
				// Minutes
				...[5, 10, 15, 30, 45].map(duration => {
					const label = this.n('calendar', '{duration} minute', '{duration} minutes', duration, {
						duration,
					})
					return { value: duration * 60, label }
				}),

				// Hours
				...[1, 2, 6].map(duration => {
					const label = this.n('calendar', '{duration} hour', '{duration} hours', duration, {
						duration,
					})
					return { value: duration * 60 * 60, label }
				}),

				// Days
				...[1, 2].map(duration => {
					const label = this.n('calendar', '{duration} day', '{duration} days', duration, {
						duration,
					})
					return { value: duration * 60 * 60 * 24, label }
				}),

				// Weeks
				...[1, 2, 4, 6].map(duration => {
					const label = this.n('calendar', '{duration} week', '{duration} weeks', duration, {
						duration,
					})
					return { value: duration * 60 * 60 * 24 * 7, label }
				}),

				// Months
				...[1, 2, 3, 6, 9].map(duration => {
					const label = this.n('calendar', '{duration} month', '{duration} months', duration, {
						duration,
					})
					return { value: duration * 60 * 60 * 24 * 30, label }
				}),

				// Years
				...[1].map(duration => {
					const label = this.n('calendar', '{duration} year', '{duration} years', duration, {
						duration,
					})
					return { value: duration * 60 * 60 * 24 * 365, label }
				}),
			])

			if (this.min) {
				options = options.filter(option => {
					return option.value >= this.min || (this.allowZero && option.value === 0)
				})
			}
			if (this.max) {
				options = options.filter(option => option.value <= this.max)
			}
			return options
		},
	},
}
</script>
