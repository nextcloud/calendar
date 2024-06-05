<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcSelect :allow-empty="false"
		:options="options"
		:value="selected"
		:disabled="disabled"
		:placeholder="$t('calendar', 'first')"
		:clearable="false"
		input-id="value"
		label="label"
		@input="select" />
</template>

<script>
import { NcSelect } from '@nextcloud/vue'

export default {
	name: 'RepeatFirstLastSelect',
	components: {
		NcSelect,
	},
	props: {
		/**
		 *
		 */
		bySetPosition: {
			type: Number,
			default: null,
		},
		/**
		 *
		 */
		disabled: {
			type: Boolean,
			required: true,
		},
	},
	computed: {
		options() {
			return [{
				label: this.$t('calendar', 'first'),
				value: 1,
			}, {
				label: this.$t('calendar', 'second'),
				value: 2,
			}, {
				label: this.$t('calendar', 'third'),
				value: 3,
			}, {
				label: this.$t('calendar', 'fourth'),
				value: 4,
			}, {
				label: this.$t('calendar', 'fifth'),
				value: 5,
			}, {
				label: this.$t('calendar', 'second to last'),
				value: -2,
			}, {
				label: this.$t('calendar', 'last'),
				value: -1,
			}]
		},
		selected() {
			return this.options.find(option => option.value === this.bySetPosition)
		},
	},
	methods: {
		select(value) {
			if (!value) {
				return
			}

			console.debug(value)

			this.$emit('change', value.value)
		},
	},
}
</script>
