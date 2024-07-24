<!--
  - SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="property-color" :class="{ 'property-color--readonly': isReadOnly }">
		<component :is="icon"
			:size="20"
			:name="readableName"
			class="property-color__icon"
			:class="{ 'property-color__icon--hidden': !showIcon }"
			decorative />

		<div v-if="isReadOnly"
			class="property-color__input property-color__input--readonly">
			<!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
			<div class="property-color__color-preview"
				:style="{'background-color': selectedColor }" />
		</div>
		<div v-else
			class="property-color__input">
			<ColorPicker :value="selectedColor"
				:shown.sync="isColorPickerOpen"
				:advanced-fields="true"
				@submit="changeColor">
				<NcButton class="property-color__color-preview"
					:style="{'background-color': selectedColor }" />
			</ColorPicker>
			<Actions v-if="showColorRevertButton">
				<ActionButton @click.prevent.stop="deleteColor">
					<template #icon>
						<Undo :size="20" decorative />
					</template>
					{{ $t('calendar', 'Remove color') }}
				</ActionButton>
			</Actions>
		</div>
	</div>
</template>

<script>
import PropertyMixin from '../../../mixins/PropertyMixin.js'
import {
	NcActions as Actions,
	NcButton,
	NcActionButton as ActionButton,
	NcColorPicker as ColorPicker,
} from '@nextcloud/vue'

import Undo from 'vue-material-design-icons/Undo.vue'

export default {
	name: 'PropertyColor',
	components: {
		Actions,
		ActionButton,
		NcButton,
		ColorPicker,
		Undo,
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
		 * @return {string}
		 */
		selectedColor() {
			return this.value || this.calendarColor
		},
		/**
		 * Whether or not to show the delete color button
		 *
		 * @return {boolean}
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
		 * @param {string} newColor The new Color as HEX
		 */
		changeColor(newColor) {
			this.$emit('update:value', newColor)
			this.isColorPickerOpen = false
		},
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
