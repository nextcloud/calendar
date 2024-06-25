<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
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
				:label-outside="true"
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
