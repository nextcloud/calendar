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
	<div v-if="display" class="property-wrapper">
		<div class="property-icon" :class="icon" :title="readableName" />
		<div class="property-input">
			<multiselect
				v-if="!isReadOnly"
				:options="options"
				:searchable="false"
				:allow-empty="false"
				:title="readableName"
				:value="selectedValue"
				track-by="value"
				label="label"
				@select="changeValue" />
			<div v-if="isReadOnly" class="fake-input-box">{{ selectedValue.label }}</div>
		</div>
		<div v-if="hasInfo" v-tooltip="info" class="property-info icon-details" />
	</div>
</template>

<script>
import PropertyMixin from '../../../mixins/PropertyMixin'

export default {
	name: 'PropertySelect',
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

			console.debug(selectedOption)

			this.$emit('update:value', selectedOption)
		}
	},
}
</script>

<style scoped>
.property-wrapper {
	display: flex;
	width: 100%;
	align-items: flex-start;
	min-height: 46px;
}

.property-icon,
.property-info {
	height: 34px;
	width: 34px;
	margin-top: 3px;
}

.property-icon {
	margin-left: -5px;
	margin-right: 5px;
}

.property-info {
	opacity: .5;
}

.property-info:hover {
	opacity: 1
}

.property-input {
	flex-grow: 2;
}

.multiselect {
	width: 100%;
	margin: 3px 3px 3px 0;
}

.fake-input-box {
	white-space: pre-line;
	margin: 3px 3px 3px 0;
	padding: 8px 7px;
	background-color: var(--color-main-background);
	color: var(--color-main-text);
	outline: none;
}
</style>
