<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import { NcActionButton, NcActions } from '@nextcloud/vue'
import { useHotKey } from '@nextcloud/vue/composables/useHotKey'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router/composables'
import ViewComfy from 'vue-material-design-icons/ViewComfy.vue'
import ViewDay from 'vue-material-design-icons/ViewDay.vue'
import ViewGrid from 'vue-material-design-icons/ViewGrid.vue'
import ViewList from 'vue-material-design-icons/ViewList.vue'
import ViewModule from 'vue-material-design-icons/ViewModule.vue'
import ViewWeek from 'vue-material-design-icons/ViewWeek.vue'

const route = useRoute()
const router = useRouter()

const views = [{
	id: 'timeGridDay',
	icon: ViewDay,
	label: t('calendar', 'Day'),
}, {
	id: 'timeGridWeek',
	icon: ViewWeek,
	label: t('calendar', 'Week'),
}, {
	id: 'dayGridMonth',
	icon: ViewModule,
	label: t('calendar', 'Month'),
}, {
	id: 'multiMonthYear',
	icon: ViewComfy,
	label: t('calendar', 'Year'),
}, {
	id: 'listMonth',
	icon: ViewList,
	label: t('calendar', 'List'),
}]

const defaultIcon = computed(() => {
	for (const view of views) {
		if (view.id === route.params.view) {
			return view.icon
		}
	}

	return ViewGrid
})

async function selectView(viewName: string): Promise<void> {
	// Don't push new route when view didn't change
	if (route.params.view === viewName) {
		return
	}

	const name = route.name!
	const params = {
		...route.params,
		view: viewName,
	}

	await router.push({ name, params })
}

useHotKey(['d', '1'], () => selectView('timeGridDay'))
useHotKey(['w', '2'], () => selectView('timeGridWeek'))
useHotKey(['m', '3'], () => selectView('dayGridMonth'))
useHotKey(['y', '4'], () => selectView('multiMonthYear'))
useHotKey(['l', '5'], () => selectView('listMonth'))
</script>

<template>
	<div>
		<NcActions menu-align="right">
			<template #icon>
				<component :is="defaultIcon" :size="20" />
			</template>
			<NcActionButton
				v-for="view in views"
				:key="view.id"
				:icon="view.icon"
				:close-after-click="true"
				@click="selectView(view.id)">
				<template #icon>
					<component :is="view.icon" :size="20" />
				</template>
				{{ view.label }}
			</NcActionButton>
		</NcActions>
	</div>
</template>
