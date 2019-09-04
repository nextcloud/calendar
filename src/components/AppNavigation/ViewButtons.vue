<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
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
	<div class="button-group">
		<button :class="{active: isAgendaDayViewSelected}" class="button" @click="view('timeGridDay')">
			{{ labelAgendaDay }}
		</button>
		<button :class="{active: isAgendaWeekViewSelected}" class="button" @click="view('timeGridWeek')">
			{{ labelAgendaWeek }}
		</button>
		<button :class="{active: isMonthViewSelected}" class="button" @click="view('dayGridMonth')">
			{{ labelMonth }}
		</button>
	</div>
</template>

<script>
export default {
	name: 'TodayButton',
	computed: {
		labelAgendaDay() {
			return t('calendar', 'Day')
		},
		isAgendaDayViewSelected() {
			return this.selectedView === 'timeGridDay'
		},
		labelAgendaWeek() {
			return t('calendar', 'Week')
		},
		isAgendaWeekViewSelected() {
			return this.selectedView === 'timeGridWeek'
		},
		labelMonth() {
			return t('calendar', 'Month')
		},
		isMonthViewSelected() {
			return this.selectedView === 'dayGridMonth'
		},
		selectedView() {
			return this.$store.state.route.params.view
		}
	},
	methods: {
		view(viewName) {
			const name = this.$route.name
			const params = Object.assign({}, this.$route.params, {
				view: viewName
			})

			// Don't push new route when view didn't change
			if (this.$route.params.view === viewName) {
				return
			}

			this.$router.push({ name, params })
		}
	}
}
</script>
