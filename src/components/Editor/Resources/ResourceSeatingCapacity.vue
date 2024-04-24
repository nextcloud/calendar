<!--
  - @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
  -
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
	<div class="resource-capacity">
		<NcTextField :label="placeholder"
			type="number"
			min="0"
			:placeholder="placeholder"
			:value="value"
			@input="changeValue" />
	</div>
</template>

<script>
import NcTextField from '@nextcloud/vue/dist/Components/NcTextField.js'
export default {
	name: 'ResourceSeatingCapacity',
	components: {
		NcTextField,
	},
	props: {
		value: {
			type: Number,
			required: true,
		},
	},
	computed: {
		placeholder() {
			return this.$t('calendar', 'Minimum seating capacity')
		},
	},
	methods: {
		changeValue(event) {
			this.$emit('update:value', parseInt(event.target.value))
		},
	},
}
</script>

<style lang="scss" scoped>
.resource-capacity {
	padding-bottom: 2px;
}
</style>
