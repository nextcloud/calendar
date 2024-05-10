/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author Thomas Citharel <tcit@tcit.fr>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import Vue from 'vue'
import { mapCalendarJsToCalendarObject } from '../models/calendarObject.js'
import logger from '../utils/logger.js'
import {
	createEvent,
	getParserManager,
	getTimezoneManager,
	DateTimeValue,
} from '@nextcloud/calendar-js'

const state = {
	calendarObjects: {},
	modificationCount: 0,
}

const mutations = {

	/**
	 * Adds an array of calendar-objects to the store
	 *
	 * @param {object} state The store data
	 * @param {object} data The destructuring object
	 * @param {object[]} data.calendarObjects Calendar-objects to add
	 */
	appendCalendarObjects(state, { calendarObjects = [] }) {
		for (const calendarObject of calendarObjects) {
			if (!state.calendarObjects[calendarObject.id]) {
				Vue.set(state.calendarObjects, calendarObject.id, calendarObject)
			}
		}
	},

	/**
	 * Adds one calendar-object to the store
	 *
	 * @param {object} state The store data
	 * @param {object} data The destructuring object
	 * @param {object} data.calendarObject Calendar-object to add
	 */
	appendCalendarObject(state, { calendarObject }) {
		if (!state.calendarObjects[calendarObject.id]) {
			Vue.set(state.calendarObjects, calendarObject.id, calendarObject)
		}
	},

	/**
	 * Updates a calendar-object id
	 *
	 * @param {object} state The store data
	 * @param {object} data The destructuring object
	 * @param {object} data.calendarObject Calendar-object to update
	 */
	updateCalendarObjectId(state, { calendarObject }) {
		if (calendarObject.dav === null) {
			calendarObject.id = null
		} else {
			calendarObject.id = btoa(calendarObject.dav.url)
		}
	},

	/**
	 * Updates a calendar-object's calendarId
	 *
	 * @param {object} state The store data
	 * @param {object} data The destructuring object
	 * @param {string} data.calendarObjectId Id of calendar-object to update
	 * @param {string} data.calendarId New calendarId
	 */
	updateCalendarObjectIdCalendarId(state, { calendarObjectId, calendarId }) {
		state.calendarObjects[calendarObjectId].calendarId = calendarId
	},

	/**
	 * Resets a calendar-object to it's original server state
	 *
	 * @param {object} state The store data
	 * @param {object} data The destructuring object
	 * @param {object} data.calendarObject Calendar-object to reset
	 */
	resetCalendarObjectToDav(state, { calendarObject }) {
		calendarObject = state.calendarObjects[calendarObject.id]

		// If this object does not exist on the server yet, there is nothing to do
		if (!calendarObject || !calendarObject.existsOnServer) {
			return
		}

		const parserManager = getParserManager()
		const parser = parserManager.getParserForFileType('text/calendar')
		parser.parse(calendarObject.dav.data)

		const itemIterator = parser.getItemIterator()
		const firstVCalendar = itemIterator.next().value
		if (firstVCalendar) {
			calendarObject.calendarComponent = firstVCalendar
		}
	},

	/**
	 * Removes a calendar-object from the store
	 *
	 * @param {object} state The store data
	 * @param {object} data The destructuring object
	 * @param {object} data.calendarObject Calendar-object to delete
	 */
	deleteCalendarObject(state, { calendarObject }) {
		Vue.delete(state.calendarObjects, calendarObject.id)
	},

	/**
	 * Increments the modification count
	 *
	 * @param {object} state The store data
	 */
	incrementModificationCount(state) {
		state.modificationCount++
	},
}

const getters = {

	/**
	 * Gets a calendar-object based on its id
	 *
	 * @param {object} state The store data
	 * @return {function({String}): CalendarObject}
	 */
	getCalendarObjectById: (state) => (id) => state.calendarObjects[id],
}

const actions = {

	/**
	 * Moves a calendar-object to a different calendar
	 *
	 * @param {object} context the store mutations
	 * @param {object} data destructuring object
	 * @param {CalendarObject} data.calendarObject Calendar-object to delete
	 * @param {string} data.newCalendarId Calendar-Id of calendar to move this calendar-object to
	 * @return {Promise<void>}
	 */
	async moveCalendarObject(context, { calendarObject, newCalendarId }) {
		if (!calendarObject.existsOnServer) {
			return
		}

		const oldCalendarObjectId = calendarObject.id
		const oldCalendarId = calendarObject.calendarId

		if (oldCalendarId === newCalendarId) {
			logger.error('Old calendar Id and new calendar Id are the same, nothing to move …')
			return
		}

		const newCalendar = context.getters.getCalendarById(newCalendarId)
		if (!newCalendar) {
			logger.error('Calendar to move to not found, aborting …')
			return
		}

		await calendarObject.dav.move(newCalendar.dav)
		// Update calendarId in calendarObject manually as it is not stored in dav
		context.commit('updateCalendarObjectIdCalendarId', {
			calendarObjectId: calendarObject.id,
			calendarId: newCalendarId,
		})

		context.commit('addCalendarObjectToCalendar', {
			calendar: {
				id: newCalendarId,
			},
			calendarObjectId: calendarObject.id,
		})
		context.commit('addCalendarObjectIdToAllTimeRangesOfCalendar', {
			calendarId: newCalendarId,
			calendarObjectId: calendarObject.id,
		})

		context.commit('deleteCalendarObjectFromCalendar', {
			calendar: {
				id: oldCalendarId,
			},
			calendarObjectId: oldCalendarObjectId,
		})
		context.commit('removeCalendarObjectIdFromAllTimeRangesOfCalendar', {
			calendarId: oldCalendarId,
			calendarObjectId: oldCalendarObjectId,
		})

		context.commit('incrementModificationCount')
	},

	/**
	 * Updates a calendar-object
	 *
	 * @param {object} context the store mutations
	 * @param {object} data destructuring object
	 * @param {CalendarObject} data.calendarObject Calendar-object to delete
	 * @return {Promise<void>}
	 */
	async updateCalendarObject(context, { calendarObject }) {
		if (calendarObject.existsOnServer) {
			calendarObject.dav.data = calendarObject.calendarComponent.toICS()
			await calendarObject.dav.update()

			context.commit('addCalendarObjectIdToAllTimeRangesOfCalendar', {
				calendarId: calendarObject.calendarId,
				calendarObjectId: calendarObject.id,
			})
			context.commit('incrementModificationCount')

			return

			// TODO - catch conflicts
		}

		const calendar = context.getters.getCalendarById(calendarObject.calendarId)
		calendarObject.dav = await calendar.dav.createVObject(calendarObject.calendarComponent.toICS())
		calendarObject.existsOnServer = true
		context.commit('updateCalendarObjectId', { calendarObject })

		context.commit('appendCalendarObject', { calendarObject })
		context.commit('addCalendarObjectToCalendar', {
			calendar: {
				id: calendarObject.calendarId,
			},
			calendarObjectId: calendarObject.id,
		})
		context.commit('addCalendarObjectIdToAllTimeRangesOfCalendar', {
			calendarId: calendarObject.calendarId,
			calendarObjectId: calendarObject.id,
		})
		context.commit('resetCalendarObjectToDav', { calendarObject })
		context.commit('incrementModificationCount')
	},

	/**
	 * Creates a new calendar-object from an recurrence-exception fork
	 *
	 * @param {object} context The Vuex context
	 * @param {object} data destructuring object
	 * @param {EventComponent} data.eventComponent EventComponent to store
	 * @param {string} data.calendarId The calendar-id to store it in
	 * @return {Promise<void>}
	 */
	async createCalendarObjectFromFork(context, { eventComponent, calendarId }) {
		const calendar = context.getters.getCalendarById(calendarId)
		const calendarObject = mapCalendarJsToCalendarObject(eventComponent.root, calendar.id)
		calendarObject.dav = await calendar.dav.createVObject(calendarObject.calendarComponent.toICS())
		calendarObject.existsOnServer = true
		context.commit('updateCalendarObjectId', { calendarObject })

		context.commit('appendCalendarObject', { calendarObject })
		context.commit('addCalendarObjectToCalendar', {
			calendar: {
				id: calendarObject.calendarId,
			},
			calendarObjectId: calendarObject.id,
		})
		context.commit('addCalendarObjectIdToAllTimeRangesOfCalendar', {
			calendarId: calendar.id,
			calendarObjectId: calendarObject.id,
		})
		context.commit('incrementModificationCount')
	},

	/**
	 * Deletes a calendar-object
	 *
	 * @param {object} context the store mutations
	 * @param {object} data destructuring object
	 * @param {CalendarObject} data.calendarObject Calendar-object to delete
	 * @return {Promise<void>}
	 */
	async deleteCalendarObject(context, { calendarObject }) {
		// If this calendar-object was not created on the server yet,
		// no need to send requests to the server
		if (calendarObject.existsOnServer) {
			await calendarObject.dav.delete()
		}

		context.commit('deleteCalendarObject', { calendarObject })
		context.commit('deleteCalendarObjectFromCalendar', {
			calendar: {
				id: calendarObject.calendarId,
			},
			calendarObjectId: calendarObject.id,
		})
		context.commit('removeCalendarObjectIdFromAnyTimeRange', {
			calendarObjectId: calendarObject.id,
		})
		context.commit('incrementModificationCount')
	},

	/**
	 * Creates a new calendar object based on start, end, timezone and isAllDay
	 *
	 * @param {object} context the store mutations
	 * @param {object} data destructuring object
	 * @param {number} data.start Timestamp for start of new event
	 * @param {number} data.end Timestamp for end of new event
	 * @param {string} data.timezoneId asd
	 * @param {boolean} data.isAllDay foo
	 * @return {Promise<CalendarObject>}
	 */
	createNewEvent(context, { start, end, timezoneId, isAllDay }) {
		const timezoneManager = getTimezoneManager()
		const timezone = timezoneManager.getTimezoneForId(timezoneId)

		const startDate = new Date(start * 1000)
		const endDate = new Date(end * 1000)

		const startDateTime = DateTimeValue
			.fromJSDate(startDate, true)
			.getInTimezone(timezone)
		const endDateTime = DateTimeValue
			.fromJSDate(endDate, true)
			.getInTimezone(timezone)

		if (isAllDay) {
			startDateTime.isDate = true
			endDateTime.isDate = true
		}

		const calendar = createEvent(startDateTime, endDateTime)
		for (const vObject of calendar.getVObjectIterator()) {
			vObject.undirtify()
		}

		const firstCalendar = context.getters.sortedCalendars[0].id
		return Promise.resolve(mapCalendarJsToCalendarObject(calendar, firstCalendar))
	},

	/**
	 * Updates the time of the new calendar object
	 *
	 * @param {object} data The destructuring object for Vuex
	 * @param {Function} data.commit The Vuex commit function
	 * @param {Function} data.dispatch The Vuex dispatch function
	 * @param {object} data2 destructuring object
	 * @param {CalendarObject} data2.calendarObjectInstance Calendar-object to
	 * @param {number} data2.start Timestamp for start of new event
	 * @param {number} data2.end Timestamp for end of new event
	 * @param {string} data2.timezoneId asd
	 * @param {boolean} data2.isAllDay foo
	 */
	updateTimeOfNewEvent({ commit, dispatch }, { calendarObjectInstance, start, end, timezoneId, isAllDay }) {
		const isDirty = calendarObjectInstance.eventComponent.isDirty()
		const startDate = new Date(start * 1000)
		const endDate = new Date(end * 1000)

		if (calendarObjectInstance.isAllDay !== isAllDay) {
			commit('toggleAllDay', { calendarObjectInstance })
		}

		dispatch('changeStartTimezone', {
			calendarObjectInstance,
			startTimezone: timezoneId,
		})
		dispatch('changeEndTimezone', {
			calendarObjectInstance,
			endTimezone: timezoneId,
		})

		commit('changeStartDate', {
			calendarObjectInstance,
			startDate,
		})

		if (isAllDay) {
			// The full-calendar end date is exclusive, but the end-date
			// that changeEndDate expects is inclusive, so we have to deduct one day.
			commit('changeEndDate', {
				calendarObjectInstance,
				endDate: new Date(endDate.getTime() - 24 * 60 * 60 * 1000),
			})
		} else {
			commit('changeEndDate', {
				calendarObjectInstance,
				endDate,
			})
		}

		if (!isDirty) {
			calendarObjectInstance.eventComponent.undirtify()
		}
	},
}

export default { state, mutations, getters, actions }
