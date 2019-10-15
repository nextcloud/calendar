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
		track-by="type"
		label="label"
		@select="select"
	/>
</template>

<script>
import {
	Multiselect
} from 'nextcloud-vue'

export default {
	name: 'AlarmTypeSelect',
	components: {
		Multiselect
	},
	props: {
		alarmType: {
			type: String,
			required: true
		},
		disabled: {
			type: Boolean,
			required: true
		}
	},
	computed: {
		options() {
			/**
			 * This returns a list of options for the type select.
			 * By default, we only offer DISPLAY AND EMAIL.
			 * If necessary, we also display other Audio or Other
			 *
			 * @returns {Object[]}
			 */
			const options = [{
				'label': this.$t('calendar', 'Notification'),
				'type': 'DISPLAY'
			}, {
				'label': this.$t('calendar', 'Email'),
				'type': 'EMAIL'
			}]

			if (this.alarmType === 'AUDIO') {
				options.push({
					label: this.$t('calendar', 'Audio notification'),
					type: 'AUDIO'
				})
			}

			if (['AUDIO', 'DISPLAY', 'EMAIL'].indexOf(this.alarmType) === -1) {
				options.push({
					label: this.$t('calendar', 'Other'),
					type: this.alarmType
				})
			}

			return options
		},
		/**
		 * This is the selected option
		 *
		 * @returns {Object}
		 */
		selected() {
			return this.options.find(o => o.type === this.alarmType)
		}
	},
	methods: {
		/**
		 * This triggers the change event when the user selected a new notification type
		 *
		 * @param {Object} value
		 */
		select(value) {
			if (!value) {
				return
			}

			this.$emit('change', value.type)
		}
	}
}
</script>
