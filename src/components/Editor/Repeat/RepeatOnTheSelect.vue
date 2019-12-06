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
	<Multiselect
		:allow-empty="false"
		:options="options"
		:value="selected"
		:disabled="disabled"
		:placeholder="$t('calendar', 'Monday')"
		track-by="value"
		label="label"
		@select="select" />
</template>

<script>
import { Multiselect } from '@nextcloud/vue/dist/Components/Multiselect'
import { getDayNames } from '@nextcloud/l10n'

export default {
	name: 'RepeatOnTheSelect',
	components: {
		Multiselect,
	},
	props: {
		/**
		 *
		 */
		byDay: {
			type: Array,
			required: true,
		},
		disabled: {
			type: Boolean,
			required: true,
		},
	},
	computed: {
		options() {
			const dayNames = getDayNames()

			return [{
				label: dayNames[1],
				value: ['MO'],
			}, {
				label: dayNames[2],
				value: ['TU'],
			}, {
				label: dayNames[3],
				value: ['WE'],
			}, {
				label: dayNames[4],
				value: ['TH'],
			}, {
				label: dayNames[5],
				value: ['FR'],
			}, {
				label: dayNames[6],
				value: ['SA'],
			}, {
				label: dayNames[0],
				value: ['SU'],
			}, {
				label: this.$t('calendar', 'day'),
				value: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'],
			}, {
				label: this.$t('calendar', 'weekday'),
				value: ['MO', 'TU', 'WE', 'TH', 'FR'],
			}, {
				label: this.$t('calendar', 'weekend day'),
				value: ['SU', 'SA'],
			}]
		},
		selected() {
			return this.options.find(option => option.value.slice().sort().join(',') === this.byDay.slice().sort().join(','))
		},
	},
	methods: {
		select(value) {
			if (!value) {
				return
			}

			this.$emit('change', value.value)
		},
	},
}
</script>
