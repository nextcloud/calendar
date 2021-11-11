<template>
	<div class="update">
		The slot for your appointment from
		<br>
		<b>{{ startDate }}</b> to <b>{{ endDate }}</b>
		<br>
		is not available any more.
		<br>
		<br>
		Please choose a different slot <a :href="link">here</a>.
	</div>
</template>

<script>

import moment from '@nextcloud/moment'

export default {
	name: 'Conflict',
	props: {
		link: {
			required: true,
			type: String,
		},
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
