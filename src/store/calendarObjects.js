/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 * @author Thomas Citharel <tcit@tcit.fr>
 *
 * @license GNU AGPL version 3 or any later version
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
import CalendarObject from '../models/calendarObject'
import logger from '../services/loggerService'
import DateTimeValue from 'calendar-js/src/values/dateTimeValue'
import { createEvent, getTimezoneManager } from 'calendar-js'

const state = {
	calendarObjects: {},
	modificationCount: 0,
}

const mutations = {

	/**
	 * Adds an array of calendar-objects to the store
	 *
	 * @param {Object} state The store data
	 * @param {Object} data The destructuring object
	 * @param {Object[]} data.calendarObjects Calendar-objects to add
	 */
	appendCalendarObjects(state, { calendarObjects = [] }) {
		for (const calendarObject of calendarObjects) {
			if (!state.calendarObjects[calendarObject.getId()]) {
				if (calendarObject instanceof CalendarObject) {
					Vue.set(state.calendarObjects, calendarObject.getId(), calendarObject)
				} else {
					logger.error('Invalid calendarObject object')
				}
			}
		}
	},

	/**
	 * Adds one calendar-object to the store
	 *
	 * @param {Object} state The store data
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObject Calendar-object to add
	 */
	appendCalendarObject(state, { calendarObject }) {
		if (!state.calendarObjects[calendarObject.getId()]) {
			if (calendarObject instanceof CalendarObject) {
				Vue.set(state.calendarObjects, calendarObject.getId(), calendarObject)
			} else {
				logger.error('Invalid calendarObject object')
			}
		}
	},

	/**
	 * Removes a calendar-object from the store
	 *
	 * @param {Object} state The store data
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObject Calendar-object to delete
	 */
	deleteCalendarObject(state, { calendarObject }) {
		Vue.delete(state.calendarObjects, calendarObject.getId())
	},

	/**
	 * Increments the modification count
	 *
	 * @param {Object} state The store data
	 */
	incrementModificationCount(state) {
		state.modificationCount++
	}
}

const getters = {

	/**
	 * Gets a calendar-object based on its id
	 *
	 * @param {Object} state The store data
	 * @returns {function({String}): CalendarObject}
	 */
	getCalendarObjectById: (state) => (id) => state.calendarObjects[id]
}

const actions = {

	/**
	 * Moves a calendar-object to a different calendar
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {CalendarObject} data.calendarObject Calendar-object to delete
	 * @param {String} data.newCalendarId Calendar-Id of calendar to move this calendar-object to
	 * @returns {Promise<void>}
	 */
	async moveCalendarObject(context, { calendarObject, newCalendarId }) {
		if (!calendarObject.existsOnServer()) {
			return
		}

		const oldCalendarObjectId = calendarObject.id
		const oldCalendarId = calendarObject.calendarId

		if (oldCalendarId === newCalendarId) {
			logger.error('Old calendar Id and new calendar Id are the same, nothing to move ...')
			return
		}

		const newCalendarObject = context.getters.getCalendarById(newCalendarId)
		if (!newCalendarObject) {
			logger.error('Calendar to move to not found, aborting ...')
			return
		}

		context.commit('deleteCalendarObject', {
			calendarObject
		})
		await calendarObject.dav.move(newCalendarObject.dav)
		context.commit('appendCalendarObject', { calendarObject })

		context.commit('addCalendarObjectToCalendar', {
			calendar: {
				id: newCalendarId
			},
			calendarObjectId: calendarObject.id
		})
		context.commit('addCalendarObjectIdToAllTimeRangesOfCalendar', {
			calendarId: newCalendarId,
			calendarObjectId: calendarObject.id
		})

		context.commit('deleteCalendarObjectFromCalendar', {
			calendar: {
				id: oldCalendarId
			},
			calendarObjectId: oldCalendarObjectId
		})
		context.commit('removeCalendarObjectIdFromAllTimeRangesOfCalendar', {
			calendarId: oldCalendarId,
			calendarObjectId: oldCalendarObjectId
		})

		context.commit('incrementModificationCount')
	},

	/**
	 * Updates a calendar-object
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {CalendarObject} data.calendarObject Calendar-object to delete
	 * @returns {Promise<void>}
	 */
	async updateCalendarObject(context, { calendarObject }) {
		if (calendarObject.existsOnServer()) {
			calendarObject.dav.data = calendarObject.vcalendar.toICS()
			await calendarObject.dav.update()

			context.commit('addCalendarObjectIdToAllTimeRangesOfCalendar', {
				calendarId: calendarObject.calendarId,
				calendarObjectId: calendarObject.id
			})
			context.commit('incrementModificationCount')

			return

			// TODO - catch conflicts
		}

		const calendar = context.getters.getCalendarById(calendarObject.calendarId)
		calendarObject.dav = await calendar.dav.createVObject(calendarObject.vcalendar.toICS())

		context.commit('appendCalendarObject', { calendarObject })
		context.commit('addCalendarObjectToCalendar', {
			calendar: {
				id: calendarObject.calendarId
			},
			calendarObjectId: calendarObject.id
		})
		context.commit('addCalendarObjectIdToAllTimeRangesOfCalendar', {
			calendarId: calendarObject.calendarId,
			calendarObjectId: calendarObject.id
		})
		context.commit('incrementModificationCount')
	},

	/**
	 * Creates a new calendar-object from an recurrence-exception fork
	 *
	 * @param {Object} context The Vuex context
	 * @param {Object} data destructuring object
	 * @param {EventComponent} data.eventComponent EventComponent to store
	 * @param {String} data.calendarId The calendar-id to store it in
	 * @returns {Promise<void>}
	 */
	async createCalendarObjectFromFork(context, { eventComponent, calendarId }) {
		const calendar = context.getters.getCalendarById(calendarId)
		const calendarObject = new CalendarObject(eventComponent.root, calendar.id)
		calendarObject.dav = await calendar.dav.createVObject(calendarObject.vcalendar.toICS())

		context.commit('appendCalendarObject', { calendarObject })
		context.commit('addCalendarObjectToCalendar', {
			calendar: {
				id: calendarObject.calendarId
			},
			calendarObjectId: calendarObject.id
		})
		context.commit('addCalendarObjectIdToAllTimeRangesOfCalendar', {
			calendarId: calendar.id,
			calendarObjectId: calendarObject.id
		})
		context.commit('incrementModificationCount')
	},

	/**
	 * Deletes a calendar-object
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {CalendarObject} data.calendarObject Calendar-object to delete
	 * @returns {Promise<void>}
	 */
	async deleteCalendarObject(context, { calendarObject }) {
		// If this calendar-object was not created on the server yet,
		// no need to send requests to the server
		if (calendarObject.existsOnServer()) {
			await calendarObject.dav.delete()
		}

		context.commit('deleteCalendarObject', { calendarObject })
		context.commit('deleteCalendarObjectFromCalendar', {
			calendar: {
				id: calendarObject.calendarId
			},
			calendarObjectId: calendarObject.id
		})
		context.commit('removeCalendarObjectIdFromAnyTimeRange', {
			calendarObjectId: calendarObject.id
		})
		context.commit('incrementModificationCount')
	},

	/**
	 * Creates a new calendar object based on start, end, timezone and isAllDay
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {Number} data.start Timestamp for start of new event
	 * @param {Number} data.end Timestamp for end of new event
	 * @param {String} data.timezoneId asd
	 * @param {Boolean} data.isAllDay foo
	 * @returns {Promise<CalendarObject>}
	 */
	createNewEvent(context, { start, end, timezoneId, isAllDay }) {
		const timezoneManager = getTimezoneManager()
		const timezone = timezoneManager.getTimezoneForId(timezoneId)

		const startDate = new Date(start * 1000)
		const endDate = new Date(end * 1000)

		let startDateTime = DateTimeValue
			.fromJSDate(startDate, true)
			.getInTimezone(timezone)
		let endDateTime = DateTimeValue
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
		return Promise.resolve(new CalendarObject(calendar, firstCalendar))
	},

	/**
	 * Updates the time of the new calendar object
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {CalendarObject} data.calendarObject Calendar-object to
	 * @param {Number} data.start Timestamp for start of new event
	 * @param {Number} data.end Timestamp for end of new event
	 * @param {String} data.timezoneId asd
	 * @param {Boolean} data.isAllDay foo
	 */
	updateTimeOfNewEvent(context, { calendarObject, start, end, timezoneId, isAllDay }) {
		const timezoneManager = getTimezoneManager()
		const timezone = timezoneManager.getTimezoneForId(timezoneId)

		const startDate = new Date(start * 1000)
		const endDate = new Date(end * 1000)

		let startDateTime = DateTimeValue
			.fromJSDate(startDate, true)
			.getInTimezone(timezone)
		let endDateTime = DateTimeValue
			.fromJSDate(endDate, true)
			.getInTimezone(timezone)

		if (isAllDay) {
			startDateTime.isDate = true
			endDateTime.isDate = true
		}

		const eventComponent = calendarObject.vcalendar.getEventIterator().next().value
		const isDirty = eventComponent.isDirty()

		eventComponent.startDate = startDateTime
		eventComponent.endDate = endDateTime

		if (!isDirty) {
			eventComponent.undirtify()
		}
	}
}

export default { state, mutations, getters, actions }
