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
	<div class="resource-room-type">
		<div class="resource-room-type__input">
			<NcSelect :value="getOption(value)"
				:options="options"
				:placeholder="placeholder"
				:clearable="false"
				input-id="value"
				label="label"
				@option:selected="changeValue">
				<template #option="option">
					<div>{{ option.label !== null ? option.label : "" }}</div>
				</template>
			</NcSelect>
		</div>
	</div>
</template>

<script>
import { NcSelect } from '@nextcloud/vue'
import { getAllRoomTypes } from '../../../models/resourceProps.js'

export default {
	name: 'ResourceRoomType',
	components: {
		NcSelect,
	},
	props: {
		value: {
			type: String,
			required: true,
		},
	},
	computed: {
		placeholder() {
			return this.$t('calendar', 'Room type')
		},
		options() {
			return [
				{ value: '', label: this.$t('calendar', 'Any') },
				...getAllRoomTypes(),
			]
		},
	},
	methods: {
		getOption(value) {
			// Selecting 'Any' will reset the input
			if (value === '') {
				return undefined
			}

			return this.options.find(option => option.value === value)
		},
		changeValue(option) {
			this.$emit('update:value', option.value)
		},
	},
}
</script>

<style scoped>
:deep(#value) {
  width: 0;
}
</style>
