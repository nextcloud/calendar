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
	<div v-if="eventComponentLoaded" class="property-wrapper">
		<div class="property-icon" :class="icon" :title="readableName" />
		<div class="property-input">
			<multiselect v-model="value" :options="options" :searchable="false"
				:allow-empty="false" :title="readableName" track-by="value"
				label="label" @select="changeValue"
			/>
		</div>
		<div v-if="hasInfo" v-tooltip="info" class="property-info icon-details" />
	</div>
</template>

<script>
import PropertyMixin from '../../../mixins/PropertyMixin'

export default {
	name: 'PropertyText',
	mixins: [
		PropertyMixin
	],
	data() {
		return {
			value: null
		}
	},
	computed: {
		options() {
			return this.propModel.options
		}
	},
	watch: {
		eventComponent() {
			this.initValue()
		}
	},
	created() {
		this.initValue()
	},
	methods: {
		changeValue(selectedOption) {
			if (!selectedOption) {
				return
			}

			this.eventComponent[this.propModel.name] = selectedOption.value
		},
		initValue() {
			if (!this.eventComponent) {
				return
			}

			const value = this.eventComponent[this.propModel.name] || this.propModel.defaultValue
			this.value = this.options.find((option) => option.value === value)
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
</style>
