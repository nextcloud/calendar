<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcButton
		class="new-event"
		variant="primary"
		:aria-label="newEventButtonAriaLabel"
		@click="newEvent">
		<template #icon>
			<Plus :size="20" />
		</template>
		{{ $t('calendar', 'Event') }}
	</NcButton>
</template>

<script>
import { NcButton } from '@nextcloud/vue'
import { useHotKey } from '@nextcloud/vue/composables/useHotKey'
import { useRoute, useRouter } from 'vue-router/composables'
import Plus from 'vue-material-design-icons/Plus.vue'

export default {
	name: 'AppNavigationHeaderNewEvent',
	components: {
		Plus,
		NcButton,
	},

	setup() {
		const route = useRoute()
		const router = useRouter()

		/**
		 * Opens the new event dialog
		 */
		async function newEvent() {
			router.push(`/new/${route.params.view}`)
		}

		useHotKey('c', () => newEvent())

		return {
			newEvent,
		}
	},

	computed: {
		newEventButtonAriaLabel() {
			return this.$t('calendar', 'Create new event')
		},
	},
}
</script>
