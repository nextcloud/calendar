<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
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
import { mapState } from 'vuex'
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
		...mapState({
			locale: (state) => state.settings.momentLocale,
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
