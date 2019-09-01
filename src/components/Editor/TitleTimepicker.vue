<template>
	<div>
		<DatetimePicker
			lang="en"
			:format="timeFormat"
			:value="eventComponent.startDate.jsDate"
			:type="timeType"
		/>

		<DatetimePicker
			lang="en"
			:format="timeFormat"
			:value="eventComponent.endDate.jsDate"
			:type="timeType"
		/>
		<input id="allDay" type="checkbox" class="checkbox"
			:checked="eventComponent.isAllDay"
		>
		<label for="allDay">All Day</label>
	</div>
</template>

<script>
import { DatetimePicker } from 'nextcloud-vue'
export default {
	name: 'TitleTimepicker',
	components: {
		DatetimePicker
	},
	props: {
		eventComponent: {
			type: Object,
			default: () => {}
		}
	},
	computed: {
		timeFormat() {
			// if (this.eventComponent.isAllDay) {
			// if (true) {
			// 	return 'YYYY-MM-DD'
			// }

			return 'YYYY-MM-DD HH:mm'
		},
		timeType() {
			// if (this.eventComponent.isAllDay) {
			// if (true) {
			// 	return 'date'
			// }

			return 'datetime'
		}
	}
}
</script>

<style scoped>

</style>
