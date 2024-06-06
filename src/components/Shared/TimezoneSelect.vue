<!--
  - SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<NcSelect :value="selectedTimezone"
		:options="options"
		:multiple="false"
		:group-select="false"
		:placeholder="placeholder"
		:clearable="false"
		group-values="regions"
		group-label="continent"
		track-by="timezoneId"
		label="label"
		open-direction="above"
		@input="change" />
</template>

<script>
import { getReadableTimezoneName, getSortedTimezoneList } from '@nextcloud/timezones'
import { NcSelect } from '@nextcloud/vue'
import { translate as t } from '@nextcloud/l10n'

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
	methods: {
		change(newValue) {
			if (!newValue) {
				return
			}

			this.$emit('change', newValue.timezoneId)
		},
	},
}
</script>
