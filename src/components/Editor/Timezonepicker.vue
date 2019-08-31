<template>
	<div>
		<div v-if="show">
			<Multiselect :options="timezones" />
			<Multiselect :options="timezones" />
		</div>
		<button v-tooltip="t('calendar', 'set timezone')" class="icon-timezone" @click="show = !show" />
	</div>
</template>

<script>
import { Multiselect } from 'nextcloud-vue'
export default {
	name: 'Timezonepicker',
	components: {
		Multiselect
	},
	props: {
		eventComponent: {
			type: Object,
			default: false
		}
	},
	data() {
		return {
			show: false,
			timezones: ['de', 'en']
		}
	},
	computed: {
		timeFormat() {
			// if (this.eventComponent.isAllDay) {
			if (true) {
				return 'YYYY-MM-DD'
			}

			return 'YYYY-MM-DD HH:mm'
		},
		timeType() {
			// if (this.eventComponent.isAllDay) {
			if (true) {
				return 'date'
			}

			return 'datetime'
		}
	}
}
</script>

<style scoped>

</style>
