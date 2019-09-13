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
		track-by="value"
		label="label"
		@select="select"
	/>
</template>

<script>
import { Multiselect } from 'nextcloud-vue'

export default {
	name: 'RepeatOnTheSelect',
	components: {
		Multiselect
	},
	props: {

	},
	computed: {
		options() {
			return [{
				label: dayNames[1],
				value: 'MO',
				isBySetPos: false
			}, {
				label: dayNames[2],
				value: 'TU',
				isBySetPos: false
			}, {
				label: dayNames[3],
				value: 'WE',
				isBySetPos: false
			}, {
				label: dayNames[4],
				value: 'TH',
				isBySetPos: false
			}, {
				label: dayNames[5],
				value: 'FR',
				isBySetPos: false
			}, {
				label: dayNames[6],
				value: 'SA',
				isBySetPos: false
			}, {
				label: dayNames[0],
				value: 'SU',
				isBySetPos: false
			}, {
				label: t('calendar', 'day'),
				value: 'SU,MO,TU,WE,TH,FR,SA',
				isBySetPos: true
			}, {
				label: t('calendar', 'weekday'),
				value: 'MO,TU,WE,TH,FR',
				isBySetPos: true
			}, {
				label: t('calendar', 'weekend day'),
				value: 'SU,SA',
				isBySetPos: true
			}]
		},
		selected() {
			return this.options.find((o) => o.value === 'SU,MO,TU,WE,TH,FR,SA')
		}
	},
	methods: {
		select(value) {
			if (!value) {
				return
			}

			this.$emit('change', value)
		}
	}
}
</script>
