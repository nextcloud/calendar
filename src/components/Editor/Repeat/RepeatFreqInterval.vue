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
	<div class="row">
		<span class="repeatLabel">
			{{ repeatEveryLabel }}
		</span>
		<input
			v-if="!isIntervalDisabled"
			class="intervalInput"
			type="number"
			min="1"
			max="366"
			v-model="interval"
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
			required: true,
			default: 1
		}
	},
	computed: {
		repeatEveryLabel() {
			if (this.frequency === 'NONE') {
				return t('calendar', 'Repeat')
			}

			return t('calendar', 'Repeat every')
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
		}
	}
}
</script>

<style scoped>
.row {
	display: flex;
	align-items: center;
}

.repeatLabel {
	font-weight: bold;
	margin-right: auto;
}

.intervalInput {
	width: 15%;
}

div.multiselect.multiselect--single {
	width: 30% !important;
}

</style>
