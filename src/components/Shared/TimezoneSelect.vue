<!--
  - SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<NcSelect
		v-model="selectedTimezone"
		:options="options"
		:multiple="false"
		:groupSelect="false"
		:placeholder="placeholder"
		:clearable="false"
		groupValues="regions"
		groupLabel="continent"
		trackBy="timezoneId"
		label="label"
		openDirection="above" />
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import { getReadableTimezoneName, getSortedTimezoneList } from '@nextcloud/timezones'
import { NcSelect } from '@nextcloud/vue'
import getTimezoneManager from '../../services/timezoneDataProviderService.js'

export default {
	name: 'TimezoneSelect',
	components: {
		NcSelect,
	},

	props: {
		additionalTimezones: {
			type: Array,
			default: () => [],
		},

		value: {
			type: String,
			default: 'floating',
		},
	},

	computed: {
		placeholder() {
			return this.$t('calendar', 'Type to search time zone')
		},

		selectedTimezone: {
			get() {
				for (const additionalTimezone of this.additionalTimezones) {
					if (additionalTimezone.timezoneId === this.value) {
						return additionalTimezone
					}
				}

				return {
					label: getReadableTimezoneName(this.value),
					timezoneId: this.value,
				}
			},

			set(newValue) {
				if (!newValue) {
					return
				}

				this.$emit('change', newValue.timezoneId)
			},
		},

		options() {
			const timezoneManager = getTimezoneManager()
			return getSortedTimezoneList(
				timezoneManager.listAllTimezones(),
				this.additionalTimezones,
				// TRANSLATORS This refers to global timezones in the timezone picker
				t('calendar', 'Global'),
			)
		},
	},

}
</script>
