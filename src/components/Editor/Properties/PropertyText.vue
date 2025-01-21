<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div v-if="display"
		class="property-text"
		:class="{ 'property-text--readonly': isReadOnly }">
		<component :is="icon"
			:size="20"
			:name="readableName"
			class="property-text__icon"
			:class="{ 'property-text__icon--hidden': !showIcon }" />

		<div class="property-text__input"
			:class="{ 'property-text__input--readonly': isReadOnly, 'property-text__input--linkify': showLinksClickable }">
			<textarea v-if="!isReadOnly && !showLinksClickable"
				v-autosize="true"
				:placeholder="placeholder"
				:rows="rows"
				:name="readableName"
				:value="value"
				:class="{ 'textarea--description': isDescription }"
				@focus="handleToggleTextareaFocus(true)"
				@blur="handleToggleTextareaFocus(false)"
				@input.prevent.stop="changeValue" />
			<!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
			<div v-else
				v-linkify="{ text: value, linkify: true }"
				:class="{ 'linkify-links': linkifyLinks && !isReadOnly }"
				:style="{ 'min-height': linkifyMinHeight }"
				@click="handleShowTextarea" />
		</div>

		<div v-if="hasInfo"
			v-tooltip="info"
			class="property-select__info">
			<InformationVariant :size="20"
				decorative />
		</div>
	</div>
</template>

<script>
import autosize from '../../../directives/autosize.js'
import PropertyMixin from '../../../mixins/PropertyMixin.js'
import { Linkify } from '@nextcloud/vue'

import InformationVariant from 'vue-material-design-icons/InformationVariant.vue'
import PropertyLinksMixin from '../../../mixins/PropertyLinksMixin.js'

export default {
	name: 'PropertyText',
	directives: {
		autosize,
		Linkify,
		InformationVariant,
	},
	mixins: [
		PropertyMixin,
		PropertyLinksMixin,
	],
	props: {
		isDescription: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		display() {
			if (this.isReadOnly) {
				if (typeof this.value !== 'string') {
					return false
				}
				if (this.value.trim() === '') {
					return false
				}
			}

			return true
		},
		/**
		 * Returns the default number of rows for a textarea.
		 * This is used to give the description field an automatic size 2 rows
		 *
		 * @return {number}
		 */
		rows() {
			return this.propModel.defaultNumberOfRows || 1
		},
	},
	methods: {
		changeValue(event) {
			if (event.target.value.trim() === '') {
				this.$emit('update:value', null)
			} else {
				this.$emit('update:value', event.target.value)
			}
		},
	},
}
</script>
<style lang="scss" scoped>
.textarea--description {
	height: 120px;
	overflow-y: auto;
}
</style>
