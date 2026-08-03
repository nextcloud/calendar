<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'
import { NcAppNavigationItem } from '@nextcloud/vue'
import AlertCircleIcon from 'vue-material-design-icons/AlertCircle.vue'

const title = t('calendar', 'To configure appointments, add your email address in personal settings.')

function openUserSettings(): void {
	const url = generateUrl('settings/user')
	window.open(url, '_blank')?.focus()
}
</script>

<template>
	<NcAppNavigationItem
		:name="title"
		@click="openUserSettings">
		<template #icon>
			<AlertCircleIcon :size="20" class="no-email-warning__icon" />
		</template>
	</NcAppNavigationItem>
</template>

<style lang="scss" scoped>
:deep() {
	.app-navigation-entry-link {
		align-items: center;
		line-height: unset !important;
		white-space: unset !important;
	}

	.app-navigation-entry__name {
		overflow: unset !important;
		white-space: unset !important;
		text-overflow: unset !important;
	}
}

.no-email-warning__icon {
	color: var(--color-element-warning);
}
</style>
