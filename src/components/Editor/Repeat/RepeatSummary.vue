<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  -
  - @license GNU AGPL version 3 or any later version
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
	<div v-if="display" class="repeat-option-set repeat-option-set--summary">
		<span class="repeat-option-set-summary__label">{{ $t('calendar', 'Summary') }}:</span>
		<span class="repeat-option-set-summary__summary">
			{{ recurrenceRule | formatRecurrenceRule(locale) }}
		</span>
	</div>
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
		 * @returns {boolean}
		 */
		display() {
			return this.recurrenceRule.frequency !== 'NONE'
		},
	},
}
</script>
