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
	<div v-if="display" class="property-select">
		<div
			class="property-select__icon"
			:class="icon"
			:title="readableName" />

		<div
			class="property-select__input"
			:class="{ 'property-select__input--readonly': isReadOnly }">
			<Multiselect
				v-if="!isReadOnly"
				:options="options"
				:searchable="false"
				:allow-empty="false"
				:title="readableName"
				:value="selectedValue"
				track-by="value"
				label="label"
				@select="changeValue" />
			<!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
			<div v-else>{{ selectedValue.label }}</div>
		</div>

		<div
			v-if="hasInfo"
			v-tooltip="info"
			class="property-select__info icon-details" />
	</div>
</template>

<script>
import PropertyMixin from '../../../mixins/PropertyMixin'
import { Multiselect } from '@nextcloud/vue'

export default {
	name: 'PropertySelect',
	components: {
		Multiselect
	},
	mixins: [
		PropertyMixin
	],
	computed: {
		display() {
			return true
		},
		options() {
			return this.propModel.options
		},
		selectedValue() {
			const value = this.value || this.propModel.defaultValue
			return this.options.find((option) => option.value === value)
		}
	},
	methods: {
		changeValue(selectedOption) {
			if (!selectedOption) {
				return
			}

			this.$emit('update:value', selectedOption.value)
		}
	}
}
</script>
