<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="repeat-option-set repeat-option-set--interval-freq">
		<NcTextField v-if="!isIntervalDisabled"
			:label="repeatEveryLabel"
			type="number"
			class="repeat-option-set__interval"
			min="1"
			max="366"
			:value="interval"
			@input="changeInterval" />
		<RepeatFreqSelect class="repeat-option-set__frequency"
			:freq="frequency"
			:count="interval"
			@change="changeFrequency" />
	</div>
</template>

<script>
import RepeatFreqSelect from './RepeatFreqSelect.vue'
import NcTextField from '@nextcloud/vue/dist/Components/NcTextField.js'

export default {
	name: 'RepeatFreqInterval',
	components: {
		RepeatFreqSelect,
		NcTextField,
	},
	props: {
		frequency: {
			type: String,
			required: true,
		},
		interval: {
			type: Number,
			required: true,
		},
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
		},
	},
	methods: {
		changeFrequency(value) {
			this.$emit('change-frequency', value)
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
				this.$emit('change-interval', selectedValue)
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.repeat-option-set {
	&__interval {
		margin: 0 5px 0 0;
	}

	&__frequency {
		min-width: unset !important;
		padding-top: 7px;
	}
}
</style>
