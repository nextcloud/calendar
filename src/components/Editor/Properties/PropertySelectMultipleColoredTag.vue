<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<span class="multiselect__tag"
		:style="{ 'background-color': color, 'border-color': borderColor, color: textColor }">
		<span>{{ label }}</span>
	</span>
</template>

<script>
import { uidToColor } from '../../../utils/uidToColor.js'
import { generateTextColorForRGB } from '../../../utils/color.js'

export default {
	name: 'PropertySelectMultipleColoredTag',
	props: {
		option: {
			type: [String, Object],
			required: true,
		},
		search: {
			type: String,
			default: undefined,
		},
		remove: {
			type: Function,
			default: () => {},
		},
	},
	computed: {
		label() {
			if (typeof this.option === 'string') {
				return this.option
			}
			return this.option.label
		},
		colorObject() {
			if (typeof this.option === 'string') {
				return uidToColor(this.option)
			}
			return uidToColor(this.option.label)
		},
		borderColor() {
			const color = this.colorObject
			return `rgb(${color.r},${color.g},${color.b})`
		},
		color() {
			const color = this.colorObject
			return `rgba(${color.r},${color.g},${color.b},0.7)`
		},
		textColor() {
			const color = this.colorObject
			return generateTextColorForRGB({
				red: color.r,
				green: color.g,
				blue: color.b,
			})
		},
	},
}
</script>
