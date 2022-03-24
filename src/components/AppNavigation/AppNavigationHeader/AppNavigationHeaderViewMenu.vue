<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  - @author Georg Ehrke <oc.list@georgehrke.com>
  -
  - @license GNU AGPL version 3 or any later version
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
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
import Actions from '@nextcloud/vue/dist/Components/Actions'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'

import ViewDay from 'vue-material-design-icons/ViewDay.vue'
import ViewGrid from 'vue-material-design-icons/ViewGrid.vue'
import ViewList from 'vue-material-design-icons/ViewList.vue'
import ViewModule from 'vue-material-design-icons/ViewModule.vue'
import ViewWeek from 'vue-material-design-icons/ViewWeek.vue'

export default {
	name: 'AppNavigationHeaderViewMenu',
	components: {
		Actions,
		ActionButton,
		ViewDay,
		ViewGrid,
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
				listMonth: ['l'],
				listMonth_Num: [4],
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
