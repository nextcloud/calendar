<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Richard Steinmetz <richard@steinmetz.cloud>
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
	<div v-if="display" class="property-select-multiple">
		<component :is="icon"
			:size="20"
			:title="readableName"
			class="property-select-multiple__icon"
			:class="{ 'property-select-multiple__icon--hidden': !showIcon }" />

		<div class="property-select-multiple__input"
			:class="{ 'property-select-multiple__input--readonly': isReadOnly }">
			<Multiselect v-if="!isReadOnly"
				:options="options"
				:searchable="true"
				:placeholder="placeholder"
				:tag-placeholder="tagPlaceholder"
				:allow-empty="true"
				:title="readableName"
				:value="value"
				:multiple="true"
				:taggable="true"
				track-by="value"
				label="label"
				@select="selectValue"
				@tag="selectValue"
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
import PropertyMixin from '../../../mixins/PropertyMixin'
import Multiselect from '@nextcloud/vue/dist/Components/Multiselect'
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
	},
	computed: {
		display() {
			return !(this.isReadOnly && this.value.length === 0)
		},
		options() {
			const options = this.propModel.options.slice()
			for (const value of (this.value ?? [])) {
				if (options.find(option => option.value === value)) {
					continue
				}

				// Add pseudo options for unknown values
				options.push({
					value,
					label: value,
				})
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
		},
	},
}
</script>
