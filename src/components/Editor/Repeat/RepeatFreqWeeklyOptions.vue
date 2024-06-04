<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="repeat-option-set repeat-option-set--weekly">
		<span class="repeat-option-set-section__title">
			{{ $t('calendar', 'on') }}
		</span>
		<div class="repeat-option-set-section__grid">
			<NcButton v-for="option in options"
				:key="option.value"
				class="repeat-option-set-section-grid-item"
				:type="option.selected ? 'primary' : 'secondary'"
				@click="toggleByDay(option.value)">
				{{ option.label }}
			</NcButton>
		</div>
	</div>
</template>

<script>
import { NcButton } from '@nextcloud/vue'
import { getDayNamesMin } from '@nextcloud/l10n'

export default {
	name: 'RepeatFreqWeeklyOptions',
	components: {
		NcButton,
	},
	props: {
		byDay: {
			type: Array,
			required: true,
		},
	},
	computed: {
		options() {
			const dayNamesMin = getDayNamesMin()

			return [{
				label: dayNamesMin[1],
				value: 'MO',
				selected: this.byDay.includes('MO'),
			}, {
				label: dayNamesMin[2],
				value: 'TU',
				selected: this.byDay.includes('TU'),
			}, {
				label: dayNamesMin[3],
				value: 'WE',
				selected: this.byDay.includes('WE'),
			}, {
				label: dayNamesMin[4],
				value: 'TH',
				selected: this.byDay.includes('TH'),
			}, {
				label: dayNamesMin[5],
				value: 'FR',
				selected: this.byDay.includes('FR'),
			}, {
				label: dayNamesMin[6],
				value: 'SA',
				selected: this.byDay.includes('SA'),
			}, {
				label: dayNamesMin[0],
				value: 'SU',
				selected: this.byDay.includes('SU'),
			}]
		},
	},
	methods: {
		toggleByDay(day) {
			if (this.byDay.indexOf(day) === -1) {
				this.$emit('add-by-day', day)
			} else {
				if (this.byDay.length > 1) {
					this.$emit('remove-by-day', day)
				}
			}
		},
	},
}
</script>
