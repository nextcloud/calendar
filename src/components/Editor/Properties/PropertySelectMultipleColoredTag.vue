<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
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
