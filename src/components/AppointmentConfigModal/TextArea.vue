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
	<div class="text-area">
		<label :for="id">{{ label }}</label>
		<textarea :id="id"
			v-autosize="true"
			:value="value"
			:rows="2"
			@input="$emit('update:value', $event.target.value)" />
	</div>
</template>

<script>
import { randomId } from '../../utils/randomId.js'
import autosize from '../../directives/autosize.js'

export default {
	name: 'TextArea',
	directives: {
		autosize,
	},
	props: {
		label: {
			type: String,
			required: true,
		},
		value: {
			type: String,
			default: '',
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
// TODO: move to global scss file
.text-area {
	textarea {
		display: block;
		width: 100%;
		resize: none;
	}
}
</style>
