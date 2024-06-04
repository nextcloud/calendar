<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="text-area">
		<label :for="id">{{ label }}</label>
		<textarea :id="id"
			v-autosize="true"
			:value="value"
			:rows="2"
			@input="$emit('update:value', $event.target.value)" />
	</div>
</template>

<script>
import { randomId } from '../../utils/randomId.js'
import autosize from '../../directives/autosize.js'

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
		value: {
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
