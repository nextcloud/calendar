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
			<NcColorPicker :model-value="selectedColor"
				:open.sync="selectorOpen"
				:advanced-fields="true"
				@submit="changeColor">
				<NcButton class="property-color__color-preview"
					:aria-label="$t('calendar', 'Open color picker')"
					:style="{ 'background-color': selectedColor }" />
			</NcColorPicker>
			<NcButton v-if="!isReadOnly && !!value"
				variant="tertiary"
				:aria-label="$t('calendar', 'Remove color')"
				@click="deleteColor">
				<template #icon>
					<Undo :size="20" decorative />
				</template>
			</NcButton>
		</div>
	</div>
</template>

<script>
import PropertyMixin from '../../../mixins/PropertyMixin.js'
import {
	NcButton,
	NcColorPicker,
} from '@nextcloud/vue'

import Undo from 'vue-material-design-icons/Undo.vue'

export default {
	name: 'PropertyColor',
	components: {
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
		}
	},

	computed: {
		selectedColor() {
			return this.value || this.calendarColor
		},
	},

	methods: {

		/**
		 * Changes / Sets the custom color of this event
		 * @param {string} newColor The new Color as HEX
		 */
		changeColor(newColor) {
			this.$emit('update:value', newColor)
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
