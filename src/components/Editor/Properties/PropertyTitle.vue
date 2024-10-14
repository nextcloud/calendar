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
			<div v-else :class="{'property-title__input__rtl':isRTL}">{{ value }}</div>
		</div>
	</div>
</template>

<script>
import { isRTL, getLanguage } from '@nextcloud/l10n'
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
	computed: {
		isRTL() {
			return isRTL(getLanguage())
		},
	},
	methods: {
		changeValue(event) {
			this.$emit('update:value', event.target.value)
		},
	},
}
</script>
