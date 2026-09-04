<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div
		v-if="display"
		class="property-select">
		<component
			:is="icon"
			:title="info"
			:size="20"
			:name="readableName"
			class="property-select__icon"
			:class="{ 'property-select__icon--hidden': !showIcon }" />

		<div
			class="property-select__input">
			<!-- Ignore default margin, because we use flex gap for spacing. -->
			<NcSelect
				v-if="!isReadOnly"
				v-model="selectedValue"
				:style="{ marginBlock: 0 }"
				:options="options"
				:searchable="false"
				:name="readableName"
				:placeholder="placeholder"
				:labelOutside="true"
				:clearable="false"
				inputId="value"
				label="label" />
			<span v-else>{{ selectedValue.label }}</span>
		</div>
	</div>
</template>

<script>
import { NcSelect } from '@nextcloud/vue'
import InformationVariant from 'vue-material-design-icons/InformationVariant.vue'
import PropertyMixin from '../../../mixins/PropertyMixin.js'

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

		selectedValue: {
			get() {
				const value = this.value || this.propModel.defaultValue
				return this.options.find((option) => option.value === value)
			},

			set(selectedOption) {
				if (!selectedOption) {
					return
				}

				this.$emit('update:value', selectedOption.value)
			},
		},
	},
}
</script>

<style lang="scss" scoped>
.property-select__input {
	// Makes input always use full width.
	flex: auto;

	display: flex;
	// Makes content take full widht.
	flex-direction: column;
	// Centers content if it is smaller then the minimal widht.
	// Relevant if readonly text is shown instead of a select.
	justify-content: center;
}
</style>
