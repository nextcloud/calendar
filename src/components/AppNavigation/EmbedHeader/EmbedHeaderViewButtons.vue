<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
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
	<div class="view-button-section">
		<NcButton :type="isAgendaDayViewSelected ? 'primary' : 'secondary'"
			class="button"
			@click="view('timeGridDay')">
			{{ $t('calendar', 'Day') }}
		</NcButton>
		<NcButton :type="isAgendaWeekViewSelected ? 'primary' : 'secondary'"
			class="button"
			@click="view('timeGridWeek')">
			{{ $t('calendar', 'Week') }}
		</NcButton>
		<NcButton :type="isMonthViewSelected ? 'primary' : 'secondary'"
			class="button"
			@click="view('dayGridMonth')">
			{{ $t('calendar', 'Month') }}
		</NcButton>
		<NcButton :type="isYearViewSelected ? 'primary' : 'secondary'"
			class="button"
			@click="view('multiMonthYear')">
			{{ $t('calendar', 'Year') }}
		</NcButton>
		<NcButton :class="isMonthListViewSelected ? 'primary' : 'secondary'"
			class="button"
			@click="view('listMonth')">
			{{ $t('calendar', 'List') }}
		</NcButton>
	</div>
</template>

<script>
import { NcButton } from '@nextcloud/vue'

export default {
	name: 'EmbedHeaderViewButtons',
	components: {
		NcButton,
	},
	props: {
		isWidget: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		isAgendaDayViewSelected() {
			return this.selectedView === 'timeGridDay'
		},
		isAgendaWeekViewSelected() {
			return this.selectedView === 'timeGridWeek'
		},
		isMonthViewSelected() {
			return this.selectedView === 'dayGridMonth'
		},
		isYearViewSelected() {
		  return this.selectedView === 'multiMonthYear'
		},
		isMonthListViewSelected() {
			return this.selectedView === 'listMonth'
		},
		selectedView() {
			if (this.isWidget) {
				return this.$store.getters.widgetView
			}
			return this.$route.params.view
		},
	},
	methods: {
		view(viewName) {
			if (this.isWidget) {
				this.$store.commit('setWidgetView', { viewName })
			} else {
				const name = this.$route.name
				const params = Object.assign({}, this.$route.params, {
					view: viewName,
				})

				// Don't push new route when view didn't change
				if (this.$route.params.view === viewName) {
					return
				}

				this.$router.push({ name, params })

			}
		},
	},
}
</script>
