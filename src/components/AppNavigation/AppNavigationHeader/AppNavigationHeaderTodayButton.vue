<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcButton v-shortkey="['t']"
		class="button today"
		@shortkey="today"
		@click="today">
		{{ $t('calendar', 'Today') }}
	</NcButton>
</template>

<script>
import { NcButton } from '@nextcloud/vue'

export default {
	name: 'AppNavigationHeaderTodayButton',
	components: {
		NcButton,
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
