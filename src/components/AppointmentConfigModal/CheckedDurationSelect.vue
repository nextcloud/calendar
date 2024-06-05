<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="checked-duration-select">
		<div class="checked-duration-select__checkbox-row">
			<div class="checked-duration-select__checkbox-row__input-wrapper">
				<input :id="id"
					:checked="enabled"
					type="checkbox"
					@input="$emit('update:enabled', $event.target.checked)">
			</div>
			<label :for="id">{{ label }}</label>
		</div>
		<DurationSelect class="checked-duration-select__duration"
			:allow-zero="defaultValue === 0"
			:disabled="!enabled"
			:value="valueOrDefault"
			:min="min"
			:max="max"
			@update:value="$emit('update:value', $event)" />
	</div>
</template>

<script>
import DurationSelect from './DurationSelect.vue'
import { randomId } from '../../utils/randomId.js'

export default {
	name: 'CheckedDurationSelect',
	components: {
		DurationSelect,
	},
	props: {
		label: {
			type: String,
			required: true,
		},
		value: {
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
	data() {
		return {
			id: randomId(),
		}
	},
	computed: {
		valueOrDefault() {
			return this.value ?? this.defaultValue
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
