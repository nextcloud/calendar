<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="text-area">
		<label :for="id">{{ label }}</label>
		<textarea
			:id="id"
			v-autosize="true"
			:value="modelValue"
			:rows="2"
			@input="$emit('update:modelValue', $event.target.value)" />
	</div>
</template>

<script>
import autosize from '../../directives/autosize.js'
import { randomId } from '../../utils/randomId.js'

export default {
	name: 'TextArea',
	directives: {
		autosize,
	},

	props: {
		label: {
			type: String,
			required: true,
		},

		modelValue: {
			type: String,
			default: '',
		},
	},

	data() {
		return {
			id: randomId(),
		}
	},
}
</script>

<style lang="scss" scoped>
// TODO: move to global scss file
.text-area {
	textarea {
		display: block;
		width: 100%;
		resize: none;
	}
}
</style>
