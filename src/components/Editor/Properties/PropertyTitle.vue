<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="property-title" :class="{ 'property-title--readonly': isReadOnly }">
		<div class="property-title__input"
			:class="{ 'property-title__input--readonly': isReadOnly }">
			<input v-if="!isReadOnly"
				v-focus
				type="text"
				autocomplete="off"
				:placeholder="t('calendar', 'Event title')"
				:value="value"
				@input.prevent.stop="changeValue">
			<!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
			<div v-else>{{ value }}</div>
		</div>
	</div>
</template>

<script>
import focus from '../../../directives/focus.js'

export default {
	name: 'PropertyTitle',
	directives: {
		focus,
	},
	props: {
		isReadOnly: {
			type: Boolean,
			required: true,
		},
		value: {
			type: String,
			default: '',
		},
	},
	methods: {
		changeValue(event) {
			this.$emit('update:value', event.target.value)
		},
	},
}
</script>
