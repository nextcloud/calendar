<!--
  - SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="property-color" :class="{ 'property-color--readonly': isReadOnly }">
		<component
			:is="icon"
			:size="20"
			:name="readableName"
			class="property-color__icon"
			:class="{ 'property-color__icon--hidden': !showIcon }"
			decorative />

		<div
			v-if="isReadOnly"
			class="property-color__input property-color__input--readonly">
			<!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
			<div
				class="property-color__color-preview"
				:style="{ 'background-color': selectedColor }" />
		</div>
		<div
			v-else
			class="property-color__input">
			<NcColorPicker
				v-model="selectedColor"
				:shown.sync="selectorOpen"
				:advanced-fields="true"
				@update:modelValue="changeColor">
				<NcButton
					class="property-color__color-preview"
					:style="{ 'background-color': selectedColor }" />
			</NcColorPicker>
			<NcButton
				v-if="!isReadOnly && !!value"
				variant="tertiary"
				:arial-label="$t('calendar', 'Remove color')"
				@click="deleteColor">
				<template #icon>
					<Undo :size="20" decorative />
				</template>
			</NcButton>
		</div>
	</div>
</template>

<script>
import {
	NcActionButton as ActionButton,
	NcActions as Actions,
	NcButton,
	NcColorPicker,
} from '@nextcloud/vue'
import Undo from 'vue-material-design-icons/Undo.vue'
import PropertyMixin from '../../../mixins/PropertyMixin.js'

export default {
	name: 'PropertyColor',
	components: {
		Actions,
		ActionButton,
		NcButton,
		NcColorPicker,
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
			selectorOpen: false,
			selectedColor: null,
		}
	},

	mounted() {
		this.defaultColor()
	},

	methods: {

		/**
		 * Determines the default color to show
		 */
		defaultColor() {
			this.selectedColor = this.value || this.calendarColor
		},

		/**
		 * Changes / Sets the custom color of this event
		 *
		 * @param {string} newColor The new Color as HEX
		 */
		changeColor(newColor) {
			this.selectedColor = newColor
			this.$emit('update:value', newColor)
		},

		/**
		 * Removes the custom color from this event,
		 * defaulting the color back to the calendar-color
		 */
		deleteColor() {
			this.$emit('update:value', null)
			this.selectedColor = this.calendarColor
		},
	},
}
</script>
