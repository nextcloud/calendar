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
	name: 'RepeatFirstLastSelect',
	components: {
		Multiselect
	},
	props: {

	},
	computed: {
		options() {
			return [{
				label: t('calendar', 'first'),
				value: 1
			}, {
				label: t('calendar', 'second'),
				value: 2
			}, {
				label: t('calendar', 'third'),
				value: 3
			}, {
				label: t('calendar', 'fourth'),
				value: 4
			}, {
				label: t('calendar', 'fifth'),
				value: 5
			}, {
				label: t('calendar', 'second to last'),
				value: -2
			}, {
				label: t('calendar', 'last'),
				value: -1
			}]
		},
		selected() {
			return this.options.find(o => o.value === 1)
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
