<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div>
		<Hotkey :keys="['d']" @hotkey="selectView('timeGridDay')" />
		<Hotkey :keys="['1']" @hotkey="selectView('timeGridDay')" />
		<Hotkey :keys="['w']" @hotkey="selectView('timeGridWeek')" />
		<Hotkey :keys="['2']" @hotkey="selectView('timeGridWeek')" />
		<Hotkey :keys="['m']" @hotkey="selectView('dayGridMonth')" />
		<Hotkey :keys="['3']" @hotkey="selectView('dayGridMonth')" />
		<Hotkey :keys="['y']" @hotkey="selectView('multiMonthYear')" />
		<Hotkey :keys="['4']" @hotkey="selectView('multiMonthYear')" />
		<Hotkey :keys="['l']" @hotkey="selectView('listMonth')" />
		<Hotkey :keys="['5']" @hotkey="selectView('listMonth')" />

		<Actions menu-align="right">
			<template #icon>
				<component :is="defaultIcon" :size="20" decorative />
			</template>
			<ActionButton v-for="view in views"
				:key="view.id"
				:icon="view.icon"
				@click="selectView(view.id)">
				<template #icon>
					<component :is="view.icon" :size="20" decorative />
				</template>
				{{ view.label }}
			</ActionButton>
		</Actions>
	</div>
</template>

<script>
import {
	NcActions as Actions,
	NcActionButton as ActionButton,
} from '@nextcloud/vue'
import { Hotkey } from '@simolation/vue-hotkey'

import ViewDay from 'vue-material-design-icons/ViewDay.vue'
import ViewGrid from 'vue-material-design-icons/ViewGrid.vue'
import ViewList from 'vue-material-design-icons/ViewList.vue'
import ViewModule from 'vue-material-design-icons/ViewModule.vue'
import ViewWeek from 'vue-material-design-icons/ViewWeek.vue'
import ViewComfy from 'vue-material-design-icons/ViewComfy.vue'

export default {
	name: 'AppNavigationHeaderViewMenu',
	components: {
		Actions,
		ActionButton,
		Hotkey,
		ViewDay,
		ViewGrid,
		ViewComfy,
		ViewList,
		ViewModule,
		ViewWeek,
	},
	computed: {
		views() {
			return [{
				id: 'timeGridDay',
				icon: 'ViewDay',
				label: this.$t('calendar', 'Day'),
			}, {
				id: 'timeGridWeek',
				icon: 'ViewWeek',
				label: this.$t('calendar', 'Week'),
			}, {
				id: 'dayGridMonth',
				icon: 'ViewModule',
				label: this.$t('calendar', 'Month'),
			}, {
				id: 'multiMonthYear',
				icon: 'ViewComfy',
				label: this.$t('calendar', 'Year'),
			}, {
				id: 'listMonth',
				icon: 'ViewList',
				label: this.$t('calendar', 'List'),
			}]
		},
		defaultIcon() {
			for (const view of this.views) {
				if (view.id === this.$route.params.view) {
					return view.icon
				}
			}

			return 'ViewGrid'
		},
	},
	methods: {
		selectView(viewName) {
			const name = this.$route.name
			const params = Object.assign({}, this.$route.params, {
				view: viewName,
			})

			// Don't push new route when view didn't change
			if (this.$route.params.view === viewName) {
				return
			}

			this.$router.push({ name, params })
		},
	},
}
</script>
