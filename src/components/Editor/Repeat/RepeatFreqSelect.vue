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
		track-by="freq"
		label="label"
		@select="select"
	/>
</template>

<script>
import {
	Multiselect
} from '@nextcloud/vue'

export default {
	name: 'RepeatFreqSelect',
	components: {
		Multiselect
	},
	props: {
		freq: {
			type: String,
			required: true
		},
		count: {
			type: Number,
			required: true
		}
	},
	computed: {
		options() {
			return [{
				'label': this.$t('calendar', 'never'),
				'freq': 'NONE'
			}, {
				'label': this.$n('calendar', 'day', 'days', this.count),
				'freq': 'DAILY'
			}, {
				'label': this.$n('calendar', 'week', 'weeks', this.count),
				'freq': 'WEEKLY'
			}, {
				'label': this.$n('calendar', 'month', 'months', this.count),
				'freq': 'MONTHLY'
			}, {
				'label': this.$n('calendar', 'year', 'years', this.count),
				'freq': 'YEARLY'
			}]
		},
		selected() {
			return this.options.find(o => o.freq === this.freq)
		}
	},
	methods: {
		select(value) {
			if (!value) {
				return
			}

			this.$emit('change', value.freq)
		}
	}
}
</script>
