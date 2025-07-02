/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import {
	createCalendar,
	createSubscription,
	findAll,
	findAllDeletedCalendars,
	findPublicCalendarsByTokens,
} from '../services/caldavService.js'
import { mapCDavObjectToCalendarObject } from '../models/calendarObject.js'
import { dateFactory, getUnixTimestampFromDate } from '../utils/date.js'
import { getDefaultCalendarObject, mapDavCollectionToCalendar } from '../models/calendar.js'
import pLimit from 'p-limit'
import { uidToHexColor } from '../utils/color.js'
import { translate as t } from '@nextcloud/l10n'
import getTimezoneManager from '../services/timezoneDataProviderService.js'
import { CalendarComponent, TimezoneComponent } from '@nextcloud/calendar-js'
import { Timezone } from '@nextcloud/timezones'
import {
	CALDAV_BIRTHDAY_CALENDAR,
	CALDAV_PERSONAL_CALENDAR,
	IMPORT_STAGE_IMPORTING,
	IMPORT_STAGE_PROCESSING,
} from '../models/consts.js'
import { showError } from '@nextcloud/dialogs'
import useImportStateStore from './importState.js'
import useImportFilesStore from './importFiles.js'
import useSettingsStore from './settings.js'
import useFetchedTimeRangesStore from './fetchedTimeRanges.js'
import usePrincipalsStore from './principals.js'
import useCalendarObjectsStore from './calendarObjects.js'

import { defineStore } from 'pinia'
import Vue from 'vue'

export default defineStore('calendars', {
	state: () => {
		return {
			calendars: [],
			trashBin: undefined,
			scheduleInbox: undefined,
			deletedCalendars: [],
			deletedCalendarObjects: [],
			calendarsById: {},
			initialCalendarsLoaded: false,
			editCalendarModal: undefined,
			syncTokens: new Map(),
		}
	},
	getters: {
		/**
		 * List of sorted calendars and subscriptions
		 *
		 * @param {object} state the store data
		 * @param {object} store the store
		 * @return {Array}
		 */
		sortedCalendarsSubscriptions(state) {
			const settingsStore = useSettingsStore()

			return state.calendars
				.filter(calendar => calendar.supportsEvents || (settingsStore.showTasks && calendar.supportsTasks))
				.sort((a, b) => a.order - b.order)
		},

		/**
		 * List of sorted writable calendars
		 *
		 * @param {object} state the store data
		 * @return {Array}
		 */
		sortedCalendars(state) {
			return state.calendars
				.filter(calendar => calendar.supportsEvents)
				.filter(calendar => !calendar.readOnly)
				.sort((a, b) => a.order - b.order)
		},

		/**
		 * List of sorted all calendars
		 *
		 * @param {object} state the store data
		 * @return {Array}
		 */
		sortedCalendarsAll(state) {
			return state.calendars
				.filter(calendar => calendar.supportsEvents)
				.sort((a, b) => a.order - b.order)
		},

		/**
		 * List of sorted calendars owned by the principal
		 *
		 * @param {object} state the store data
		 * @return {Array}
		 */
		ownSortedCalendars(state) {
			return state.calendars
				.filter(calendar => calendar.supportsEvents)
				.filter(calendar => !calendar.readOnly)
				.filter(calendar => !calendar.isSharedWithMe)
				.sort((a, b) => a.order - b.order)
		},

		hasTrashBin(state) {
			return state.trashBin !== undefined && state.trashBin.retentionDuration !== 0
		},

		/**
		 * List of deleted sorted calendars
		 *
		 * @param {object} state the store data
		 * @return {Array}
		 */
		sortedDeletedCalendars(state) {
			return state.deletedCalendars
				.sort((a, b) => a.deletedAt - b.deletedAt)
		},

		/**
		 * List of deleted calendars objects
		 *
		 * @param {object} state the store data
		 * @return {Array}
		 */
		allDeletedCalendarObjects(state) {
			const calendarUriMap = {}
			state.calendars.forEach(calendar => {
				const withoutTrail = calendar.url.replace(/\/$/, '')
				const uri = withoutTrail.slice(withoutTrail.lastIndexOf('/') + 1)
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
		 * @param {object} state the store data
		 * @return {Array}
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
		 * @param {object} state the store data
		 * @return {Array}
		 */
		enabledCalendars(state) {
			const settingsStore = useSettingsStore()

			return state.calendars
				.filter(calendar => calendar.supportsEvents || (settingsStore.showTasks && calendar.supportsTasks))
				.filter(calendar => calendar.enabled)
		},

		/**
		 * Gets a calendar by its Id
		 *
		 * @param {object} state the store data
		 * @return {function({String}): {Object}}
		 */
		getCalendarById: (state) => (calendarId) => state.calendarsById[calendarId],

		/**
		 * Gets a calendar by its url
		 *
		 * @param {object} state the store data
		 * @return {function({String}): {Object}}
		 */
		getCalendarByUrl: (state) => (url) => state.calendars.find((calendar) => calendar.url === url),

		/**
		 * Gets the contact's birthday calendar or null
		 *
		 * @param {object} state the store data
		 * @return {object | null}
		 */
		getBirthdayCalendar: (state) => {
			for (const calendar of state.calendars) {
				const url = calendar.url.slice(0, -1)
				const lastSlash = url.lastIndexOf('/')
				const uri = url.slice(lastSlash + 1)

				if (uri === CALDAV_BIRTHDAY_CALENDAR) {
					return calendar
				}
			}

			return null
		},

		/**
		 * Gets the personal calendar's color or null
		 *
		 * @param {object} state the store data
		 * @return {object | null}
		 */
		getPersonalCalendarColor: (state) => {
			for (const calendar of state.calendars) {
				const url = calendar.url.slice(0, -1)
				const lastSlash = url.lastIndexOf('/')
				const uri = url.slice(lastSlash + 1)
				if (uri === CALDAV_PERSONAL_CALENDAR) {
					return calendar.color
				}
			}

			return null
		},

		/**
		 * @return {function({Boolean}, {Boolean}, {Boolean}): {Object}[]}
		 */
		sortedCalendarFilteredByComponents() {
			return (vevent, vjournal, vtodo) => {
				return this.sortedCalendars.filter((calendar) => {
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
			}
		},

		/**
		 * Get the current sync token of a calendar or undefined it the calendar is not present
		 *
		 * @param {object} state The pinia state object
		 * @return {function({id: string}): string | undefined}
		 */
		getCalendarSyncToken: (state) => (calendar) => {
			const existingCalendar = state.calendarsById[calendar.id]
			if (!existingCalendar) {
				return undefined
			}

			return state.syncTokens.get(calendar.id) ?? existingCalendar.dav.syncToken
		},
	},
	actions: {
		/**
		 * Retrieve and commit calendars and other collections
		 *
		 * @return {Promise<object>} the results
		 */
		async loadCollections() {
			const principalsStore = usePrincipalsStore()
			const { calendars, trashBins, scheduleInboxes, subscriptions } = await findAll()
			console.info('calendar home scanned', calendars, trashBins, subscriptions)
			calendars.map((calendar) => mapDavCollectionToCalendar(calendar, principalsStore.getCurrentUserPrincipal)).forEach(calendar => {
				this.addCalendarMutation({ calendar })
			})
			if (trashBins.length) {
				this.trashBin = trashBins[0]
			}
			if (scheduleInboxes.length) {
				this.scheduleInbox = scheduleInboxes[0]
			}

			this.initialCalendarsLoaded = true
			return {
				calendars: this.calendars,
				trashBin: this.trashBin,
			}
		},

		/**
		 * Retrieve and commit deleted calendars
		 *
		 * @return {Promise<Array>} the calendars
		 */
		async loadDeletedCalendars() {
			const calendars = await findAllDeletedCalendars()

			calendars.forEach(calendar => {
				if (this.deletedCalendars.some(c => c.url === calendar.url)) {
					// This calendar is already known
					return
				}
				this.deletedCalendars.push(calendar)
			})
		},

		/**
		 * Retrieve and commit deleted calendar objects
		 */
		async loadDeletedCalendarObjects() {
			const vobjects = await this.trashBin.findDeletedObjects() /// TODO what is this?
			console.info('vobjects loaded', { vobjects })

			vobjects.forEach(vobject => {
				try {
					const calendarObject = mapCDavObjectToCalendarObject(vobject, undefined)

					if (this.deletedCalendarObjects.some(c => c.uri === calendarObject.uri)) {
						// This vobject is already known
						return
					}
					this.deletedCalendarObjects.push(calendarObject)
				} catch (error) {
					console.error('could not convert calendar object', vobject, error)
				}
			})
		},

		/**
		 * Retrieve and commit public calendars
		 *
		 * @param {object} data The data destructuring object
		 * @param {string[]} data.tokens The tokens to load
		 * @return {Promise<object[]>}
		 */
		async getPublicCalendars({ tokens }) {
			const calendars = await findPublicCalendarsByTokens(tokens)
			const calendarObjects = []
			for (const davCalendar of calendars) {
				const calendar = mapDavCollectionToCalendar(davCalendar)
				this.addCalendarMutation({ calendar })
				calendarObjects.push(calendar)
			}

			this.initialCalendarsLoaded = true
			return calendarObjects
		},

		/**
		 * Append a new calendar to array of existing calendars
		 *
		 * @param {object} data destructuring object
		 * @param {object} data.displayName The name of the new calendar
		 * @param {object} data.color The color of the new calendar
		 * @param {object} data.order The order of the new calendar
		 * @param {string[]} data.components The supported components of the calendar
		 * @param {string=} data.timezone The timezoneId
		 * @return {Promise}
		 */
		async appendCalendar({ displayName, color, order, components = ['VEVENT'], timezone = null }) {
			const principalsStore = usePrincipalsStore()
			const settingsStore = useSettingsStore()

			if (timezone === null) {
				timezone = settingsStore.getResolvedTimezone
			}

			let timezoneIcs = null
			const timezoneObject = getTimezoneManager().getTimezoneForId(timezone)
			if (timezoneObject !== Timezone.utc && timezoneObject !== Timezone.floating) {
				const calendar = CalendarComponent.fromEmpty()
				calendar.addComponent(TimezoneComponent.fromICALJs(timezoneObject.toICALJs()))
				timezoneIcs = calendar.toICS(false)
			}

			const response = await createCalendar(displayName, color, components, order, timezoneIcs)
			const calendar = mapDavCollectionToCalendar(response, principalsStore.getCurrentUserPrincipal)
			this.addCalendarMutation({ calendar })
		},

		/**
		 * Append a new subscription to array of existing calendars
		 *
		 * @param {object} data destructuring object
		 * @param {string} data.displayName Name of new subscription
		 * @param {string} data.color Color of new subscription
		 * @param {string} data.order Order of new subscription
		 * @param {string} data.source Source of new subscription
		 * @return {Promise}
		 */
		async appendSubscription({ displayName, color, order, source }) {
			const principalsStore = usePrincipalsStore()

			const response = await createSubscription(displayName, color, source, order)
			const calendar = mapDavCollectionToCalendar(response, principalsStore.getCurrentUserPrincipal)
			this.addCalendarMutation({ calendar })
		},

		/**
		 * Delete a calendar
		 *
		 * @param {object} data destructuring object
		 * @param {object} data.calendar the calendar to delete
		 * @return {Promise}
		 */
		async deleteCalendar({ calendar }) {
			await calendar.dav.delete()

			this.calendars.splice(this.calendars.indexOf(calendar), 1)
			/// TODO this.calendarsById.delete(calendar.id)
			Vue.delete(this.calendarsById, calendar.id)
			this.syncTokens.delete(calendar.id)
		},

		/**
		 * Delete a calendar in the trash bin
		 *
		 * @param {object} data destructuring object
		 * @param {object} data.calendar the calendar to delete
		 * @return {Promise}
		 */
		async deleteCalendarPermanently({ calendar }) {
			await calendar.delete({
				'X-NC-CalDAV-No-Trashbin': 1,
			})

			this.deletedCalendars = this.deletedCalendars.filter(c => c !== calendar)
		},

		deleteCalendarAfterTimeout({ calendar, countdown = 7 }) {
			/// TODO this.calendarsById[calendar.id].countdown = countdown
			Vue.set(this.calendarsById[calendar.id], 'countdown', countdown)

			const deleteInterval = setInterval(() => {
				countdown--

				if (countdown < 0) {
					countdown = 0
				}

				/// TODO this.calendarsById[calendar.id].countdown = countdown
				Vue.set(this.calendarsById[calendar.id], 'countdown', countdown)
			}, 1000)
			const deleteTimeout = setTimeout(async () => {
				try {
					await this.deleteCalendar({ calendar })
				} catch (error) {
					showError(t('calendar', 'An error occurred, unable to delete the calendar.'))
					console.error(error)
				} finally {
					clearInterval(deleteInterval)
				}
			}, 7000)
			/// TODO this.calendarsById[calendar.id].deleteInterval = deleteInterval
			/// TODO this.calendarsById[calendar.id].deleteTimeout = deleteTimeout
			Vue.set(this.calendarsById[calendar.id], 'deleteInterval', deleteInterval)
			Vue.set(this.calendarsById[calendar.id], 'deleteTimeout', deleteTimeout)
		},

		cancelCalendarDeletion({ calendar }) {
			if (calendar.deleteInterval) clearInterval(calendar.deleteInterval)
			if (calendar.deleteTimeout) clearTimeout(calendar.deleteTimeout)

			this.calendarsById[calendar.id].deleteInterval = undefined
			this.calendarsById[calendar.id].deleteTimeout = undefined
		},

		async restoreCalendar({ calendar }) {
			await this.trashBin.restore(calendar.url)

			this.deletedCalendars = this.deletedCalendars.filter(c => c !== calendar)
		},

		async restoreCalendarObject({ vobject }) {
			const fetchedTimeRangesStore = useFetchedTimeRangesStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			await this.trashBin.restore(vobject.uri)

			// Clean up the data locally
			this.deletedCalendarObjects = this.deletedCalendarObjects.filter(vo => vo.id !== vobject.id)

			// Delete cached time range that includes the restored event
			const calendarObject = mapCDavObjectToCalendarObject(vobject.dav, undefined)
			const component = calendarObject.calendarComponent.getFirstComponent(vobject.objectType)
			const timeRange = fetchedTimeRangesStore.getTimeRangeForCalendarCoveringRange(
				vobject.calendar.id,
				component.startDate?.unixTime,
				component.endDate?.unixTime,
			)
			if (timeRange) {
				this.deleteFetchedTimeRangeFromCalendarMutation({
					calendar: vobject.calendar,
					fetchedTimeRangeId: timeRange.id,
				},
				)
				fetchedTimeRangesStore.removeTimeRange({
					timeRangeId: timeRange.id,
				})
			}

			// Trigger calendar refresh
			calendarObjectsStore.modificationCount++
		},

		/**
		 * Deletes a calendar-object permanently
		 *
		 * @param {object} data destructuring object
		 * @param {vobject} data.vobject Calendar-object to delete
		 * @return {Promise<void>}
		 */
		async deleteCalendarObjectPermanently({ vobject }) {
			await vobject.dav.delete({
				'X-NC-CalDAV-No-Trashbin': 1,
			})

			this.deletedCalendarObjects = this.deletedCalendarObjects.filter(vo => vo.id !== vobject.id)
		},

		/**
		 * Toggle whether a calendar is enabled
		 *
		 * @param {object} data destructuring object
		 * @param {object} data.calendar the calendar to modify
		 * @param {boolean} data.updateDav whether to persist changes to the CalDAV backend (default: true)
		 * @return {Promise}
		 */
		async toggleCalendarEnabled({ calendar, updateDav = true }) {
			this.calendarsById[calendar.id].loading = true
			calendar.dav.enabled = !calendar.dav.enabled

			try {
				if (updateDav) {
					await calendar.dav.update()
				}
				this.calendarsById[calendar.id].loading = false
				this.calendarsById[calendar.id].enabled = !this.calendarsById[calendar.id].enabled
			} catch (error) {
				this.calendarsById[calendar.id].loading = false
				throw error
			}
		},

		/**
		 * Rename a calendar
		 *
		 * @param {object} data destructuring object
		 * @param {object} data.calendar the calendar to modify
		 * @param {string} data.newName the new name of the calendar
		 * @return {Promise}
		 */
		async renameCalendar({ calendar, newName }) {
			calendar.dav.displayname = newName

			await calendar.dav.update()
			this.calendarsById[calendar.id].displayName = newName
		},

		/**
		 * Change a calendar's color
		 *
		 * @param {object} data destructuring object
		 * @param {object} data.calendar the calendar to modify
		 * @param {string} data.newColor the new color of the calendar
		 * @return {Promise}
		 */
		async changeCalendarColor({ calendar, newColor }) {
			calendar.dav.color = newColor

			await calendar.dav.update()
			this.calendarsById[calendar.id].color = newColor
		},

		/**
		 * Change a calendars transparency
		 *
		 * @param {object} data destructuring object
		 * @param {object} data.calendar the calendar to modify
		 * @param {string} data.transparency the new transparency
		 * @return {Promise}
		 */
		async changeCalendarTransparency({ calendar, transparency }) {
			if (calendar.dav.transparency === transparency) {
				return
			}

			calendar.dav.transparency = transparency

			await calendar.dav.update()
			this.calendarsById[calendar.id].transparency = transparency
		},

		/**
		 * Share calendar with User or Group
		 *
		 * @param {object} data destructuring object
		 * @param {object} data.calendar the calendar to share
		 * @param {string} data.user the userId
		 * @param {string} data.displayName the displayName
		 * @param {string} data.uri the sharing principalScheme uri
		 * @param {boolean} data.isGroup is this a group?
		 * @param {boolean} data.isCircle is this a circle?
		 */
		async shareCalendar({ calendar, user, displayName, uri, isGroup, isCircle }) {
			// Share calendar with entered group or user
			await calendar.dav.share(uri)
			const newSharee = {
				displayName,
				id: user,
				writeable: false,
				isGroup,
				isCircle,
				uri,
			}
			this.calendarsById[calendar.id].shares.push(newSharee)
		},

		/**
		 * Toggle permissions of calendar Sharees writeable rights
		 *
		 * @param {object} data destructuring object
		 * @param {object} data.calendar the calendar to change
		 * @param {string} data.uri the sharing principalScheme uri
		 */
		async toggleCalendarShareWritable({ calendar, uri }) {
			const sharee = calendar.shares.find(sharee => sharee.uri === uri)
			await calendar.dav.share(uri, !sharee.writeable)
			/// TODO test this not sure what it does
			calendar = this.calendars.find(search => search.id === calendar.id)
			sharee.writeable = !sharee.writeable
		},

		/**
		 * Remove sharee from calendar
		 *
		 * @param {object} data destructuring object
		 * @param {object} data.calendar the calendar to change
		 * @param {string} data.uri the sharing principalScheme uri
		 */
		async unshareCalendar({ calendar, uri }) {
			await calendar.dav.unshare(uri)

			calendar = this.calendars.find(search => search.id === calendar.id)
			const shareIndex = calendar.shares.findIndex(sharee => sharee.uri === uri)
			calendar.shares.splice(shareIndex, 1)
		},

		/**
		 * Publish a calendar
		 *
		 * @param {object} data destructuring object
		 * @param {object} data.calendar the calendar to change
		 * @return {Promise<void>}
		 */
		async publishCalendar({ calendar }) {
			await calendar.dav.publish()
			const publishURL = calendar.dav.publishURL

			calendar = this.calendars.find(search => search.id === calendar.id)
			calendar.publishURL = publishURL
		},

		/**
		 * Unpublish a calendar
		 *
		 * @param {object} data destructuring object
		 * @param {object} data.calendar the calendar to change
		 * @return {Promise<void>}
		 */
		async unpublishCalendar({ calendar }) {
			await calendar.dav.unpublish()

			calendar = this.calendars.find(search => search.id === calendar.id)
			calendar.publishURL = null
		},

		/**
		 * Retrieve the events of the specified calendar
		 * and commit the results
		 *
		 * @param {object} data destructuring object
		 * @param {object} data.calendar the calendar to get events from
		 * @param {Date} data.from the date to start querying events from
		 * @param {Date} data.to the last date to query events from
		 * @return {Promise<void>}
		 */
		async getEventsFromCalendarInTimeRange({ calendar, from, to }) {
			const fetchedTimeRangesStore = useFetchedTimeRangesStore()
			const settingsStore = useSettingsStore()
			const calendarObjectsStore = useCalendarObjectsStore()

			this.calendarsById[calendar.id].loading = true
			const response = await calendar.dav.findByTypeInTimeRange('VEVENT', from, to)
			let responseTodo = []
			if (settingsStore.showTasks) {
				responseTodo = await calendar.dav.findByTypeInTimeRange('VTODO', from, to)
			}
			fetchedTimeRangesStore.addTimeRange({
				calendarId: calendar.id,
				from: getUnixTimestampFromDate(from),
				to: getUnixTimestampFromDate(to),
				lastFetched: getUnixTimestampFromDate(dateFactory()),
				calendarObjectIds: [],
			})
			const insertId = fetchedTimeRangesStore.lastTimeRangeInsertId

			this.calendarsById[calendar.id].fetchedTimeRanges.push(insertId)

			const calendarObjects = []
			const calendarObjectIds = []
			for (const r of response.concat(responseTodo)) {
				try {
					const calendarObject = mapCDavObjectToCalendarObject(r, calendar.id)
					calendarObjects.push(calendarObject)
					calendarObjectIds.push(calendarObject.id)
				} catch (e) {
					console.error(`could not convert calendar object of calendar ${calendar.id}`, e, {
						response: r,
					})
				}
			}

			calendarObjectsStore.appendOrUpdateCalendarObjectsMutation({ calendarObjects })
			for (const calendarObjectId of calendarObjectIds) {
				if (this.calendarsById[calendar.id].calendarObjects.indexOf(calendarObjectId) === -1) {
					this.calendarsById[calendar.id].calendarObjects.push(calendarObjectId)
				}
			}
			fetchedTimeRangesStore.appendCalendarObjectIdsToTimeFrame({
				timeRangeId: insertId,
				calendarObjectIds,
			})

			this.calendarsById[calendar.id].loading = false
			return fetchedTimeRangesStore.lastTimeRangeInsertId
		},

		/**
		 * Retrieve one object
		 *
		 * @param {object} data destructuring object
		 * @param {string} data.objectId Id of the object to fetch
		 * @return {Promise<CalendarObject>}
		 */
		async getEventByObjectId({ objectId }) {
			const calendarObjectsStore = useCalendarObjectsStore()
			// TODO - we should still check if the calendar-object is up to date
			//  - Just send head and compare etags
			if (calendarObjectsStore.getCalendarObjectById(objectId)) {
				return Promise.resolve(calendarObjectsStore.getCalendarObjectById(objectId))
			}

			// This might throw an exception, but we will leave it up to the methods
			// calling this action to properly handle it
			const objectPath = atob(objectId)
			const lastSlashIndex = objectPath.lastIndexOf('/')
			const calendarPath = objectPath.slice(0, lastSlashIndex + 1)
			const objectFileName = objectPath.slice(lastSlashIndex + 1)

			const calendarId = btoa(calendarPath)
			if (!this.calendarsById[calendarId]) {
				return Promise.reject(new Error(''))
			}

			const calendar = this.calendarsById[calendarId]
			const vObject = await calendar.dav.find(objectFileName)
			const calendarObject = mapCDavObjectToCalendarObject(vObject, calendar.id)
			calendarObjectsStore.appendCalendarObjectMutation({ calendarObject })
			this.addCalendarObjectToCalendarMutation({
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
		 */
		async importEventsIntoCalendar() {
			const importStateStore = useImportStateStore()
			const importFilesStore = useImportFilesStore()
			const principalsStore = usePrincipalsStore()
			const fetchedTimeRangesStore = useFetchedTimeRangesStore()
			const calendarObjectsStore = useCalendarObjectsStore()

			importStateStore.stage = IMPORT_STAGE_IMPORTING

			// Create a copy
			const files = importFilesStore.importFiles.slice()

			let totalCount = 0
			for (const file of files) {
				totalCount += file.parser.getItemCount()

				const calendarId = importFilesStore.importCalendarRelation[file.id]
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

					const response = await createCalendar(displayName, color, components, 0)
					const calendar = mapDavCollectionToCalendar(response, principalsStore.getCurrentUserPrincipal)
					this.addCalendarMutation({ calendar })
					importFilesStore.setCalendarForFileId({
						fileId: file.id,
						calendarId: calendar.id,
					})
				}
			}

			importStateStore.total = totalCount

			const limit = pLimit(3)
			const requests = []

			for (const file of files) {
				const calendarId = importFilesStore.importCalendarRelation[file.id]
				const calendar = this.getCalendarById(calendarId)

				for (const item of file.parser.getItemIterator()) {
					requests.push(limit(async () => {
						const ics = item.toICS()

						let davObject
						try {
							davObject = await calendar.dav.createVObject(ics)
						} catch (error) {
							importStateStore.denied++
							console.error(error)
							return
						}

						const calendarObject = mapCDavObjectToCalendarObject(davObject, calendarId)
						calendarObjectsStore.appendCalendarObjectMutation({ calendarObject })
						this.addCalendarObjectToCalendarMutation({
							calendar,
							calendarObjectId: calendarObject.id,
						})
						fetchedTimeRangesStore.addCalendarObjectIdToAllTimeRangesOfCalendar({
							calendarId: calendar.id,
							calendarObjectId: calendarObject.id,
						})
						importStateStore.accepted++
					}))
				}
			}

			await Promise.all(requests)
			importStateStore.stage = IMPORT_STAGE_PROCESSING
		},
		/**
		 *
		 * @param {object} data The data destructuring object
		 * @param {object} data.newOrder The object containing String => Number with the new order
		 * @return {Promise<void>}
		 */
		async updateCalendarListOrder({ newOrder }) {
			// keep a record of the original order in case we need to do a rollback

			const limit = pLimit(3)
			const requests = []
			const calendarsToUpdate = []

			for (const key in newOrder) {
				requests.push(limit(async () => {
					const calendar = this.calendarsById[key]

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
				this.calendarsById[calendar.id].order = newOrder
			}
		},

		/**
		 * Adds calendar into state
		 *
		 * @param {object} data destructuring object
		 * @param {object} data.calendar the calendar to add
		 */
		addCalendarMutation({ calendar }) {
			const object = getDefaultCalendarObject(calendar)
			if (!this.calendars.some(existing => existing.id === object.id)) {
				this.calendars.push(object)
				Vue.set(this.calendars, 0, this.calendars[0]) /// TODO remove with vue 3
			}
			/// TODO this.calendarsById[object.id] = object
			Vue.set(this.calendarsById, object.id, object)
		},

		/**
		 * Removes fetched time-range from calendar
		 *
		 * @param {object} data destructuring object
		 * @param {object} data.calendar The calendar to remove a time-range from
		 * @param {number} data.fetchedTimeRangeId The time-range-id to remove
		 */
		deleteFetchedTimeRangeFromCalendarMutation({ calendar, fetchedTimeRangeId }) {
			const index = this.calendarsById[calendar.id]?.fetchedTimeRanges.indexOf(fetchedTimeRangeId)

			if (index !== -1) {
				this.calendarsById[calendar.id].fetchedTimeRanges.splice(index, 1)
			}
		},

		/**
		 * Adds calendar-object to calendar
		 *
		 * @param {object} data destructuring object
		 * @param {object} data.calendar The calendar to append objects to
		 * @param {string} data.calendarObjectId The calendar object id to append
		 */
		addCalendarObjectToCalendarMutation({ calendar, calendarObjectId }) {
			if (this.calendarsById[calendar.id].calendarObjects.indexOf(calendarObjectId) === -1) {
				this.calendarsById[calendar.id].calendarObjects.push(calendarObjectId)
			}
		},

		/**
		 * Removes calendar-object from calendar
		 *
		 * @param {object} data destructuring object
		 * @param {object} data.calendar The calendar to delete objects from
		 * @param {string} data.calendarObjectId The calendar object ids to delete
		 */
		deleteCalendarObjectFromCalendarMutation({ calendar, calendarObjectId }) {
			const index = this.calendarsById[calendar.id].calendarObjects.indexOf(calendarObjectId)

			if (index !== -1) {
				this.calendarsById[calendar.id].calendarObjects.slice(index, 1)
			}
		},

		/**
		 * Update the sync token of a given calendar locally
		 *
		 * @param {object} data destructuring object
		 * @param {{id: string}} data.calendar Calendar from the store
		 * @param {string} data.syncToken New sync token value
		 */
		updateCalendarSyncToken({ calendar, syncToken }) {
			if (!this.getCalendarById(calendar.id)) {
				return
			}

			this.syncTokens.set(calendar.id, syncToken)
		},
	},
})
