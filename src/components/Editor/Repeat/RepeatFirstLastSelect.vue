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
	<NcSelect :allow-empty="false"
		:options="options"
		:value="selected"
		:disabled="disabled"
		:placeholder="$t('calendar', 'first')"
		:clearable="false"
		input-id="value"
		label="label"
		@input="select" />
</template>

<script>
import { NcSelect } from '@nextcloud/vue'
import { getTranslatedOrdinalNumber } from '../../../filters/recurrenceRuleFormat.js'

export default {
	name: 'RepeatFirstLastSelect',
	components: {
		NcSelect,
	},
	props: {
		/**
		 *
		 */
		bySetPosition: {
			type: Number,
			default: null,
		},
		/**
		 *
		 */
		disabled: {
			type: Boolean,
			required: true,
		},
	},
	computed: {
		options() {
			return [1, 2, 3, 4, 5, -2, -1].map((ordinal) => ({
				label: getTranslatedOrdinalNumber(ordinal),
				value: ordinal,
			}))
		},
		selected() {
			return this.options.find(option => option.value === this.bySetPosition)
		},
	},
	methods: {
		select(value) {
			if (!value) {
				return
			}

			console.debug(value)

			this.$emit('change', value.value)
		},
	},
}
</script>
