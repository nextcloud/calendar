<!--
  - @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
  -
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
	<div class="resource-room-type">
		<div class="resource-room-type__input">
			<Multiselect :value="getOption(value)"
				:options="options"
				:placeholder="placeholder"
				track-by="value"
				label="label"
				@update:value="changeValue">
				<template #option="{ option }">
					<div>{{ option.label }}</div>
				</template>
			</Multiselect>
		</div>
	</div>
</template>

<script>
import Multiselect from '@nextcloud/vue/dist/Components/Multiselect'
import { getAllRoomTypes } from '../../../models/resourceProps'

export default {
	name: 'ResourceRoomType',
	components: {
		Multiselect,
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
