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
	<div class="property-title">
		<div
			class="property-title__input"
			:class="{ 'property-title__input--readonly': isReadOnly }"
		>
			<input
				v-if="!isReadOnly"
				type="text"
				:placeholder="$t('calendar', 'Untitled event')"
				:value="value"
				@input.prevent.stop="changeValue"
			>
			<!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
			<div v-else>{{ value }}</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'PropertyTitle',
	props: {
		isReadOnly: {
			type: Boolean,
			required: true
		},
		value: {
			type: String,
			default: ''
		},
	},
	methods: {
		changeValue(event) {
			this.$emit('update:value', event.target.value)
		},
	}
}
</script>
