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
	<div class="repeat-option-set repeat-option-set--weekly">
		<span class="repeat-option-set-section__title">
			{{ $t('calendar', 'on') }}
		</span>
		<div class="repeat-option-set-section__grid">
			<button
				v-for="option in options"
				:key="option.value"
				class="repeat-option-set-section-grid-item"
				:class="{ primary: option.selected }"
				@click="toggleByDay(option.value)"
			>
				{{ option.label }}
			</button>
		</div>
	</div>
</template>

<script>
import { getDayNamesMin } from '@nextcloud/l10n'

export default {
	name: 'RepeatFreqWeeklyOptions',
	props: {
		byDay: {
			type: Array,
			required: true
		}
	},
	computed: {
		options() {
			const dayNamesMin = getDayNamesMin()

			return [{
				label: dayNamesMin[1],
				value: 'MO',
				selected: this.byDay.includes('MO')
			}, {
				label: dayNamesMin[2],
				value: 'TU',
				selected: this.byDay.includes('TU')
			}, {
				label: dayNamesMin[3],
				value: 'WE',
				selected: this.byDay.includes('WE')
			}, {
				label: dayNamesMin[4],
				value: 'TH',
				selected: this.byDay.includes('TH')
			}, {
				label: dayNamesMin[5],
				value: 'FR',
				selected: this.byDay.includes('FR')
			}, {
				label: dayNamesMin[6],
				value: 'SA',
				selected: this.byDay.includes('SA')
			}, {
				label: dayNamesMin[0],
				value: 'SU',
				selected: this.byDay.includes('SU')
			}]
		}
	},
	methods: {
		toggleByDay(day) {
			if (this.byDay.indexOf(day) === -1) {
				this.$emit('addByDay', day)
			} else {
				if (this.byDay.length > 1) {
					this.$emit('removeByDay', day)
				}
			}
		},
	}
}
</script>
