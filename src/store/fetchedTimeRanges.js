/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { defineStore } from 'pinia'
import useCalendarObjectsStore from './calendarObjects.js'

export default defineStore('fetchedTimeRanges', {
	state: () => {
		return {
			lastTimeRangeInsertId: -1,
			fetchedTimeRanges: [],
			fetchedTimeRangesById: {},
		}
	},
	getters: {
		/**
		 * Get all time-ranges for a calendar
		 *
		 * @param {object} state The Pinia state
		 * @return {function({String}): {Object}[]}
		 */
		getAllTimeRangesForCalendar: (state) => (calendarId) =>
			state.fetchedTimeRanges.filter(f => (f.calendarId === calendarId)),

		/**
		 * Get time-range covering
		 *
		 * @param {object} state The Pinia state
		 * @return {function({Number}, {Number}, {Number}): {Object}|false}
		 */
		getTimeRangeForCalendarCoveringRange: (state) => (calendarId, requestedFrom, requestedTo) => {
			return state.fetchedTimeRanges.find(f => {
				return f.calendarId === calendarId && f.from <= requestedFrom && f.to >= requestedTo
			})
		},

		/**
		 * Get all time-ranges that have been last fetched before a given time
		 *
		 * @param {object} state The Pinia state
		 * @return {function({Number}): {Object}[]}
		 */
		getAllTimeRangesOlderThan: (state) => (olderThan) =>
			state.fetchedTimeRanges.filter(f => (f.lastFetched <= olderThan)),

		/**
		 *
		 * @param {object} state The Pinia state
		 * @return {function({Number}): {CalendarObject}[]}
		 */
		getCalendarObjectsByTimeRangeId: (state) => (timeRangeId) => {
			const calendarObjecstsStore = useCalendarObjectsStore()
			if (!state.fetchedTimeRangesById[timeRangeId]) {
				return []
			}

			return state.fetchedTimeRangesById[timeRangeId].calendarObjectIds.map((calendarObjectId) => {
				return calendarObjecstsStore.getCalendarObjectById(calendarObjectId)
			})
		},
	},
	actions: {
		/**
		 * Adds a fetched time-range to the state
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.calendarId Calendar-id which objects have been fetched
		 * @param {number} data.from timestamp of start
		 * @param {number} data.to timestamp of end
		 * @param {number} data.lastFetched timestamp of last-fetched
		 * @param {string[]} data.calendarObjectIds array of calendarObjectIds
		 */
		addTimeRange({ calendarId, from, to, lastFetched, calendarObjectIds }) {
			const fetchedTimeRange = {
				id: ++this.lastTimeRangeInsertId,
				calendarId,
				from,
				to,
				lastFetched,
				calendarObjectIds,
			}

			this.fetchedTimeRanges.push(fetchedTimeRange)
			this.fetchedTimeRangesById[fetchedTimeRange.id] = fetchedTimeRange
		},

		/**
		 * Removes a fetched time-range from the state
		 *
		 * @param {object} data The destructuring object
		 * @param {number} data.timeRangeId Id of time-range to remove
		 */
		removeTimeRange({ timeRangeId }) {
			const obj = this.fetchedTimeRangesById[timeRangeId]
			const index = this.fetchedTimeRanges.indexOf(obj)

			if (index !== -1) {
				this.fetchedTimeRanges.splice(index, 1)
				this.fetchedTimeRangesById.splice(timeRangeId, 1)
			}
		},

		/**
		 * Adds a calendar-object-id to an already fetched time-range
		 *
		 * @param {object} data The destructuring object
		 * @param {number} data.timeRangeId The id of the time-range
		 * @param {string[]} data.calendarObjectIds The array of ids of the calendar-object to add
		 */
		appendCalendarObjectIdsToTimeFrame({ timeRangeId, calendarObjectIds }) {
			for (const calendarObjectId of calendarObjectIds) {
				if (this.fetchedTimeRangesById[timeRangeId].calendarObjectIds.indexOf(calendarObjectId) === -1) {
					this.fetchedTimeRangesById[timeRangeId].calendarObjectIds.push(calendarObjectId)
				}
			}
		},

		/**
		 * Adds a calendar-object-id to an already fetched time-range
		 *
		 * @param {object} data The destructuring object
		 * @param {number} data.timeRangeId The id of the time-range
		 * @param {string} data.calendarObjectId The id of the calendar-object to add
		 */
		appendCalendarObjectIdToTimeRange({ timeRangeId, calendarObjectId }) {
			this.fetchedTimeRangesById[timeRangeId].calendarObjectIds.push(calendarObjectId)
		},

		/**
		 * Removes a calendar-object-id from an already fetched time-range
		 *
		 * @param {object} data The destructuring object
		 * @param {number} data.timeRangeId The id of the timerange
		 * @param {string} data.calendarObjectId The id of the calendar-object to remove
		 */
		removeCalendarObjectIdFromTimeRange({ timeRangeId, calendarObjectId }) {
			const index = this.fetchedTimeRangesById[timeRangeId]
				.calendarObjectIds
				.indexOf(calendarObjectId)
			if (index !== -1) {
				this.fetchedTimeRangesById[timeRangeId]
					.calendarObjectIds
					.splice(index, 1)
			}
		},

		/**
		 * Removes a calendar-object-id from any time-range it may occur in
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.calendarObjectId The id of the calendar-object to remove
		 */
		removeCalendarObjectIdFromAnyTimeRange({ calendarObjectId }) {
			for (const timeRange of this.fetchedTimeRanges) {
				const index = timeRange
					.calendarObjectIds
					.indexOf(calendarObjectId)
				if (index !== -1) {
					timeRange
						.calendarObjectIds
						.splice(index, 1)
				}
			}
		},

		/**
		 * Adds a calendar-object-id to all time-ranges of a given caloendar
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.calendarObjectId The id of the calendar-object
		 * @param {string} data.calendarId The id of the calendar
		 */
		addCalendarObjectIdToAllTimeRangesOfCalendar({ calendarObjectId, calendarId }) {
			for (const timeRange of this.fetchedTimeRanges) {
				if (timeRange.calendarId !== calendarId) {
					continue
				}

				if (timeRange.calendarObjectIds.indexOf(calendarObjectId) === -1) {
					timeRange.calendarObjectIds.push(calendarObjectId)
				}
			}
		},

		/**
		 * Removes a calendar-object-id to all time-ranges of a given calendar
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.calendarObjectId The id of the calendar-object
		 * @param {string} data.calendarId The id of the calendar
		 */
		removeCalendarObjectIdFromAllTimeRangesOfCalendar({ calendarObjectId, calendarId }) {
			for (const timeRange of this.fetchedTimeRanges) {
				if (timeRange.calendarId !== calendarId) {
					continue
				}

				const index = timeRange.calendarObjectIds.indexOf(calendarObjectId)
				if (index !== -1) {
					timeRange.calendarObjectIds.splice(index, 1)
				}
			}
		},

		/**
		 * clear FetchedTimeRanges Store
		 */
		clearFetchedTimeRanges() {
			this.lastTimeRangeInsertId = -1
			this.fetchedTimeRanges = []
			this.fetchedTimeRangesById = {}
		},
	},
})
