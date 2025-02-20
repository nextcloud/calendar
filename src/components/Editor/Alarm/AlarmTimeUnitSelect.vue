<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcSelect :allow-empty="false"
		:options="options"
		:value="selected"
		:disabled="disabled"
		:clearable="false"
		input-id="unit"
		label="label"
		@input="select" />
</template>

<script>
import { NcSelect } from '@nextcloud/vue'

export default {
	name: 'AlarmTimeUnitSelect',
	components: {
		NcSelect,
	},
	props: {
		unit: {
			type: String,
			required: true,
		},
		isAllDay: {
			type: Boolean,
			required: true,
		},
		count: {
			type: Number,
			required: true,
		},
		disabled: {
			type: Boolean,
			required: true,
		},
	},
	computed: {
		/**
		 * This returns a list of options for the unit select.
		 * We offer seconds only when we have to, not by default
		 *
		 * In All-day mode, we only offer days and weeks.
		 *
		 * @return {object[]}
		 */
		options() {
			const options = []

			if (this.unit === 'seconds') {
				options.push({
					label: this.$t('calendar', 'seconds'),
					unit: 'seconds',
				})
			}

			if (!this.isAllDay || ['minutes', 'hours'].indexOf(this.unit) !== -1) {
				options.push({
					label: this.$t('calendar', 'minutes'),
					unit: 'minutes',
				})
				options.push({
					label: this.$t('calendar', 'hours'),
					unit: 'hours',
				})
			}

			options.push({
				label: this.$t('calendar', 'days'),
				unit: 'days',
			})
			options.push({
				label: this.$t('calendar', 'weeks'),
				unit: 'weeks',
			})

			return options
		},
		/**
		 * This is the selected option
		 *
		 * @return {object}
		 */
		selected() {
			return this.options.find(o => o.unit === this.unit)
		},
	},
	methods: {
		/**
		 * This triggers the change event when the user selected a new unit
		 *
		 * @param {object} value The selected option
		 */
		select(value) {
			if (!value) {
				return
			}

			this.$emit('change', value.unit)
		},
	},
}
</script>
