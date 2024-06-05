<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<header class="app-navigation-header">
		<AppNavigationHeaderDatePicker />
		<div class="new-event-today-view-section">
			<AppNavigationHeaderNewEvent v-if="!isPublic" />
			<AppNavigationHeaderTodayButton />
			<AppNavigationHeaderViewMenu />
		</div>
	</header>
</template>

<script>
import AppNavigationHeaderDatePicker from './AppNavigationHeader/AppNavigationHeaderDatePicker.vue'
import AppNavigationHeaderTodayButton from './AppNavigationHeader/AppNavigationHeaderTodayButton.vue'
import AppNavigationHeaderNewEvent from './AppNavigationHeader/AppNavigationHeaderNewEvent.vue'
import AppNavigationHeaderViewMenu from './AppNavigationHeader/AppNavigationHeaderViewMenu.vue'

export default {
	name: 'AppNavigationHeader',
	components: {
		AppNavigationHeaderDatePicker,
		AppNavigationHeaderTodayButton,
		AppNavigationHeaderNewEvent,
		AppNavigationHeaderViewMenu,
	},
	props: {
		isPublic: {
			type: Boolean,
			required: true,
		},
	},
}
</script>
