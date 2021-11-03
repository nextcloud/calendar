<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
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
	<li class="settings-fieldset-interior-item settings-fieldset-interior-item--timezone">
		<TimezonePicker
			:additional-timezones="additionalTimezones"
			:value="timezone"
			@input="setTimezoneValue" />
	</li>
</template>

<script>
import {
	mapState,
} from 'vuex'

import TimezonePicker from '@nextcloud/vue/dist/Components/TimezonePicker'
import { detectTimezone } from '../../../services/timezoneDetectionService.js'
import {
	showInfo,
} from '@nextcloud/dialogs'

export default {
	name: 'SettingsTimezoneSelect',
	components: {
		TimezonePicker,
	},
	props: {
		isDisabled: {
			type: Boolean,
			required: true,
		},
	},
	computed: {
		...mapState({
			timezone: state => (state.settings.timezone || 'automatic'),
		}),
		/**
		 * Offer "Automatic" as an additional timezone
		 *
		 * @return {object[]}
		 */
		additionalTimezones() {
			return [{
				continent: this.$t('calendar', 'Automatic'),
				timezoneId: 'automatic',
				label: this.$t('calendar', 'Automatic ({detected})', {
					detected: detectTimezone(),
				}),
			}]
		},
	},
	methods: {
		/**
		 * Updates the timezone set by the user
		 *
		 * @param {string} timezoneId New timezoneId to save
		 */
		setTimezoneValue(timezoneId) {
			this.$store.dispatch('setTimezone', { timezoneId })
				.catch((error) => {
					console.error(error)
					showInfo(this.$t('calendar', 'New setting was not saved successfully.'))
				})
		},
	},
}
</script>
