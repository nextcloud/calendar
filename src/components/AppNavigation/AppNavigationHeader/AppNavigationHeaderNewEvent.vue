<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<Hotkey :keys="['c']" @hotkey="newEvent">
		<NcButton class="button new-event"
			type="primary"
			:aria-label="newEventButtonAriaLabel"
			@click="newEvent">
			<template #icon>
				<Plus :size="20" />
			</template>
			{{ $t('calendar', 'Event') }}
		</NcButton>
	</Hotkey>
</template>

<script>
import Plus from 'vue-material-design-icons/Plus.vue'
import { NcButton } from '@nextcloud/vue'
import { Hotkey } from '@simolation/vue-hotkey'

export default {
	name: 'AppNavigationHeaderNewEvent',
	components: {
		Plus,
		NcButton,
		Hotkey,
	},
	computed: {
		newEventButtonAriaLabel() {
			return this.$t('calendar', 'Create new event')
		},
	},
	methods: {
		/**
		 * Opens the new event dialog
		 */
		newEvent() {
			this.$router.push(`/new/${this.$route.params.view}`)
		},
	},
}
</script>

<style scoped>
.button.primary.new-event {
	display: flex;
	align-items: center;
}
</style>
