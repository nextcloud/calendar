<template>
	<Multiselect
		:value="selectedTimezone"
		:options="options"
		:multiple="false"
		:group-select="false"
		:placeholder="placeholder"
		group-values="regions"
		group-label="continent"
		track-by="timezoneId"
		label="label"
		open-direction="above"
		@input="change" />
</template>

<script>
import {
	Multiselect,
} from '@nextcloud/vue'
import {
	getReadableTimezoneName,
	getSortedTimezoneList,
} from '../../utils/timezone.js'
import getTimezoneManager from '../../services/timezoneDataProviderService.js'

export default {
	name: 'TimezoneSelect',
	components: {
		Multiselect,
	},
	props: {
		additionalTimezones: {
			type: Array,
			default: () => [],
		},
		value: {
			type: String,
			required: true,
		},
	},
	computed: {
		placeholder() {
			return this.$t('calendar', 'Type to search timezone')
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
			return getSortedTimezoneList(timezoneManager.listAllTimezones(), this.additionalTimezones)
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
