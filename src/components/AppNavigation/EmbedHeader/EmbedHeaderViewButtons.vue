<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
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
import { mapStores } from 'pinia'
import useWidgetStore from '../../../store/widget.js'

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
		...mapStores(useWidgetStore),
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
				return this.widgetStore.widgetView
			}
			return this.$route.params.view
		},
	},
	methods: {
		view(viewName) {
			if (this.isWidget) {
				this.widgetStore.setWidgetView({ viewName })
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
