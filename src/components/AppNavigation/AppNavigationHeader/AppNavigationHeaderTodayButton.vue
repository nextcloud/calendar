<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import { NcButton } from '@nextcloud/vue'
import { useHotKey } from '@nextcloud/vue/composables/useHotKey'
import { useRoute, useRouter } from 'vue-router/composables'

const route = useRoute()
const router = useRouter()

async function today(): Promise<void> {
	// Don't push new route when day didn't change
	if (route.params.firstDay === 'now') {
		return
	}

	const name = route.name!
	const params = {
		...route.params,
		firstDay: 'now',
	}

	await router.push({ name, params })
}

useHotKey('t', () => today())
</script>

<template>
	<NcButton
		class="today"
		@click="today">
		{{ t('calendar', 'Today') }}
	</NcButton>
</template>
