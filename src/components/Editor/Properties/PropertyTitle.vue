<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="property-title" :class="{ 'property-title--readonly': isReadOnly }">
		<div
			class="property-title__input"
			:class="{ 'property-title__input--readonly': isReadOnly }">
			<NcTextField
				v-if="!isReadOnly"
				v-focus
				:placeholder="t('calendar', 'Title')"
				:label="t('calendar', 'Title')"
				:labelOutside="true"
				:modelValue="value"
				@update:modelValue="changeValue" />
			<!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
			<div v-else :class="{ 'property-title__input__rtl': isRTL, 'property-title__input--cancelled': isCancelled }">{{ value }}</div>
		</div>
	</div>
</template>

<script>
import { getLanguage, isRTL, t } from '@nextcloud/l10n'
import { NcTextField } from '@nextcloud/vue'
import focus from '../../../directives/focus.js'

export default {
	name: 'PropertyTitle',

	components: {
		NcTextField,
	},

	directives: {
		focus,
	},

	props: {
		isReadOnly: {
			type: Boolean,
			required: true,
		},

		isCancelled: {
			type: Boolean,
			default: false,
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
		t,
		changeValue(value) {
			this.$emit('update:value', value)
		},
	},
}
</script>

<style scoped lang="scss">
.property-title__input--readonly {
	white-space: pre-wrap;
	overflow-wrap: break-word;
}

.property-title__input--cancelled {
	text-decoration-line: line-through;
	opacity: 0.7;
}
</style>
