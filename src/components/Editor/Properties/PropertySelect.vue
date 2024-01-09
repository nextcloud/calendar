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
	<div v-if="display"
		class="property-select"
		:class="{ 'property-select--readonly': isReadOnly }">
		<component :is="icon"
			:size="20"
			:name="readableName"
			class="property-select__icon"
			:class="{ 'property-select__icon--hidden': !showIcon }" />

		<div class="property-select__input"
			:class="{ 'property-select__input--readonly': isReadOnly }">
			<NcSelect v-if="!isReadOnly"
				:options="options"
				:searchable="false"
				:name="readableName"
				:value="selectedValue"
				:placeholder="placeholder"
				:clearable="false"
				input-id="value"
				label="label"
				@input="changeValue" />
			<!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
			<div v-else>{{ selectedValue.label }}</div>
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

import InformationVariant from 'vue-material-design-icons/InformationVariant.vue'

export default {
	name: 'PropertySelect',
	components: {
		NcSelect,
		InformationVariant,
	},
	mixins: [
		PropertyMixin,
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
		},
	},
	methods: {
		changeValue(selectedOption) {
			if (!selectedOption) {
				return
			}

			this.$emit('update:value', selectedOption.value)
		},
	},
}
</script>

<style lang="scss" scoped>

.property-select {
	&__input {
		// 34px left and right need to be subtracted. See https://github.com/nextcloud/calendar/pull/3361
		width: calc(100% - 34px - 34px);
	}
}

</style>
