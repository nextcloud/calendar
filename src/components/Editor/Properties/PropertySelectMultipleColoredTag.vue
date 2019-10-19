<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  -
  - @license GNU AGPL version 3 or any later version
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
	<span :key="option" class="multiselect__tag" :style="{ 'background-color': color, 'border-color': borderColor, color: textColor }">
		<span>{{ option }}</span>
	</span>
</template>

<script>
import { uidToColor } from '../../../utils/uidToColor.js'
import { generateTextColorForRGB } from '../../../utils/color.js'

export default {
	name: 'PropertySelectMultipleColoredTag',
	props: {
		option: {
			type: String,
			required: true
		},
		search: {
			type: String,
			default: undefined
		},
		remove: {
			type: Function,
			default: () => {}
		}
	},
	computed: {
		colorObject() {
			return uidToColor(this.option)
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
				blue: color.b
			})
		}
	}
}
</script>
