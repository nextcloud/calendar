<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<AppNavigationItem :name="title"
		@click="openUserSettings">
		<template #icon>
			<AlertCircleIcon :size="20" />
		</template>
	</AppNavigationItem>
</template>

<script>
import { NcAppNavigationItem as AppNavigationItem } from '@nextcloud/vue'
import AlertCircleIcon from 'vue-material-design-icons/AlertCircle.vue'
import { generateUrl } from '@nextcloud/router'

export default {
	name: 'NoEmailAddressWarning',
	components: {
		AppNavigationItem,
		AlertCircleIcon,
	},
	computed: {
		title() {
			return this.t('calendar', 'To configure appointments, add your email address in personal settings.')
		},
	},
	methods: {
		openUserSettings() {
			const url = generateUrl('settings/user')
			window.open(url, '_blank').focus()
		},
	},
}
</script>

<style lang="scss" scoped>
:deep {
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
</style>
