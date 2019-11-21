/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 * @copyright Copyright (c) 2019 John Molakvoæ
 * @copyright Copyright (c) 2019 Thomas Citharel
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
import client from '../services/caldavService.js'
import CalendarObject from '../models/calendarObject'
import { dateFactory, getUnixTimestampFromDate } from '../utils/date.js'
import { getDefaultCalendarObject, mapDavCollectionToCalendar } from '../models/calendar'
import pLimit from 'p-limit'
import { uidToHexColor } from '../utils/color.js'
import { translate as t } from '@nextcloud/l10n'
import getTimezoneManager from '../services/timezoneDataProviderService.js'
import Timezone from 'calendar-js/src/timezones/timezone.js'
import CalendarComponent from 'calendar-js/src/components/calendarComponent.js'

const state = {
	calendars: [],
	calendarsById: {},
	initialCalendarsLoaded: false,
}

const mutations = {

	/**
	 * Adds calendar into state
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar calendar the calendar to add
	 */
	addCalendar(state, { calendar }) {
		const object = getDefaultCalendarObject(calendar)

		state.calendars.push(object)
		Vue.set(state.calendarsById, object.id, object)
	},

	/**
	 * Deletes a calendar
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to delete
	 */
	deleteCalendar(state, { calendar }) {
		state.calendars.splice(state.calendars.indexOf(calendar), 1)
		Vue.delete(state.calendarsById, calendar.id)
	},

	/**
	 * Toggles a calendar's visibility
	 *
	 * @param {Object} state the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to toggle
	 */
	toggleCalendarEnabled(state, { calendar }) {
		state.calendarsById[calendar.id].enabled = !state.calendarsById[calendar.id].enabled
	},

	/**
	 * Renames a calendar
	 *
	 * @param {Object} state the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to rename
	 * @param {String} data.newName the new name of the calendar
	 */
	renameCalendar(state, { calendar, newName }) {
		state.calendarsById[calendar.id].displayName = newName
	},

	/**
	 * Changes calendar's color
	 *
	 * @param {Object} state the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to rename
	 * @param {String} data.newColor the new color of the calendar
	 */
	changeCalendarColor(state, { calendar, newColor }) {
		state.calendarsById[calendar.id].color = newColor
	},

	/**
	 * Changes calendar's order
	 *
	 * @param {Object} state the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to rename
	 * @param {String} data.newOrder the new order of the calendar
	 */
	changeCalendarOrder(state, { calendar, newOrder }) {
		state.calendarsById[calendar.id].order = newOrder
	},

	/**
	 * Adds multiple calendar-objects to calendar
	 *
	 * @param {Object} state the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar The calendar to append objects to
	 * @param {String[]} data.calendarObjectIds The calendar object ids to append
	 */
	appendCalendarObjectsToCalendar(state, { calendar, calendarObjectIds }) {
		for (const calendarObjectId of calendarObjectIds) {
			if (state.calendarsById[calendar.id].calendarObjects.indexOf(calendarObjectId) === -1) {
				state.calendarsById[calendar.id].calendarObjects.push(calendarObjectId)
			}
		}
	},

	/**
	 * Adds calendar-object to calendar
	 *
	 * @param {Object} state the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar The calendar to append objects to
	 * @param {String} data.calendarObjectId The calendar object id to append
	 */
	addCalendarObjectToCalendar(state, { calendar, calendarObjectId }) {
		if (state.calendarsById[calendar.id].calendarObjects.indexOf(calendarObjectId) === -1) {
			state.calendarsById[calendar.id].calendarObjects.push(calendarObjectId)
		}
	},

	/**
	 * Removes calendar-object from calendar
	 *
	 * @param {Object} state the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar The calendar to delete objects from
	 * @param {String} data.calendarObjectId The calendar object ids to delete
	 */
	deleteCalendarObjectFromCalendar(state, { calendar, calendarObjectId }) {
		const index = state.calendarsById[calendar.id].calendarObjects.indexOf(calendarObjectId)

		if (index !== -1) {
			state.calendarsById[calendar.id].calendarObjects.slice(index, 1)
		}
	},

	/**
	 * Adds fetched time-range to calendar
	 *
	 * @param {Object} state the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar The calendar to append a time-range to
	 * @param {Number} data.fetchedTimeRangeId The time-range-id to append
	 */
	addFetchedTimeRangeToCalendar(state, { calendar, fetchedTimeRangeId }) {
		state.calendarsById[calendar.id].fetchedTimeRanges.push(fetchedTimeRangeId)

	},

	/**
	 * Removes fetched time-range from calendar
	 *
	 * @param {Object} state the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar The calendar to remove a time-range from
	 * @param {Number} data.fetchedTimeRangeId The time-range-id to remove
	 */
	deleteFetchedTimeRangeFromCalendar(state, { calendar, fetchedTimeRangeId }) {
		const index = state.calendarsById[calendar.id].fetchedTimeRanges.indexOf(fetchedTimeRangeId)

		if (index !== -1) {
			state.calendarsById[calendar.id].fetchedTimeRanges.slice(index, 1)
		}
	},

	/**
	 * Shares calendar with a user or group
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar
	 * @param {string} data.user the userId
	 * @param {string} data.displayName the displayName
	 * @param {string} data.uri the sharing principalScheme uri
	 * @param {Boolean} data.isGroup is this a group ?
	 */
	shareCalendar(state, { calendar, user, displayName, uri, isGroup, isCircle }) {
		const newSharee = {
			displayName,
			id: user,
			writeable: false,
			isGroup,
			isCircle,
			uri,
		}
		state.calendarsById[calendar.id].shares.push(newSharee)
	},

	/**
	 * Removes Sharee from calendar shares list
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar
	 * @param {string} data.uri the sharee uri
	 */
	unshareCalendar(state, { calendar, uri }) {
		calendar = state.calendars.find(search => search.id === calendar.id)
		const shareIndex = calendar.shares.findIndex(sharee => sharee.uri === uri)
		calendar.shares.splice(shareIndex, 1)
	},

	/**
	 * Toggles sharee's writable permission
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar
	 * @param {string} data.uri the sharee uri
	 */
	toggleCalendarShareWritable(state, { calendar, uri }) {
		calendar = state.calendars.find(search => search.id === calendar.id)
		const sharee = calendar.shares.find(sharee => sharee.uri === uri)
		sharee.writeable = !sharee.writeable
	},

	/**
	 * Publishes a calendar calendar
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to publish
	 * @param {String} data.publishURL published URL of calendar
	 */
	publishCalendar(state, { calendar, publishURL }) {
		calendar = state.calendars.find(search => search.id === calendar.id)
		calendar.publishURL = publishURL
	},

	/**
	 * Unpublishes a calendar
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to unpublish
	 */
	unpublishCalendar(state, { calendar }) {
		calendar = state.calendars.find(search => search.id === calendar.id)
		calendar.publishURL = null
	},

	/**
	 * Marks initial loading of calendars as complete
	 *
	 * @param {Object} state the store data
	 */
	initialCalendarsLoaded(state) {
		state.initialCalendarsLoaded = true
	},

	/**
	 * Marks a calendar as loading
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to mark as loading
	 */
	markCalendarAsLoading(state, { calendar }) {
		state.calendarsById[calendar.id].loading = true
	},

	/**
	 * Marks a calendar as finished loading
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to mark as finished loading
	 */
	markCalendarAsNotLoading(state, { calendar }) {
		state.calendarsById[calendar.id].loading = false
	},
}

const getters = {

	/**
	 * List of sorted calendars and subscriptions
	 *
	 * @param {Object} state the store data
	 * @returns {Array}
	 */
	sortedCalendarsSubscriptions(state) {
		return state.calendars
			.filter(calendar => calendar.supportsEvents)
			.sort((a, b) => a.order - b.order)
	},

	/**
	 * List of sorted calendars
	 *
	 * @param {Object} state the store data
	 * @returns {Array}
	 */
	sortedCalendars(state) {
		return state.calendars
			.filter(calendar => calendar.supportsEvents)
			.filter(calendar => !calendar.readOnly)
			.sort((a, b) => a.order - b.order)
	},

	/**
	 * List of sorted subscriptions
	 *
	 * @param {Object} state the store data
	 * @returns {Array}
	 */
	sortedSubscriptions(state) {
		return state.calendars
			.filter(calendar => calendar.supportsEvents)
			.filter(calendar => calendar.readOnly)
			.sort((a, b) => a.order - b.order)
	},

	/**
	 * List of enabled calendars and subscriptions
	 *
	 * @param {Object} state the store data
	 * @returns {Array}
	 */
	enabledCalendars(state) {
		return state.calendars
			.filter(calendar => calendar.supportsEvents)
			.filter(calendar => calendar.enabled)
	},

	/**
	 * Gets a calendar by it's Id
	 *
	 * @param {Object} state the store data
	 * @returns {function({String}): {Object}}
	 */
	getCalendarById: (state) => (calendarId) => state.calendarsById[calendarId],

	/**
	 * Gets the contact's birthday calendar or null
	 *
	 * @param {Object} state the store data
	 * @returns {Object|null}
	 */
	getBirthdayCalendar: (state) => {
		for (const calendar of state.calendars) {
			const url = calendar.url.slice(0, -1)
			const lastSlash = url.lastIndexOf('/')
			const uri = url.substr(lastSlash + 1)

			if (uri === 'contact_birthdays') {
				return calendar
			}
		}

		return null
	},

	/**
	 *
	 * @param {Object} state the store data
	 * @param {Object} getters the store getters
	 * @returns {function({Boolean}, {Boolean}, {Boolean}): {Object}[]}
	 */
	sortedCalendarFilteredByComponents: (state, getters) => (vevent, vjournal, vtodo) => {
		return getters.sortedCalendars.filter((calendar) => {
			if (vevent && !calendar.supportsEvents) {
				return false
			}

			if (vjournal && !calendar.supportsJournals) {
				return false
			}

			if (vtodo && !calendar.supportsTasks) {
				return false
			}

			return true
		})
	},
}

const actions = {

	/**
	 * Retrieve and commit calendars
	 *
	 * @param {Object} context the store mutations
	 * @returns {Promise<Array>} the calendars
	 */
	async getCalendars({ commit, state, getters }) {
		const calendars = await client.calendarHomes[0].findAllCalendars()
		calendars.map((calendar) => mapDavCollectionToCalendar(calendar, getters.getCurrentUserPrincipal)).forEach(calendar => {
			commit('addCalendar', { calendar })
		})

		commit('initialCalendarsLoaded')
		return state.calendars
	},

	/**
	 *
	 * @param {Object} vuex The destructuring object for vuex
	 * @param {Function} vuex.commit The Vuex commit function
	 * @param {Object} vuex.state The Vuex state Object
	 * @param {Object} data The data destructuring object
	 * @param {String[]} data.tokens The tokens to load
	 * @returns {Promise<Object[]>}
	 */
	async getPublicCalendars({ commit, state, getters }, { tokens }) {
		const findPromises = []

		for (const token of tokens) {
			const promise = client.publicCalendarHome
				.find(token)
				.catch(() => null) // Catch outdated tokens

			findPromises.push(promise)
		}

		const calendars = await Promise.all(findPromises)
		const existingCalendars = []
		for (const calendar of calendars) {
			if (calendar !== null) {
				existingCalendars.push(calendar)
			}
		}

		const calendarObjects = []
		for (const davCalendar of existingCalendars) {
			const calendar = mapDavCollectionToCalendar(davCalendar)
			commit('addCalendar', { calendar })
			calendarObjects.push(calendar)
		}

		commit('initialCalendarsLoaded')
		return calendarObjects
	},

	/**
	 * Append a new calendar to array of existing calendars
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.displayName The name of the new calendar
	 * @param {Object} data.color The color of the new calendar
	 * @param {Object} data.order The order of the new calendar
	 * @param {String[]=} data.components The supported components of the calendar
	 * @param {String=} data.timezone The timezoneId
	 * @returns {Promise}
	 */
	async appendCalendar(context, { displayName, color, order, components = ['VEVENT'], timezone = null }) {
		if (timezone === null) {
			timezone = context.getters.getResolvedTimezone
		}

		let timezoneIcs = null
		const timezoneObject = getTimezoneManager().getTimezoneForId(timezone)
		if (timezoneObject !== Timezone.utc && timezoneObject !== Timezone.floating) {
			const calendar = CalendarComponent.fromEmpty()
			calendar.addComponent(timezoneObject.toTimezoneComponent())
			timezoneIcs = calendar.toICS(false)
		}

		const response = await client.calendarHomes[0].createCalendarCollection(displayName, color, components, order, timezoneIcs)
		const calendar = mapDavCollectionToCalendar(response, context.getters.getCurrentUserPrincipal)
		context.commit('addCalendar', { calendar })
	},

	/**
	 * Append a new subscription to array of existing calendars
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {String} data.displayName Name of new subscription
	 * @param {String} data.color Color of new subscription
	 * @param {String} data.order Order of new subscription
	 * @param {String} data.source Source of new subscription
	 * @returns {Promise}
	 */
	async appendSubscription(context, { displayName, color, order, source }) {
		const response = await client.calendarHomes[0].createSubscribedCollection(displayName, color, source, order)
		const calendar = mapDavCollectionToCalendar(response, context.getters.getCurrentUserPrincipal)
		context.commit('addCalendar', { calendar })
	},

	/**
	 * Delete a calendar
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to delete
	 * @returns {Promise}
	 */
	async deleteCalendar(context, { calendar }) {
		await calendar.dav.delete()
		context.commit('deleteCalendar', { calendar })
	},

	/**
	 * Toggle whether a calendar is enabled
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to modify
	 * @returns {Promise}
	 */
	async toggleCalendarEnabled(context, { calendar }) {
		context.commit('markCalendarAsLoading', { calendar })
		calendar.dav.enabled = !calendar.dav.enabled

		try {
			await calendar.dav.update()
			context.commit('markCalendarAsNotLoading', { calendar })
			context.commit('toggleCalendarEnabled', { calendar })
		} catch (error) {
			context.commit('markCalendarAsNotLoading', { calendar })
			throw error
		}
	},

	/**
	 * Rename a calendar
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to modify
	 * @param {String} data.newName the new name of the calendar
	 * @returns {Promise}
	 */
	async renameCalendar(context, { calendar, newName }) {
		calendar.dav.displayname = newName

		await calendar.dav.update()
		context.commit('renameCalendar', { calendar, newName })
	},

	/**
	 * Change a calendar's color
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to modify
	 * @param {String} data.newColor the new color of the calendar
	 * @returns {Promise}
	 */
	async changeCalendarColor(context, { calendar, newColor }) {
		calendar.dav.color = newColor

		await calendar.dav.update()
		context.commit('changeCalendarColor', { calendar, newColor })
	},

	/**
	 * Change a calendar's order
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to modify
	 * @param {String} data.newOrder the new order of the calendar
	 * @returns {Promise}
	 */
	async changeCalendarOrder(context, { calendar, newOrder }) {
		calendar.dav.order = newOrder

		await calendar.dav.update()
		context.commit('changeCalendarOrder', { calendar, newOrder })
	},

	/**
	 * Change order of multiple calendars
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Array} new order of calendars
	 */
	async changeMultipleCalendarOrders(context, { calendars }) {
		// TODO - implement me
		// TODO - extract new order from order of calendars in array
		// send proppatch to all calendars
		// limit number of requests similar to import
	},

	/**
	 * Share calendar with User or Group
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to share
	 * @param {string} data.user the userId
	 * @param {string} data.displayName the displayName
	 * @param {string} data.uri the sharing principalScheme uri
	 * @param {Boolean} data.isGroup is this a group ?
	 */
	async shareCalendar(context, { calendar, user, displayName, uri, isGroup, isCircle }) {
		// Share calendar with entered group or user
		await calendar.dav.share(uri)
		context.commit('shareCalendar', { calendar, user, displayName, uri, isGroup, isCircle })
	},

	/**
	 * Toggle permissions of calendar Sharees writeable rights
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to change
	 * @param {string} data.uri the sharing principalScheme uri
	 */
	async toggleCalendarShareWritable(context, { calendar, uri }) {
		const sharee = calendar.shares.find(sharee => sharee.uri === uri)
		await calendar.dav.share(uri, !sharee.writeable)
		context.commit('toggleCalendarShareWritable', { calendar, uri })
	},

	/**
	 * Remove sharee from calendar
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to change
	 * @param {string} data.uri the sharing principalScheme uri
	 */
	async unshareCalendar(context, { calendar, uri }) {
		await calendar.dav.unshare(uri)
		context.commit('unshareCalendar', { calendar, uri })
	},

	/**
	 * Publish a calendar
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to change
	 * @returns {Promise<void>}
	 */
	async publishCalendar(context, { calendar }) {
		await calendar.dav.publish()
		const publishURL = calendar.dav.publishURL
		context.commit('publishCalendar', { calendar, publishURL })
	},

	/**
	 * Unpublish a calendar
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to change
	 * @returns {Promise<void>}
	 */
	async unpublishCalendar(context, { calendar }) {
		await calendar.dav.unpublish()
		context.commit('unpublishCalendar', { calendar })
	},

	/**
	 * Retrieve the events of the specified calendar
	 * and commit the results
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to get events from
	 * @param {Date} data.from the date to start querying events from
	 * @param {Date} data.to the last date to query events from
	 * @returns {Promise<void>}
	 */
	async getEventsFromCalendarInTimeRange(context, { calendar, from, to }) {
		context.commit('markCalendarAsLoading', { calendar })

		const response = await calendar.dav.findByTypeInTimeRange('VEVENT', from, to)
		context.commit('addTimeRange', {
			calendarId: calendar.id,
			from: getUnixTimestampFromDate(from),
			to: getUnixTimestampFromDate(to),
			lastFetched: getUnixTimestampFromDate(dateFactory()),
			calendarObjectIds: [],
		})
		const insertId = context.getters.getLastTimeRangeInsertId
		context.commit('addFetchedTimeRangeToCalendar', {
			calendar,
			fetchedTimeRangeId: insertId,
		})

		const calendarObjects = []
		const calendarObjectIds = []
		for (const r of response) {
			const calendarObject = new CalendarObject(r.data, calendar.id, r)
			calendarObjects.push(calendarObject)
			calendarObjectIds.push(calendarObject.id)
		}

		context.commit('appendCalendarObjects', { calendarObjects })
		context.commit('appendCalendarObjectsToCalendar', { calendar, calendarObjectIds })
		context.commit('appendCalendarObjectIdsToTimeFrame', {
			timeRangeId: insertId,
			calendarObjectIds,
		})

		context.commit('markCalendarAsNotLoading', { calendar })
		return context.rootState.fetchedTimeRanges.lastTimeRangeInsertId
	},

	/**
	 * Retrieve one object
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {String} data.objectId Id of the object to fetch
	 * @returns {Promise<CalendarObject>}
	 */
	async getEventByObjectId(context, { objectId }) {
		// TODO - we should still check if the calendar-object is up to date
		//  - Just send head and compare etags
		if (context.getters.getCalendarObjectById(objectId)) {
			return Promise.resolve(context.getters.getCalendarObjectById(objectId))
		}

		// This might throw an exception, but we will leave it up to the methods
		// calling this action to properly handle it
		const objectPath = atob(objectId)
		const lastSlashIndex = objectPath.lastIndexOf('/')
		const calendarPath = objectPath.substr(0, lastSlashIndex + 1)
		const objectFileName = objectPath.substr(lastSlashIndex + 1)

		const calendarId = btoa(calendarPath)
		if (!context.state.calendarsById[calendarId]) {
			return Promise.reject(new Error(''))
		}

		const calendar = context.state.calendarsById[calendarId]
		const vObject = await calendar.dav.find(objectFileName)
		const calendarObject = new CalendarObject(vObject.data, calendar.id, vObject)
		context.commit('appendCalendarObject', { calendarObject })
		context.commit('addCalendarObjectToCalendar', {
			calendar: {
				id: calendarId,
			},
			calendarObjectId: calendarObject.id,
		})

		return calendarObject
	},

	/**
	 * Import events into calendar
	 *
	 * @param {Object} context the store mutations
	 */
	async importEventsIntoCalendar(context) {
		context.commit('changeStage', 'importing')

		// Create a copy
		const files = context.rootState.importFiles.importFiles.slice()

		let totalCount = 0
		for (const file of files) {
			totalCount += file.parser.getItemCount()

			const calendarId = context.rootState.importFiles.importCalendarRelation[file.id]
			if (calendarId === 'new') {
				const displayName = file.parser.getName() || t('calendar', 'Imported {filename}', {
					filename: file.name,
				})
				const color = file.parser.getColor() || uidToHexColor(displayName)
				const components = []
				if (file.parser.containsVEvents()) {
					components.push('VEVENT')
				}
				if (file.parser.containsVJournals()) {
					components.push('VJOURNAL')
				}
				if (file.parser.containsVTodos()) {
					components.push('VTODO')
				}

				try {
					const response = await client.calendarHomes[0].createCalendarCollection(displayName, color, components, 0)
					const calendar = mapDavCollectionToCalendar(response, context.getters.getCurrentUserPrincipal)
					context.commit('addCalendar', { calendar })
					context.commit('setCalendarForFileId', {
						fileId: file.id,
						calendarId: calendar.id,
					})
				} catch (error) {
					throw error
				}
			}
		}

		context.commit('setTotal', totalCount)

		const limit = pLimit(3)
		const requests = []

		for (const file of files) {
			const calendarId = context.rootState.importFiles.importCalendarRelation[file.id]
			const calendar = context.getters.getCalendarById(calendarId)

			for (const item of file.parser.getItemIterator()) {
				requests.push(limit(async() => {
					const ics = item.toICS()

					let davObject
					try {
						davObject = await calendar.dav.createVObject(ics)
					} catch (error) {
						context.commit('incrementDenied')
						console.error(error)
						return
					}

					const calendarObject = new CalendarObject(davObject.data, calendarId, davObject)
					context.commit('appendCalendarObject', { calendarObject })
					context.commit('addCalendarObjectToCalendar', {
						calendar,
						calendarObjectId: calendarObject.id,
					})
					context.commit('addCalendarObjectIdToAllTimeRangesOfCalendar', {
						calendarId: calendar.id,
						calendarObjectId: calendarObject.id,
					})
					context.commit('incrementAccepted')
				}))
			}
		}

		await Promise.all(requests)
		context.commit('changeStage', 'default')
	},
}

export default { state, mutations, getters, actions }
