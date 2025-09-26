import { defineStore } from 'pinia'
import Vue from 'vue'
/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import useCalendarsStore from './calendars.js'

export default defineStore('tasks', {
	state: () => {
		return {
			map: {},
		}
	},
	getters: {
		getTasks() {
			const calendarsStore = useCalendarsStore()
			const tasks = []
			const ordered = Object.keys(this.map).sort().reduce(
				(obj, key) => {
					obj[key] = this.map[key]
					return obj
				},
				{},
			)
			for (const calendarId in ordered) {
				const calendar = calendarsStore.getCalendarById(calendarId)
				if (calendar.enabled) {
					tasks.push(...ordered[calendarId])
				}
			}
			return tasks
		},
	},

	actions: {

		finishCalendar(calendarid) {
			if (!this.map[calendarid]) {
				Vue.set(this.map, calendarid, [])
			} else {
				this.map[calendarid].sort(function(a, b) {
					return a.title.localeCompare(b.title)
				})
			}
		},

		/**
		 * Append a single task to the store
		 *
		 * @param calendarid calendar id of the task
		 * @param task The task to append to the store
		 */
		appendTask(calendarid, task) {
			if (!this.map[calendarid]) {
				Vue.set(this.map, calendarid, [])
			}
			const tasks = this.map[calendarid]
			const index = tasks.findIndex((el) => el.id === task.id)
			if (index === -1) {
				tasks.push(task)
			} else {
				tasks[index] = task
			}
		},

		/**
		 * Removes a single task from the store
		 *
		 * @param calendarid calendar id of the task
		 * @param task The task to remove from the store
		 */
		removeTask(calendarid, task) {
			if (!this.map[calendarid]) {
				return
			}
			const tasks = this.map[calendarid]
			const index = tasks.findIndex((el) => el.id === task.id)
			if (index !== -1) {
				tasks.splice(index, 1)
			}
		},

		emptyCalendar(calendarid) {
			delete this.map[calendarid]
		},

		empty() {
			this.map = {}
		},
	},
})
