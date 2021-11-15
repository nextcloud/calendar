<template>
	<div class="update">
		{{ $t('calendar', 'The slot for your appointment from {startDate} to {endDate} is not available any more.', {startDate:startDate, endDate:endDate}) }}
		<br>
		<br>
		{{ $t('calendar', 'Please book a different slot:') }}
		<br>
		<a :href="link">{{ $t('calendar', 'See all available slots') }}</a>
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
