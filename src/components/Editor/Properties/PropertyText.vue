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
	<div v-if="display" class="property-text">
		<div
			class="property-text__icon"
			:class="icon"
			:title="readableName" />

		<div
			class="property-text__input"
			:class="{ 'property-text__input--readonly': isReadOnly }">
			<textarea
				v-if="!isReadOnly"
				v-autosize
				:placeholder="placeholder"
				:rows="rows"
				:title="readableName"
				:value="value"
				@input.prevent.stop="changeValue" />
			<!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
			<div v-else>{{ value }}</div>
		</div>

		<div
			v-if="hasInfo"
			v-tooltip="info"
			class="property-text__info icon-details" />
	</div>
</template>

<script>
import autosize from 'v-autosize'
import PropertyMixin from '../../../mixins/PropertyMixin'

export default {
	name: 'PropertyText',
	directives: {
		autosize,
	},
	mixins: [
		PropertyMixin,
	],
	computed: {
		display() {
			if (this.isReadOnly) {
				if (typeof this.value !== 'string') {
					return false
				}
				if (this.value.trim() === '') {
					return false
				}
			}

			return true
		},
		/**
		 * Returns the default number of rows for a textarea.
		 * This is used to give the description field an automatic size 2 rows
		 *
		 * @returns {number}
		 */
		rows() {
			return this.propModel.defaultNumberOfRows || 1
		},
	},
	methods: {
		changeValue(event) {
			if (event.target.value.trim() === '') {
				this.$emit('update:value', null)
			} else {
				this.$emit('update:value', event.target.value)
			}
		},
	},
}
</script>
