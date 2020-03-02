<!--
  - @copyright Copyright (c) 2020 Georg Ehrke <oc.list@georgehrke.com>
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
	<div class="property-color">
		<div
			class="property-color__icon"
			:class="icon"
			:title="readableName" />

		<div
			v-if="isReadOnly"
			class="property-color__input property-color__input--readonly">
			<!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
			<div
				class="property-color__color-preview"
				:style="{'background-color': selectedColor }" />
		</div>
		<div
			v-else
			class="property-color__input">
			<ColorPicker
				:value="selectedColor"
				:open.sync="isColorPickerOpen"
				@input="changeColor">
				<button class="property-color__color-preview"
					:style="{'background-color': selectedColor }" />
			</ColorPicker>
			<Actions
				v-if="showColorRevertButton">
				<ActionButton
					icon="icon-history"
					@click.prevent.stop="deleteColor">
					{{ $t('calendar', 'Remove color') }}
				</ActionButton>
			</Actions>
		</div>
	</div>
</template>

<script>
import PropertyMixin from '../../../mixins/PropertyMixin'
import { Actions } from '@nextcloud/vue/dist/Components/Actions'
import { ActionButton } from '@nextcloud/vue/dist/Components/ActionButton'
import { ColorPicker } from '@nextcloud/vue/dist/Components/ColorPicker'
import debounce from 'debounce'

export default {
	name: 'PropertyColor',
	components: {
		Actions,
		ActionButton,
		ColorPicker,
	},
	mixins: [
		PropertyMixin,
	],
	props: {
		/**
		 * The color of the calendar
		 * this event is in
		 */
		calendarColor: {
			type: String,
			default: null,
		},
	},
	data() {
		return {
			isColorPickerOpen: false,
		}
	},
	computed: {
		/**
		 * The selected color is either custom or
		 * defaults to the color of the calendar
		 *
		 * @returns {String}
		 */
		selectedColor() {
			return this.value || this.calendarColor
		},
		/**
		 * Whether or not to show the delete color button
		 *
		 * @returns {Boolean}
		 */
		showColorRevertButton() {
			if (this.isReadOnly) {
				return false
			}

			return !!this.value
		},
	},
	methods: {
		/**
		 * Changes / Sets the custom color of this event
		 *
		 * The problem we are facing here is that the
		 * color-picker component uses normal hex colors,
		 * but the RFC 7986 property COLOR requires
		 * css-color-names.
		 *
		 * The color-space of css-color-names is smaller
		 * than the one of hex colors. Hence the color-
		 * picker (especially in the custom color-picker)
		 * will jump after the color changed. To prevent
		 * flickering, we only update the color after the
		 * user stopped moving the color-picker and not
		 * immediately.
		 *
		 * @param {String} newColor The new Color as HEX
		 */
		changeColor: debounce(function(newColor) {
			this.$emit('update:value', newColor)
		}, 500),
		/**
		 * Removes the custom color from this event,
		 * defaulting the color back to the calendar-color
		 */
		deleteColor() {
			this.$emit('update:value', null)
		},
	},
}
</script>
