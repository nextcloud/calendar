<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcSelect :allow-empty="false"
		:options="options"
		:value="selected"
		:clearable="false"
		input-id="freq"
		label="label"
		@input="select" />
</template>

<script>
import { NcSelect } from '@nextcloud/vue'

export default {
	name: 'RepeatFreqSelect',
	components: {
		NcSelect,
	},
	props: {
		freq: {
			type: String,
			required: true,
		},
		count: {
			type: Number,
			required: true,
		},
	},
	computed: {
		options() {
			return [{
				label: this.$t('calendar', 'never'),
				freq: 'NONE',
			}, {
				label: this.$n('calendar', 'day', 'days', this.count),
				freq: 'DAILY',
			}, {
				label: this.$n('calendar', 'week', 'weeks', this.count),
				freq: 'WEEKLY',
			}, {
				label: this.$n('calendar', 'month', 'months', this.count),
				freq: 'MONTHLY',
			}, {
				label: this.$n('calendar', 'year', 'years', this.count),
				freq: 'YEARLY',
			}]
		},
		selected() {
			return this.options.find(o => o.freq === this.freq)
		},
	},
	methods: {
		select(value) {
			if (!value) {
				return
			}

			this.$emit('change', value.freq)
		},
	},
}
</script>
