<template>
	<multiselect :value="selectedTimezone" :options="options" :multiple="false"
		:group-select="false" :placeholder="placeholder" group-values="regions"
		group-label="continent" track-by="tzid" label="label"
		open-direction="above" @input="change" />
</template>

<script>
import { listAllTimezones } from '../../services/timezoneDataProviderService'

import detectTimezone from '../../services/timezoneDetectionService'
import { Multiselect } from 'nextcloud-vue'

const mappedTimezoneData = listAllTimezones().reduce((initial, value) => {
	const [continent, name] = value.split('/', 2)
	initial[continent] = initial[continent] || []
	initial[continent].push({
		label: name.split('_').join(' ').replace('St ', 'St. ').split('/').join(' - '),
		cities: [],
		tzid: value
	})

	return initial
}, {})
const options = Object.keys(mappedTimezoneData).map((m) => ({
	continent: m,
	regions: mappedTimezoneData[m],
}))

console.debug(options)

export default {
	name: 'TimezoneSelect',
	components: {
		Multiselect
	},
	props: {
		additionalTimezones: {
			type: Array,
			default: () => []
		},
		value: {
			type: String,
			required: true
		},
	},
	data() {
		return {
			options: this.additionalTimezones.concat(options)
		}
	},
	computed: {
		placeholder() {
			return t('calendar', 'Type to search timezone')
		},
		selectedTimezone() {
			console.debug('selected timezone ...', this.value)
			// return this.value
			return {
				'continent': t('calendar', 'Automatic'),
				'regions': [{
					tzid: 'automatic',
					cities: [],
					label: t('calendar', 'Automatic ({detected})', {
						detected: detectTimezone()
					})
				}] }
		}
	},
	methods: {
		change({ tzid }) {
			console.debug('emitting change for value ...', tzid)
			this.$emit('change', tzid)
		}
	}
}
</script>
