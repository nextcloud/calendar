<template>
	<div class="update">
		The slot for your appointment from
		<br>
		<b>{{ startDate }}</b> to <b>{{ endDate }}</b>
		<br>
		booked for {{ booking.displayName }} ({{ booking.email }})
		<br>
		has been confirmed.
		<br>
	</div>
</template>

<script>
import moment from '@nextcloud/moment'

export default {
	name: 'Confirmation',
	props: {
		booking: {
			required: true,
			type: Object,
		},
	},
	computed: {
		startDate() {
			return moment(this.booking.start * 1000).format('LLL')
		},
		endDate() {
			return moment(this.booking.end * 1000).format('LLL')
		},
	},
}
</script>

<style scoped>
</style>
