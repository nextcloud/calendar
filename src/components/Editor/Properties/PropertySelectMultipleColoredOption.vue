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
	<span class="property-select-multiple-colored-tag">
		<div v-if="!isGroupLabel" class="property-select-multiple-colored-tag__color-indicator" :style="{ 'background-color': color }" />
		<span class="property-select-multiple-colored-tag__label">{{ label }}</span>
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
	},
	computed: {
		isGroupLabel() {
			return this.option.$isLabel && this.option.$groupLabel
		},
		label() {
			const option = this.option
			logger.debug('Option render', { option })
			if (typeof this.option === 'string') {
				return this.option
			}

			return this.option.$groupLabel ? this.option.$groupLabel : this.option.label
		},
		colorObject() {
			return uidToColor(this.label)
		},
		color() {
			const color = this.colorObject
			return `rgb(${color.r},${color.g},${color.b})`
		},
	},
}
</script>
