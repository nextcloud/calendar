<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<span class="live-relative-timestamp" :data-timestamp="numericTimestamp * 1000" :name="title">{{ formatted }}</span>
</template>

<script>
import moment from '@nextcloud/moment'

export default {
	name: 'Moment',
	props: {
		timestamp: {
			type: [Date, Number],
			required: true,
		},
		format: {
			type: String,
			default: 'LLL',
		},
	},
	computed: {
		title() {
			return moment.unix(this.numericTimestamp).format(this.format)
		},
		formatted() {
			return moment.unix(this.numericTimestamp).fromNow()
		},
		numericTimestamp() {
			if (this.timestamp instanceof Date) {
				return this.timestamp.getTime() / 1000
			}
			return this.timestamp
		},
	},
}
</script>
