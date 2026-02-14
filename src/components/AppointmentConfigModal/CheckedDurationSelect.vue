<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="checked-duration-select">
		<div class="checked-duration-select__checkbox-row">
			<NcCheckboxRadioSwitch
				:modelValue="enabled"
				@update:checked="$emit('update:enabled', $event)">
				{{ label }}
			</NcCheckboxRadioSwitch>
		</div>
		<DurationSelect
			v-model="durationSelection"
			class="checked-duration-select__duration"
			:allowZero="defaultValue === 0"
			:disabled="!enabled"
			:min="min"
			:max="max" />
	</div>
</template>

<script>
import { NcCheckboxRadioSwitch } from '@nextcloud/vue'
import DurationSelect from './DurationSelect.vue'

export default {
	name: 'CheckedDurationSelect',
	components: {
		DurationSelect,
		NcCheckboxRadioSwitch,
	},

	props: {
		label: {
			type: String,
			required: true,
		},

		modelValue: {
			type: Number,
			default: 0,
		},

		defaultValue: {
			type: Number,
			default: 0,
		},

		enabled: {
			type: Boolean,
			required: true,
		},

		min: {
			type: Number,
			default: 0,
		},

		max: {
			type: [Number, null, undefined],
			default: 60 * 60,
		},
	},

	computed: {
		valueOrDefault() {
			return this.modelValue ?? this.defaultValue
		},

		durationSelection: {
			get() {
				return this.valueOrDefault
			},

			set(value) {
				this.$emit('update:modelValue', value)
			},
		},
	},
}
</script>

<style lang="scss" scoped>
.checked-duration-select {
	&__checkbox-row {
		display: flex;
		align-items: center;

		&__input-wrapper {
			flex: 0 0 20px;

			input[type=checkbox] {
				margin: 0;
				min-height: unset;
				cursor: pointer;
			}
		}

		input, label {
			display: block;
		}
	}

	&__duration {
		//margin-left: 20px;
	}
}
</style>
