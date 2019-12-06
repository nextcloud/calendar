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
	<Actions :default-icon="defaultIcon" menu-align="right">
		<ActionButton
			v-for="view in views"
			:key="view.id"
			:icon="view.icon"
			@click="selectView(view.id)">
			{{ view.label }}
		</ActionButton>
	</Actions>
</template>

<script>
import { Actions } from '@nextcloud/vue/dist/Components/Actions'
import { ActionButton } from '@nextcloud/vue/dist/Components/ActionButton'

export default {
	name: 'AppNavigationHeaderViewMenu',
	components: {
		Actions,
		ActionButton,
	},
	computed: {
		views() {
			return [{
				id: 'timeGridDay',
				icon: 'icon-view-day',
				label: this.$t('calendar', 'Day'),
			}, {
				id: 'timeGridWeek',
				icon: 'icon-view-week',
				label: this.$t('calendar', 'Week'),
			}, {
				id: 'dayGridMonth',
				icon: 'icon-view-module',
				label: this.$t('calendar', 'Month'),
			}]
		},
		defaultIcon() {
			for (const view of this.views) {
				if (view.id === this.$route.params.view) {
					return view.icon
				}
			}

			return 'icon-toggle-pictures'
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
