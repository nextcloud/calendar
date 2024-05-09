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
	<div v-if="display" class="property-select-multiple">
		<component :is="icon"
			:size="20"
			:name="readableName"
			class="property-select-multiple__icon"
			:class="{ 'property-select-multiple__icon--hidden': !showIcon }" />

		<div class="property-select-multiple__input"
			:class="{ 'property-select-multiple__input--readonly': isReadOnly }">
			<NcSelect v-if="!isReadOnly"
				:value="selectionData"
				:options="options"
				:searchable="true"
				:placeholder="placeholder"
				:name="readableName"
				:multiple="true"
				:taggable="true"
				:no-wrap="false"
				:deselect-from-dropdown="true"
				:create-option="(label) => ({ value: label, label })"
				input-id="label"
				label="label"
				@option:selecting="tag"
				@option:deselected="unselectValue">
				<template v-if="coloredOptions" #option="scope">
					<PropertySelectMultipleColoredOption :option="scope" />
				</template>
				<template v-if="coloredOptions" #selected-option-container="scope">
					<PropertySelectMultipleColoredOption :option="scope.option" :closeable="true" @deselect="unselectValue" />
				</template>
			</NcSelect>
			<!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
			<div v-else class="property-select-multiple-colored-tag-wrapper">
				<PropertySelectMultipleColoredTag v-for="singleValue in value"
					:key="singleValue.value"
					:option="singleValue" />
			</div>
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
import { NcSelect } from '@nextcloud/vue'
import PropertySelectMultipleColoredTag from './PropertySelectMultipleColoredTag.vue'
import PropertySelectMultipleColoredOption from './PropertySelectMultipleColoredOption.vue'
import { getLocale } from '@nextcloud/l10n'

import InformationVariant from 'vue-material-design-icons/InformationVariant.vue'

export default {
	name: 'PropertySelectMultiple',
	components: {
		PropertySelectMultipleColoredOption,
		PropertySelectMultipleColoredTag,
		// eslint-disable-next-line vue/no-reserved-component-names
		NcSelect,
		InformationVariant,
	},
	mixins: [
		PropertyMixin,
	],
	props: {
		coloredOptions: {
			type: Boolean,
			default: false,
		},
		closeOnSelect: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			selectionData: [],
		}
	},
	computed: {
		display() {
			return !(this.isReadOnly && this.selectionData.length === 0)
		},
		options() {
			const options = this.propModel.options.slice()
			for (const category of (this.selectionData ?? [])) {
				if (options.find(option => option.value === category.value)) {
					continue
				}

				// Add pseudo options for unknown values
				options.push({
					value: category.value,
					label: category.label,
				})
			}

			for (const category of this.value) {
				if (!options.find(option => option.value === category) && category !== undefined) {
					options.splice(options.findIndex(options => options.value === category), 1)
				}
			}

			if (this.customLabelBuffer) {
				for (const category of this.customLabelBuffer) {
					if (!options.find(option => option.value === category.value)) {
						options.push(category)
					}
				}
			}

			return options
				.sort((a, b) => {
					return a.label.localeCompare(
						b.label,
						getLocale().replace('_', '-'),
						{ sensitivity: 'base' },
					)
				})
		},
	},
	created() {
		for (const category of this.value) {
			// Create and select pseudo option if is not yet known
			const option = this.options.find(option => option.value === category)
				?? { label: category, value: category }
			this.selectionData.push(option)
		}
	},
	methods: {
		unselectValue(value) {
			if (!value) {
				return
			}

			this.$emit('remove-single-value', value.value)

			this.selectionData.splice(this.selectionData.findIndex(option => option.value === value.value), 1)

			// store removed custom options to keep it in the option list
			const options = this.propModel.options.slice()
			if (!options.find(option => option.value === value.value)) {
				if (!this.customLabelBuffer) {
					this.customLabelBuffer = []
				}
				this.customLabelBuffer.push(value)
			}
		},
		tag(value) {
			if (!value) {
				return
			}

			// budget deselectFromDropdown since the vue-select implementation doesn't work
			if (this.selectionData.find(option => option.value === value.value)) {
				this.selectionData.splice(this.selectionData.findIndex(option => option.value === value.value), 1)
			}

			this.selectionData.push(value)
			this.$emit('add-single-value', value.value)
		},
	},
}
</script>
