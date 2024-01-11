<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<span v-if="display">
		{{ recurrenceRule | formatRecurrenceRule(locale) }}
	</span>
	<span v-else>
		{{ $t('calendar', 'Does not repeat') }}
	</span>
</template>

<script>
import { mapState } from 'pinia'
import useSettingsStore from '../../../store/settings.js'
import formatRecurrenceRule from '../../../filters/recurrenceRuleFormat.js'

export default {
	name: 'RepeatSummary',
	filters: {
		formatRecurrenceRule,
	},
	props: {
		/**
		 * The recurrence-rule object as defined on the eventComponent
		 */
		recurrenceRule: {
			type: Object,
			required: true,
		},
	},
	computed: {
		...mapState(useSettingsStore, {
			locale: 'momentLocale',
		}),
		/**
		 * Returns whether or not to display the summary.
		 * We do not want to show it if it doesn't repeat
		 *
		 * @return {boolean}
		 */
		display() {
			return this.recurrenceRule.frequency !== 'NONE'
		},
	},
}
</script>
