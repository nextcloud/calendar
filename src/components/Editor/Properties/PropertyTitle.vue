<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
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
	<div class="property-title" :class="{ 'property-title--readonly': isReadOnly }">
		<div class="property-title__input"
			:class="{ 'property-title__input--readonly': isReadOnly }">
			<input v-if="!isReadOnly"
				v-focus
				type="text"
				:placeholder="t('calendar', 'Event title')"
				:value="value"
				@input.prevent.stop="changeValue">
			<!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
			<div v-else>{{ value }}</div>
		</div>
	</div>
</template>

<script>
import focus from '../../../directives/focus.js'

export default {
	name: 'PropertyTitle',
	directives: {
		focus,
	},
	props: {
		isReadOnly: {
			type: Boolean,
			required: true,
		},
		value: {
			type: String,
			default: '',
		},
	},
	methods: {
		changeValue(event) {
			this.$emit('update:value', event.target.value)
		},
	},
}
</script>
