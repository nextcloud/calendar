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
import {
	createCalendar,
	createSubscription,
	findAll,
	findAllDeletedCalendars,
	findPublicCalendarsByTokens,
} from '../services/caldavService.js'
import { mapCDavObjectToCalendarObject } from '../models/calendarObject'
import { dateFactory, getUnixTimestampFromDate } from '../utils/date.js'
import { getDefaultCalendarObject, mapDavCollectionToCalendar } from '../models/calendar'
import pLimit from 'p-limit'
import { uidToHexColor } from '../utils/color.js'
import { translate as t } from '@nextcloud/l10n'
import getTimezoneManager from '../services/timezoneDataProviderService.js'
import Timezone from 'calendar-js/src/timezones/timezone.js'
import CalendarComponent from 'calendar-js/src/components/calendarComponent.js'
import {
	CALDAV_BIRTHDAY_CALENDAR,
	IMPORT_STAGE_IMPORTING,
	IMPORT_STAGE_PROCESSING,
} from '../models/consts.js'

const state = {
	calendars: [],
	trashBin: undefined,
	deletedCalendars: [],
	deletedCalendarObjects: [],
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

		if (!state.calendars.some(existing => existing.id === object.id)) {
			state.calendars.push(object)
		}
		Vue.set(state.calendarsById, object.id, object)
	},

	addTrashBin(state, { trashBin }) {
		state.trashBin = trashBin
	},

	/**
	 * Adds deleted calendar into state
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar calendar the calendar to add
	 */
	addDeletedCalendar(state, { calendar }) {
		if (state.deletedCalendars.some(c => c.url === calendar.url)) {
			// This calendar is already known
			return
		}
		state.deletedCalendars.push(calendar)
	},

	/**
	 * Removes a deleted calendar
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the deleted calendar to remove
	 */
	removeDeletedCalendar(state, { calendar }) {
		state.deletedCalendars = state.deletedCalendars.filter(c => c !== calendar)
	},

	/**
	 * Removes a deleted calendar object
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.vobject the deleted calendar object to remove
	 */
	removeDeletedCalendarObject(state, { vobject }) {
		state.deletedCalendarObjects = state.deletedCalendarObjects.filter(vo => vo.id !== vobject.id)
	},

	/**
	 * Adds a deleted vobject into state
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.vobject the calendar vobject to add
	 */
	addDeletedCalendarObject(state, { vobject }) {
		if (state.deletedCalendarObjects.some(c => c.uri === vobject.uri)) {
			// This vobject is already known
			return
		}
		state.deletedCalendarObjects.push(vobject)
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
	 * @param {Object} store the store
	 * @param {Object} rootState the rootState
	 * @returns {Array}
	 */
	sortedCalendarsSubscriptions(state, store, rootState) {
		return state.calendars
			.filter(calendar => calendar.supportsEvents || (rootState.settings.showTasks && calendar.supportsTasks))
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

	hasTrashBin(state) {
		return state.trashBin !== undefined && state.trashBin.retentionDuration !== 0
	},

	trashBin(state) {
		return state.trashBin
	},

	/**
	 * List of deleted sorted calendars
	 *
	 * @param {Object} state the store data
	 * @returns {Array}
	 */
	sortedDeletedCalendars(state) {
		return state.deletedCalendars
			.sort((a, b) => a.deletedAt - b.deletedAt)
	},

	/**
	 * List of deleted calendars objects
	 *
	 * @param {Object} state the store data
	 * @returns {Array}
	 */
	deletedCalendarObjects(state) {
		const calendarUriMap = {}
		state.calendars.forEach(calendar => {
			const withoutTrail = calendar.url.replace(/\/$/, '')
			const uri = withoutTrail.substr(withoutTrail.lastIndexOf('/') + 1)
			calendarUriMap[uri] = calendar
		})

		return state.deletedCalendarObjects.map(obj => ({
			calendar: calendarUriMap[obj.dav._props['{http://nextcloud.com/ns}calendar-uri']],
			...obj,
		}))
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
	 * @param {Object} store the store
	 * @param {Object} rootState the rootState
	 * @returns {Array}
	 */
	enabledCalendars(state, store, rootState) {
		return state.calendars
			.filter(calendar => calendar.supportsEvents || (rootState.settings.showTasks && calendar.supportsTasks))
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

			if (uri === CALDAV_BIRTHDAY_CALENDAR) {
				return calendar
			}
		}

		return null
	},

	/**
	 * Whether or not a birthday calendar exists
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} getters the vuex getters
	 * @returns {boolean}
	 */
	hasBirthdayCalendar: (state, getters) => {
		return !!getters.getBirthdayCalendar
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
	 * Retrieve and commit calendars and other collections
	 *
	 * @param {Object} context the store mutations
	 * @returns {Promise<Object>} the results
	 */
	async loadCollections({ commit, state, getters }) {
		const { calendars, trashBins } = await findAll()
		console.info('calendar home scanned', calendars, trashBins)
		calendars.map((calendar) => mapDavCollectionToCalendar(calendar, getters.getCurrentUserPrincipal)).forEach(calendar => {
			commit('addCalendar', { calendar })
		})
		if (trashBins.length) {
			commit('addTrashBin', { trashBin: trashBins[0] })
		}

		commit('initialCalendarsLoaded')
		return {
			calendars: state.calendars,
			trashBin: state.trashBin,
		}
	},

	/**
	 * Retrieve and commit deleted calendars
	 *
	 * @param {Object} context the store mutations
	 * @returns {Promise<Array>} the calendars
	 */
	async loadDeletedCalendars({ commit }) {
		const calendars = await findAllDeletedCalendars()

		calendars.forEach(calendar => commit('addDeletedCalendar', { calendar }))
	},

	/**
	 * Retrieve and commit deleted calendar objects
	 */
	async loadDeletedCalendarObjects({ commit, state }) {
		const vobjects = await state.trashBin.findDeletedObjects()
		console.info('vobjects loaded', { vobjects })

		vobjects.forEach(vobject => {
			try {
				const calendarObject = mapCDavObjectToCalendarObject(vobject, undefined)
				commit('addDeletedCalendarObject', { vobject: calendarObject })
			} catch (error) {
				console.error('could not convert calendar object', vobject, error)
			}
		})
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
		const calendars = await findPublicCalendarsByTokens(tokens)
		const calendarObjects = []
		for (const davCalendar of calendars) {
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

		const response = await createCalendar(displayName, color, components, order, timezoneIcs)
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
		const response = await createSubscription(displayName, color, source, order)
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
	 * Delete a calendar in the trash bin
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to delete
	 * @returns {Promise}
	 */
	async deleteCalendarPermanently(context, { calendar }) {
		await calendar.delete({
			'X-NC-CalDAV-No-Trashbin': 1,
		})

		context.commit('removeDeletedCalendar', { calendar })
	},

	async restoreCalendar({ commit, state }, { calendar }) {
		await state.trashBin.restore(calendar.url)

		commit('removeDeletedCalendar', { calendar })
	},

	async restoreCalendarObject({ commit, state, getters }, { vobject }) {
		await state.trashBin.restore(vobject.uri)

		// Clean up the data locally
		commit('removeDeletedCalendarObject', { vobject })

		// Delete cached time range that includes the restored event
		const calendarObject = mapCDavObjectToCalendarObject(vobject.dav, undefined)
		const component = calendarObject.calendarComponent.getFirstComponent(vobject.objectType)
		const timeRange = getters.getTimeRangeForCalendarCoveringRange(
			vobject.calendar.id,
			component.startDate?.unixTime,
			component.endDate?.unixTime,
		)
		if (timeRange) {
			commit('deleteFetchedTimeRangeFromCalendar', {
				calendar: vobject.calendar,
				fetchedTimeRangeId: timeRange.id,
			})
			commit('removeTimeRange', {
				timeRangeId: timeRange.id,
			})
		}

		// Trigger calendar refresh
		commit('incrementModificationCount')
	},

	/**
	 * Deletes a calendar-object permanently
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {vobject} data.vobject Calendar-object to delete
	 * @returns {Promise<void>}
	 */
	async deleteCalendarObjectPermanently(context, { vobject }) {
		await vobject.dav.delete({
			'X-NC-CalDAV-No-Trashbin': 1,
		})

		context.commit('removeDeletedCalendarObject', { vobject })
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
		let responseTodo = []
		if (context.rootState.settings.showTasks) {
			responseTodo = await calendar.dav.findByTypeInTimeRange('VTODO', from, to)
		}
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
		for (const r of response.concat(responseTodo)) {
			try {
				const calendarObject = mapCDavObjectToCalendarObject(r, calendar.id)
				calendarObjects.push(calendarObject)
				calendarObjectIds.push(calendarObject.id)
			} catch (e) {
				console.error('could not convert calendar object', e)
			}
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
		const calendarObject = mapCDavObjectToCalendarObject(vObject, calendar.id)
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
		context.commit('changeStage', IMPORT_STAGE_IMPORTING)

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
					const response = await createCalendar(displayName, color, components, 0)
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

					const calendarObject = mapCDavObjectToCalendarObject(davObject, calendarId)
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
		context.commit('changeStage', IMPORT_STAGE_PROCESSING)
	},
	/**
	 *
	 * @param {Object} context The Vuex context destructuring object
	 * @param {Function} context.commit The Vuex commit Function
	 * @param {Object} data The data destructuring object
	 * @param {Object} newOrder The object containing String => Number with the new order
	 * @returns {Promise<void>}
	 */
	async updateCalendarListOrder({ state, commit }, { newOrder }) {
		// keep a record of the original order in case we need to do a rollback

		const limit = pLimit(3)
		const requests = []
		const calendarsToUpdate = []

		for (const key in newOrder) {
			requests.push(limit(async() => {
				const calendar = state.calendarsById[key]

				// Do not update unless necessary
				if (calendar.dav.order === newOrder[key]) {
					return
				}

				calendar.dav.order = newOrder[key]

				await calendar.dav.update()

				calendarsToUpdate.push({ calendar, newOrder: newOrder[key] })
			}))
		}

		await Promise.all(requests)

		for (const { calendar, newOrder } of calendarsToUpdate) {
			console.debug(calendar, newOrder)
			commit('changeCalendarOrder', { calendar, newOrder })
		}
	},
}

export default { state, mutations, getters, actions }
