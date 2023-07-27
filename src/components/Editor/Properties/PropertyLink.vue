<!--
  - @copyright Copyright (c) 2023 Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU General Public License as published by
  - the Free Software Foundation, either version 3 of the License, or
  - (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU General Public License for more details.
  -
  - You should have received a copy of the GNU General Public License
  - along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -
  -->

<template>
	<div v-if="display" class="property-text">
		<component :is="icon"
			:size="20"
			:title="readableName"
			class="property-text__icon"
			:class="{ 'property-text__icon--hidden': !showIcon }" />

		<div class="property-text__input"
			:class="{ 'property-text__input--readonly': isReadOnly }">
			<NcInputField v-if="!isReadOnly"
				class="property-text__input"
				:placeholder="placeholder"
				:label="readableName"
				:value="value || ''"
				:show-trailing-button="hasValue"
				@trailing-button-click="openConference"
				@update:value="changeValue">
				<template #trailing-button-icon>
					<OpenInNewIcon :size="20" />
				</template>
			</NcInputField>
			<!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
			<div v-else
				v-linkify="{ text: value, linkify: true }" />
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
import PropertyMixin from '../../../mixins/PropertyMixin.js'
import linkify from '@nextcloud/vue/dist/Directives/Linkify.js'
import NcInputField from '@nextcloud/vue/dist/Components/NcInputField.js'

import InformationVariant from 'vue-material-design-icons/InformationVariant.vue'
import OpenInNewIcon from 'vue-material-design-icons/OpenInNew.vue'

export default {
	name: 'PropertyLink',
	directives: {
		linkify,
	},
	components: {
		InformationVariant,
		OpenInNewIcon,
		NcInputField,
	},
	mixins: [
		PropertyMixin,
	],
	data() {
		return {
			OpenInNewIcon,
		}
	},
	computed: {
		hasValue() {
			return this.value && this.value.trim() !== ''
		},
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
	},
	methods: {
		changeValue(value) {
			if (value.trim() === '') {
				this.$emit('update:value', null)
			} else {
				this.$emit('update:value', value)
			}
		},
		openConference() {
			if (this.hasValue) {
				window.open(this.value, '_blank')
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.property-text {
	&__input {
		::v-deep .input-field__main-wrapper {
			height: unset !important;

			.input-field__input {
				height: unset !important;
				padding: 12px 32px 12px 12px !important;
			}

			.input-field__clear-button {
				top: 0 !important;
				height: unset !important;

				&:hover {
					opacity: 0.8;
				}
			}
		}
	}
}
</style>
