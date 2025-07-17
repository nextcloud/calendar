<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div v-if="hasAtLeastOneCalendar && tasks.length > 0"
		class="unscheduled-tasks-list">

		<template>
			<template v-if="tasks.length > 0">
				<UnscheduledTasksListItem v-for="config in tasks"
					:key="config.id"
					:config="config"
					@task-clicked="passTaskClick"
					:color="(calendarsStore.getCalendarById(config.extendedProps.calendarId)).color" />
			</template>
		</template>
	</div>
</template>

<script>
import UnscheduledTasksListItem from './UnscheduledTasksList/UnscheduledTasksListItem.vue'
import {
	NcAppNavigationCaption as AppNavigationCaption,
} from '@nextcloud/vue'
import useCalendarsStore from '../../store/calendars.js'
import useTasksStore from '../../store/unscheduledtasks.js'
import { mapStores } from 'pinia'

export default {
	name: 'UnscheduledTasksList',
	components: {
		UnscheduledTasksListItem,
		AppNavigationCaption,
	},

	computed: {
		...mapStores(useCalendarsStore, useTasksStore),

		tasks() {
			return this.tasksStore.GetTasks
		},

		hasAtLeastOneCalendar() {
			return !!this.calendarsStore.ownSortedCalendars[0]
		},
	},

	mounted() {
		this.$emit('tasks-empty', this.tasks.length === 0)
	},


	watch: {
		tasks(newTasks) {
			this.$emit('tasks-empty', newTasks.length === 0)
		},
	},

	methods: {
		passTaskClick(task) {
			this.$emit('task-clicked', task)
		}
	},
}
</script>
