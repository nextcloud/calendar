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
		track-by="unit"
		label="label"
		@select="select"
	/>
</template>

<script>
import {
	Multiselect
} from 'nextcloud-vue'

export default {
	name: 'AlarmTimeUnitSelect',
	components: {
		Multiselect
	},
	props: {
		unit: {
			type: String,
			required: true
		},
		isAllDay: {
			type: Boolean,
			required: true
		},
		count: {
			type: Number,
			required: true
		}
	},
	computed: {
		options () {
			const options = []

			if (this.unit === 'seconds') {
				options.push({
					'label': n('calendar', 'second', 'seconds', this.count),
					'unit': 'seconds'
				})
			}

			if (!this.isAllDay || ['minutes', 'hours'].indexOf(this.unit) !== -1) {
				options.push({
					'label': n('calendar', 'minute', 'minutes', this.count),
					'unit': 'minutes'
				})
				options.push({
					'label': n('calendar', 'hour', 'hours', this.count),
					'unit': 'hours'
				})
			}

			options.push({
				'label': n('calendar', 'day', 'days', this.count),
				'unit': 'days'
			})
			options.push({
				'label': n('calendar', 'week', 'weeks', this.count),
				'unit': 'weeks'
			})

			return options
		},
		selected () {
			return this.options.find(o => o.unit === this.unit)
		}
	},
	methods: {
		select (value) {
			if (!value) {
				return
			}

			this.$emit('change', value.unit)
		}
	}
}
</script>
