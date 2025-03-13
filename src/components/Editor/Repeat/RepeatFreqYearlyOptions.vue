<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="repeat-option-set repeat-option-set--yearly">
		<div class="repeat-option-set-section">
			<div class="repeat-option-set-section__grid">
				<NcButton v-for="option in options"
					:key="option.value"
					class="repeat-option-set-section-grid-item"
					:type="option.selected ? 'primary' : 'secondary'"
					@click="toggleByMonth(option.value)">
					{{ option.label }}
				</NcButton>
			</div>
		</div>
		<div class="repeat-option-set-section repeat-option-set-section--on-the-select">
			<ActionCheckbox class="repeat-option-set-section__title"
				:checked="isBySetPositionEnabled"
				@change="toggleBySetPosition">
				{{ $t('calendar', 'On the') }}
			</ActionCheckbox>
			<RepeatFirstLastSelect :by-set-position="bySetPosition"
				:disabled="!isBySetPositionEnabled"
				@change="changeBySetPosition" />
			<RepeatOnTheSelect :by-day="byDay"
				:disabled="!isBySetPositionEnabled"
				@change="changeByDay" />
		</div>
	</div>
</template>

<script>
import {
	NcActionCheckbox as ActionCheckbox,
	NcButton,
} from '@nextcloud/vue'
import RepeatFirstLastSelect from './RepeatFirstLastSelect.vue'
import RepeatOnTheSelect from './RepeatOnTheSelect.vue'

import { getMonthNamesShort } from '@nextcloud/l10n'

export default {
	name: 'RepeatFreqYearlyOptions',
	components: {
		ActionCheckbox,
		NcButton,
		RepeatFirstLastSelect,
		RepeatOnTheSelect,
	},
	props: {
		/**
		 *
		 */
		byDay: {
			type: Array,
			required: true,
		},
		/**
		 *
		 */
		byMonth: {
			type: Array,
			required: true,
		},
		/**
		 *
		 */
		bySetPosition: {
			type: Number,
			default: null,
		},
	},
	computed: {
		options() {
			const monthNamesShort = getMonthNamesShort()
			console.debug(this.byMonth)
			return monthNamesShort.map((monthName, index) => ({
				label: monthName,
				value: index + 1,
				selected: this.byMonth.includes(index + 1),
			}))
		},
		/**
		 *
		 *
		 * @return {boolean}
		 */
		isBySetPositionEnabled() {
			return this.bySetPosition !== null
		},
	},
	methods: {

		/**
		 *
		 * @param {string} byMonth The month to toggle
		 */
		toggleByMonth(byMonth) {
			if (this.byMonth.indexOf(byMonth) === -1) {
				this.$emit('add-by-month', byMonth)
			} else {
				if (this.byMonth.length > 1) {
					this.$emit('remove-by-month', byMonth)
				}
			}
		},
		/**
		 * Toggles the BySetPosition option for yearly
		 */
		toggleBySetPosition() {
			if (this.isBySetPositionEnabled) {
				this.$emit('disable-by-set-position')
			} else {
				this.$emit('enable-by-set-position')
			}
		},
		changeByDay(value) {
			this.$emit('change-by-day', value)
		},
		changeBySetPosition(value) {
			this.$emit('change-by-set-position', value)
		},
	},
}
</script>
