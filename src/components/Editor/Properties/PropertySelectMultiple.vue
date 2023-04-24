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
			:title="readableName"
			class="property-select-multiple__icon"
			:class="{ 'property-select-multiple__icon--hidden': !showIcon }" />

		<div class="property-select-multiple__input"
			:class="{ 'property-select-multiple__input--readonly': isReadOnly }">
			<Multiselect v-if="!isReadOnly"
				v-model="selectionData"
				:options="options"
				:searchable="true"
				:placeholder="placeholder"
				:tag-placeholder="tagPlaceholder"
				:allow-empty="true"
				:title="readableName"
				:multiple="true"
				:taggable="true"
				track-by="label"
				group-values="options"
				group-label="group"
				:group-select="false"
				label="label"
				@select="selectValue"
				@tag="tag"
				@remove="unselectValue">
				<template v-if="coloredOptions" #tag="scope">
					<PropertySelectMultipleColoredTag v-bind="scope" />
				</template>
				<template v-if="coloredOptions" #option="scope">
					<PropertySelectMultipleColoredOption v-bind="scope" />
				</template>
			</Multiselect>
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
import Multiselect from '@nextcloud/vue/dist/Components/NcMultiselect.js'
import PropertySelectMultipleColoredTag from './PropertySelectMultipleColoredTag.vue'
import PropertySelectMultipleColoredOption from './PropertySelectMultipleColoredOption.vue'
import { getLocale } from '@nextcloud/l10n'

import InformationVariant from 'vue-material-design-icons/InformationVariant.vue'

export default {
	name: 'PropertySelectMultiple',
	components: {
		PropertySelectMultipleColoredOption,
		PropertySelectMultipleColoredTag,
		Multiselect,
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
		customLabelHeading: {
			type: String,
			default: 'Custom Categories',
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
			let customOptions = options.find((optionGroup) => optionGroup.group === this.customLabelHeading)
			if (!customOptions) {
				customOptions = {
					group: this.customLabelHeading,
					options: [],
				}
				options.unshift(customOptions)
			}
			for (const category of (this.selectionData ?? [])) {
				if (this.findOption(category, options)) {
					continue
				}

				// Add pseudo options for unknown values
				customOptions.options.push({
					value: category.value,
					label: category.label,
				})
			}

			for (const category of this.value) {
				const categoryOption = { value: category, label: category }
				if (!this.findOption(categoryOption, options)) {
					customOptions.options.push(categoryOption)
				}
			}

			if (this.customLabelBuffer) {
				for (const category of this.customLabelBuffer) {
					if (!this.findOption(category, options)) {
						customOptions.options.push(category)
					}
				}
			}

			for (const optionGroup of options) {
				optionGroup.options = optionGroup.options.sort((a, b) => {
					return a.label.localeCompare(
						b.label,
						getLocale().replace('_', '-'),
						{ sensitivity: 'base' },
					)
				})
			}
			return options
		},
	},
	created() {
		for (const category of this.value) {
			const option = this.findOption({ value: category }, this.options)
			if (option) {
				this.selectionData.push(option)
			}
		}
	},
	methods: {
		selectValue(value) {
			if (!value) {
				return
			}

			this.$emit('add-single-value', value.value)
		},
		unselectValue(value) {
			if (!value) {
				return
			}

			this.$emit('remove-single-value', value.value)

			// store removed custom options to keep it in the option list
			const options = this.propModel.options.slice()
			if (!this.findOption(value, options)) {
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

			this.selectionData.push({ value, label: value })
			this.$emit('add-single-value', value)
		},
		findOption(value, availableOptions) {
			for (const optionGroup of availableOptions) {
				const option = optionGroup.options.find(option => option.value === value.value)
				if (option) {
					return option
				}
			}
			return undefined
		},
	},
}
</script>
