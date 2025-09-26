<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="unscheduled-tasks-list">
		<UnscheduledTasksListItem
			v-for="config in tasks"
			:key="config.id"
			:config="config"
			:color="(calendarsStore.getCalendarById(config.extendedProps.calendarId)).color"
			@task-clicked="passTaskClick" />
	</div>
</template>

<script>
import { mapStores } from 'pinia'
import UnscheduledTasksListItem from './UnscheduledTasksList/UnscheduledTasksListItem.vue'
import useCalendarsStore from '../../store/calendars.js'
import useTasksStore from '../../store/unscheduledTasks.js'

export default {
	name: 'UnscheduledTasksList',
	components: {
		UnscheduledTasksListItem,
	},

	computed: {
		...mapStores(useCalendarsStore, useTasksStore),

		tasks() {
			return this.tasksStore.getTasks
		},

		hasAtLeastOneCalendar() {
			return !!this.calendarsStore.ownSortedCalendars[0]
		},
	},

	watch: {
		tasks(newTasks) {
			this.$emit('tasks-empty', newTasks.length === 0)
		},
	},

	mounted() {
		this.$emit('tasks-empty', this.tasks.length === 0)
	},

	methods: {
		passTaskClick(task) {
			this.$emit('task-clicked', task)
		},
	},
}
</script>
