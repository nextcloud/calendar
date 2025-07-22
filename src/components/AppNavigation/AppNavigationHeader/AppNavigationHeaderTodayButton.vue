<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<Hotkey :keys="['t']" @hotkey="today">
		<NcButton class="button today"
			@click="today">
			{{ $t('calendar', 'Today') }}
		</NcButton>
	</Hotkey>
</template>

<script>
import { NcButton } from '@nextcloud/vue'
import { Hotkey } from '@simolation/vue-hotkey'

export default {
	name: 'AppNavigationHeaderTodayButton',
	components: {
		NcButton,
		Hotkey,
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
