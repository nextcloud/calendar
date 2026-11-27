<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="view-button-section">
		<NcButton
			:variant="isAgendaDayViewSelected ? 'primary' : 'secondary'"
			class="button"
			@click="view('timeGridDay')">
			{{ $t('calendar', 'Day') }}
		</NcButton>
		<NcButton
			:variant="isAgendaWeekViewSelected ? 'primary' : 'secondary'"
			class="button"
			@click="view('timeGridWeek')">
			{{ $t('calendar', 'Week') }}
		</NcButton>
		<NcButton
			:variant="isMonthViewSelected ? 'primary' : 'secondary'"
			class="button"
			@click="view('dayGridMonth')">
			{{ $t('calendar', 'Month') }}
		</NcButton>
		<NcButton
			:variant="isYearViewSelected ? 'primary' : 'secondary'"
			class="button"
			@click="view('multiMonthYear')">
			{{ $t('calendar', 'Year') }}
		</NcButton>
		<NcButton
			:variant="isMonthListViewSelected ? 'primary' : 'secondary'"
			class="button"
			@click="view('listMonth')">
			{{ $t('calendar', 'List') }}
		</NcButton>
	</div>
</template>

<script>
import { NcButton } from '@nextcloud/vue'
import { mapStores } from 'pinia'
import useWidgetStore from '@/store/widget.js'
import { getViewSelectionLocation } from '@/utils/router.js'

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
				return
			}

			const location = getViewSelectionLocation(this.$route, viewName)
			if (location) {
				this.$router.push(location)
			}
		},
	},
}
</script>
