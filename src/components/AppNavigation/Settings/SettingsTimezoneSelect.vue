<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<li class="settings-fieldset-interior-item settings-fieldset-interior-item--timezone">
		<label :for="inputId">
			{{ $t('calendar', 'Timezone') }}
		</label>
		<TimezonePicker
			v-model="timezone"
			:uid="inputId"
			:additionalTimezones="additionalTimezones" />
	</li>
</template>

<script>
import {
	showInfo,
} from '@nextcloud/dialogs'
import { NcTimezonePicker as TimezonePicker } from '@nextcloud/vue'
import { mapState, mapStores } from 'pinia'
import useSettingsStore from '../../../store/settings.js'
import { randomId } from '../../../utils/randomId.js'

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

	data() {
		return {
			timezone: null,
		}
	},

	computed: {
		...mapStores(useSettingsStore),
		...mapState(useSettingsStore, {
			initialTimezone: (store) => store.timezone || 'automatic',
		}),

		inputId() {
			return `input-${randomId()}`
		},

		/**
		 * Offer "Automatic" as an additional timezone
		 *
		 * @return {object[]}
		 */
		additionalTimezones() {
			const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
			return [{
				continent: this.$t('calendar', 'Automatic'),
				timezoneId: 'automatic',
				label: this.$t('calendar', 'Automatic ({timezone})', { timezone }),
			}]
		},
	},

	watch: {
		timezone(newTimezoneId) {
			this.setTimezoneValue(newTimezoneId)
		},
	},

	mounted() {
		this.timezone = this.initialTimezone
	},

	methods: {
		/**
		 * Updates the timezone set by the user
		 *
		 * @param {string} timezoneId New timezoneId to save
		 */
		setTimezoneValue(timezoneId) {
			this.settingsStore.setTimezone({ timezoneId })
				.catch((error) => {
					console.error(error)
					showInfo(this.$t('calendar', 'New setting was not saved successfully.'))
				})
		},
	},
}
</script>

<style scoped>
/* Ensure the label sits on top of the timezone picker rather than inline */
.settings-fieldset-interior-item--timezone {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}
</style>
