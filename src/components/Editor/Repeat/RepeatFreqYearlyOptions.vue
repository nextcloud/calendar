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
					:class="option.selected ? 'primary' : 'secondary'"
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

			return [{
				label: monthNamesShort[0],
				value: 1,
				selected: this.byMonth.includes(1),
			}, {
				label: monthNamesShort[1],
				value: 2,
				selected: this.byMonth.includes(2),
			}, {
				label: monthNamesShort[2],
				value: 3,
				selected: this.byMonth.includes(3),
			}, {
				label: monthNamesShort[3],
				value: 4,
				selected: this.byMonth.includes(4),
			}, {
				label: monthNamesShort[4],
				value: 5,
				selected: this.byMonth.includes(5),
			}, {
				label: monthNamesShort[5],
				value: 6,
				selected: this.byMonth.includes(6),
			}, {
				label: monthNamesShort[6],
				value: 7,
				selected: this.byMonth.includes(7),
			}, {
				label: monthNamesShort[7],
				value: 8,
				selected: this.byMonth.includes(8),
			}, {
				label: monthNamesShort[8],
				value: 9,
				selected: this.byMonth.includes(9),
			}, {
				label: monthNamesShort[9],
				value: 10,
				selected: this.byMonth.includes(10),
			}, {
				label: monthNamesShort[10],
				value: 11,
				selected: this.byMonth.includes(11),
			}, {
				label: monthNamesShort[11],
				value: 12,
				selected: this.byMonth.includes(12),
			}]
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
