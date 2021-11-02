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
	<div class="checked-duration-select">
		<div class="checked-duration-select__checkbox-row">
			<div class="checked-duration-select__checkbox-row__input-wrapper">
				<input
					:id="id"
					:checked="enabled"
					type="checkbox"
					@input="$emit('update:enabled', $event.target.checked)">
			</div>
			<label :for="id">{{ label }}</label>
		</div>
		<DurationSelect
			class="checked-duration-select__duration"
			:disabled="!enabled"
			:value="value"
			@update:value="$emit('update:value', $event)" />
	</div>
</template>

<script>
import DurationSelect from './DurationSelect'
import { randomId } from '../../utils/randomId'

export default {
	name: 'CheckedDurationSelect',
	components: {
		DurationSelect,
	},
	props: {
		label: {
			type: String,
			required: true,
		},
		value: {
			type: Number,
			default: undefined,
		},
		enabled: {
			type: Boolean,
			required: true,
		},
	},
	data() {
		return {
			id: randomId(),
		}
	},
}
</script>

<style lang="scss" scoped>
.checked-duration-select {
	&__checkbox-row {
		display: flex;
		align-items: center;

		&__input-wrapper {
			flex: 0 0 20px;

			input[type=checkbox] {
				margin: 0;
				min-height: unset;
				cursor: pointer;
			}
		}

		input, label {
			display: block;
		}
	}

	&__duration {
		//margin-left: 20px;
	}
}
</style>
