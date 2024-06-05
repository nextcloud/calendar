<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<Actions v-shortkey="shortKeyConf"
		menu-align="right"
		@shortkey.native="selectViewFromShortcut">
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
</template>

<script>
import {
	NcActions as Actions,
	NcActionButton as ActionButton,
} from '@nextcloud/vue'

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
		shortKeyConf() {
			return {
				timeGridDay: ['d'],
				timeGridDay_Num: [1],
				timeGridWeek: ['w'],
				timeGridWeek_Num: [2],
				dayGridMonth: ['m'],
				dayGridMonth_Num: [3],
				multiMonthYear: ['y'],
				multiMonthYear_Num: [4],
				listMonth: ['l'],
				listMonth_Num: [5],
			}
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
		selectViewFromShortcut(event) {
			this.selectView(event.srcKey.split('_')[0])
		},
	},
}
</script>
