<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<span class="property-select-multiple-colored-tag">
		<div class="property-select-multiple-colored-tag__color-indicator" :style="{ 'background-color': color}" />
		<span class="property-select-multiple-colored-tag__label">{{ label }}</span>
		<div v-if="closeable" class="icon icon-close" @click="deselect" />
	</span>
</template>

<script>
import { uidToColor } from '../../../utils/uidToColor.js'
import logger from '../../../utils/logger.js'

export default {
	name: 'PropertySelectMultipleColoredOption',
	props: {
		option: {
			type: [String, Object],
			required: true,
		},
		closeable: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['deselect'],
	computed: {
		label() {
			const option = this.option
			logger.debug('Option render', { option })
			if (typeof this.option === 'string') {
				return this.option
			}

			return this.option.label
		},
		colorObject() {
			return uidToColor(this.label)
		},
		color() {
			const color = this.colorObject
			return `rgb(${color.r},${color.g},${color.b})`
		},
	},
	methods: {
		deselect() {
			this.$emit('deselect', this.option)
		},
	},
}
</script>
