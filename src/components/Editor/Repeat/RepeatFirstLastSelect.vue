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
import { getTranslatedOrdinalNumber } from '../../../filters/recurrenceRuleFormat.js'

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
			return [1, 2, 3, 4, 5, -2, -1].map((ordinal) => ({
				label: getTranslatedOrdinalNumber(ordinal),
				value: ordinal,
			}))
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
