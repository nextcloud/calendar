<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div class="guest-box">
		<div class="update">
			<div v-if="confirmed" class="confirmed">
				<h2>
					{{ $t('calendar', 'Thank you. Your booking from {startDate} to {endDate} has been confirmed.', {startDate:startDate, endDate:endDate}) }}
				</h2>
				{{ $t('calendar', 'Book another appointment:') }}
				<br>
				<a :href="link">{{ $t('calendar', 'See all available slots') }}</a>
			</div>
			<div v-else class="conflict">
				{{ $t('calendar', 'The slot for your appointment from {startDate} to {endDate} is not available any more.', {startDate:startDate, endDate:endDate}) }}
				<br>
				<br>
				{{ $t('calendar', 'Please book a different slot:') }}
				<br>
				<a :href="link">{{ $t('calendar', 'See all available slots') }}</a>
			</div>
		</div>
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
		confirmed: {
			required: true,
			type: Boolean,
		},
		start: {
			required: true,
			type: Number,
		},
	  end: {
		  required: true,
		  type: Number,
	  },
	},
	computed: {
		startDate() {
			return moment(this.start * 1000).format('LLL')
		},
		endDate() {
			return moment(this.end * 1000).format('LLL')
		},
	},
}
</script>
