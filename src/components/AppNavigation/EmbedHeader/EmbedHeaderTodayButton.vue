<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="today-button-section">
		<NcButton :aria-label="title"
			class="button"
			:name="title"
			@click="today()">
			{{ $t('calendar', 'Today') }}
		</NcButton>
	</div>
</template>

<script>
import moment from '@nextcloud/moment'
import { NcButton } from '@nextcloud/vue'

export default {
	name: 'EmbedHeaderTodayButton',
	components: {
		NcButton,
	},
	computed: {
		title() {
			return moment().format('ll')
		},
	},
	methods: {
		today() {
			const name = this.$route.name
			const params = Object.assign({}, this.$route.params, {
				firstDay: 'now',
			})

			// Don't push new route when day didn't change
			if (this.$route.params.firstDay === 'now') {
				return
			}

			this.$router.push({ name, params })
		},
	},
}
</script>
