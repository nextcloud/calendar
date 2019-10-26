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
	<div v-if="display" class="property-select-multiple">
		<div
			class="property-select-multiple__icon"
			:class="icon"
			:title="readableName" />

		<div
			class="property-select-multiple__input"
			:class="{ 'property-select-multiple__input--readonly': isReadOnly }">
			<Multiselect
				v-if="!isReadOnly"
				:options="options"
				:searchable="true"
				:placeholder="placeholder"
				:tag-placeholder="tagPlaceholder"
				:allow-empty="true"
				:title="readableName"
				:value="value"
				:multiple="true"
				:taggable="true"
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
				<PropertySelectMultipleColoredTag
					v-for="singleValue in value"
					:key="singleValue"
					:option="singleValue" />
			</div>
		</div>

		<div
			v-if="hasInfo"
			v-tooltip="info"
			class="property-select-multiple__info icon-details" />
	</div>
</template>

<script>
import PropertyMixin from '../../../mixins/PropertyMixin'
import { Multiselect } from '@nextcloud/vue'
import PropertySelectMultipleColoredTag from './PropertySelectMultipleColoredTag.vue'
import PropertySelectMultipleColoredOption from './PropertySelectMultipleColoredOption.vue'

export default {
	name: 'PropertySelectMultiple',
	components: {
		PropertySelectMultipleColoredOption,
		PropertySelectMultipleColoredTag,
		Multiselect
	},
	mixins: [
		PropertyMixin
	],
	props: {
		coloredOptions: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		display() {
			return !(this.isReadOnly && this.value.length === 0)
		},
		options() {
			return this.propModel.options
		}
	},
	methods: {
		selectValue(value) {
			if (!value) {
				return
			}

			this.$emit('addSingleValue', value)
		},
		unselectValue(value) {
			if (!value) {
				return
			}

			this.$emit('removeSingleValue', value)
		}
	}
}
</script>
