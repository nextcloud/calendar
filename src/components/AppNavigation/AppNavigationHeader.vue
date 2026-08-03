<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import { computed } from 'vue'
import NcAppNavigationSearch from '@nextcloud/vue/components/NcAppNavigationSearch'
import AppNavigationHeaderDatePicker from './AppNavigationHeader/AppNavigationHeaderDatePicker.vue'
import AppNavigationHeaderNewEvent from './AppNavigationHeader/AppNavigationHeaderNewEvent.vue'
import AppNavigationHeaderTodayButton from './AppNavigationHeader/AppNavigationHeaderTodayButton.vue'
import AppNavigationHeaderViewMenu from './AppNavigationHeader/AppNavigationHeaderViewMenu.vue'
import useSettingsStore from '@/store/settings.js'

defineProps<{
	isPublic: boolean
}>()

const settingsStore = useSettingsStore()

const searchQuery = computed<string>({
	get: () => settingsStore.searchQuery,
	set: (val) => settingsStore.setSearchQuery(val),
})
</script>

<template>
	<header class="app-navigation-header">
		<NcAppNavigationSearch
			v-model="searchQuery"
			:label="t('calendar', 'Filter events …')"
			class="app-navigation-header__filter" />
		<AppNavigationHeaderDatePicker />
		<div class="new-event-today-view-section">
			<AppNavigationHeaderNewEvent v-if="!isPublic" />
			<AppNavigationHeaderTodayButton />
			<AppNavigationHeaderViewMenu />
		</div>
	</header>
</template>

<style lang="scss" scoped>
.app-navigation-header__filter {
	padding: 0;
	margin-bottom: var(--default-grid-baseline);
}
</style>
