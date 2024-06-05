<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcButton v-shortkey="['c']"
		:aria-label="newEventButtonAriaLabel"
		class="button new-event"
		type="primary"
		@click="newEvent"
		@shortkey="newEvent">
		<template #icon>
			<Plus :size="20" />
		</template>
		{{ $t('calendar', 'Event') }}
	</NcButton>
</template>

<script>
import Plus from 'vue-material-design-icons/Plus.vue'
import { NcButton } from '@nextcloud/vue'

export default {
	name: 'AppNavigationHeaderNewEvent',
	components: {
		Plus,
		NcButton,
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
