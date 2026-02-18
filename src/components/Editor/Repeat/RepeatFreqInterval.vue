<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="repeat-option-set repeat-option-set--interval-freq">
		<NcTextField
			v-if="!isIntervalDisabled"
			v-model="localInterval"
			:label="repeatEveryLabel"
			type="number"
			class="repeat-option-set__interval"
			min="1"
			max="366" />
		<RepeatFreqSelect
			class="repeat-option-set__frequency"
			:freq="frequency"
			:count="interval"
			@change="changeFrequency" />
	</div>
</template>

<script>
import NcTextField from '@nextcloud/vue/components/NcTextField'
import RepeatFreqSelect from './RepeatFreqSelect.vue'

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
			if (this.frequency === 'NONE') {
				return this.$t('calendar', 'Repeat')
			}

			return this.$t('calendar', 'Repeat every')
		},

		isIntervalDisabled() {
			return this.frequency === 'NONE'
		},

		localInterval: {
			get() {
				return this.interval
			},

			set(value) {
				const minimumValue = parseInt(this.$el?.querySelector('input')?.min || '1', 10)
				const maximumValue = parseInt(this.$el?.querySelector('input')?.max || '366', 10)
				const selectedValue = parseInt(value, 10)

				if (selectedValue >= minimumValue && selectedValue <= maximumValue) {
					this.$emit('changeInterval', selectedValue)
				}
			},
		},
	},

	methods: {
		changeFrequency(value) {
			this.$emit('changeFrequency', value)
		},
	},
}
</script>

<style lang="scss" scoped>
.repeat-option-set--interval-freq {
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);
}
</style>
