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
	<SelectWrapper :label="label"
		:value="value"
		:disabled="disabled"
		:options="options"
		@update:value="$emit('update:value', $event)" />
</template>

<script>
import SelectWrapper from './SelectWrapper.vue'

export default {
	name: 'VisibilitySelect',
	components: {
		SelectWrapper,
	},
	props: {
		label: {
			type: String,
			default: '',
		},
		value: {
			type: String,
			default: 'PUBLIC',
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			options: [
				{
					value: 'PUBLIC',
					label: this.t('calendar', 'Public – shown on the profile page'),
				},
				{
					value: 'PRIVATE',
					label: this.t('calendar', 'Private – only accessible via secret link'),
				},
			],
		}
	},
}
</script>
