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
	<div class="repeat-option-set repeat-option-set--interval-freq">
		<span class="repeat-option-set__label">
			{{ repeatEveryLabel }}
		</span>
		<input
			v-if="!isIntervalDisabled"
			class="intervalInput"
			type="number"
			min="1"
			max="366"
			:value="interval"
			@input="changeInterval"
		>
		<repeat-freq-select
			:freq="frequency"
			:count="interval"
			@change="changeFrequency"
		/>
	</div>
</template>

<script>
import RepeatFreqSelect from './RepeatFreqSelect.vue'

export default {
	name: 'RepeatFreqInterval',
	components: {
		RepeatFreqSelect
	},
	props: {
		frequency: {
			type: String,
			required: true
		},
		interval: {
			type: Number,
			required: true
		}
	},
	computed: {
		repeatEveryLabel() {
			console.debug(this.frequency)
			if (this.frequency === 'NONE') {
				return this.$t('calendar', 'Repeat')
			}

			return this.$t('calendar', 'Repeat every')
		},
		isIntervalDisabled() {
			return this.frequency === 'NONE'
		}
	},
	methods: {
		changeFrequency(value) {
			if (value === 'NONE') {
				this.$emit('removeRepeat')
			} else {
				this.$emit('changeFrequency', value)
			}
		},
		/**
		 *
		 * @param {Event} event The Input-event triggered when modifying the input
		 */
		changeInterval(event) {
			const minimumValue = parseInt(event.target.min, 10)
			const maximumValue = parseInt(event.target.max, 10)
			const selectedValue = parseInt(event.target.value, 10)

			if (selectedValue >= minimumValue && selectedValue <= maximumValue) {
				this.$emit('changeInterval', selectedValue)
			}
		}
	}
}
</script>
