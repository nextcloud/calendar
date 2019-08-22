/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import Vue from 'vue'

const state = {
	lastTimeRangeInsertId: -1,
	fetchedTimeRanges: [],
	fetchedTimeRangesById: {}
}

const mutations = {

	/**
	 * Adds a fetched time-range to the state
	 *
	 * @param {Object} state The vuex state
	 * @param {Object} data The destructuring object
	 * @param {String} data.calendarId Calendar-id which objects have been fetched
	 * @param {Number} data.from timestamp of start
	 * @param {Number} data.to timestamp of end
	 * @param {Number} data.lastFetched timestamp of last-fetched
	 * @param {String[]} calendarObjectIds array of
	 */
	addTimeRange(state, { calendarId, from, to, lastFetched, calendarObjectIds }) {
		const fetchedTimeRange = {
			id: ++state.lastTimeRangeInsertId,
			calendarId,
			from,
			to,
			lastFetched,
			calendarObjectIds
		}

		state.fetchedTimeRanges.push(fetchedTimeRange)
		Vue.set(state.fetchedTimeRangesById, fetchedTimeRange.id, fetchedTimeRange)
	},

	/**
	 * Removes a fetched time-range from the state
	 *
	 * @param {Object} state The vuex state
	 * @param {Number} timeRangeId Id of time-range to remove
	 */
	removeTimeRange(state, timeRangeId) {
		const obj = state.fetchedTimeRangesById[timeRangeId]
		const index = state.fetchedTimeRanges.indexOf(obj)

		if (index !== -1) {
			state.fetchedTimeRanges.slice(index, 1)
			Vue.delete(state.fetchedTimeRangesById, timeRangeId)
		}
	},

	/**
	 * Adds a calendar-object-id to an already fetched time-range
	 *
	 * @param {Object} state The vuex state
	 * @param {Object} data The destructuring object
	 * @param {Number} data.timeRangeId The id of the time-range
	 * @param {String[]} data.calendarObjectIds The array of ids of the calendar-object to add
	 */
	appendCalendarObjectIdsToTimeFrame(state, { timeRangeId, calendarObjectIds }) {

	},

	/**
	 * Adds a calendar-object-id to an already fetched time-range
	 *
	 * @param {Object} state The vuex state
	 * @param {Object} data The destructuring object
	 * @param {Number} data.timeRangeId The id of the time-range
	 * @param {String} data.calendarObjectId The id of the calendar-object to add
	 */
	appendCalendarObjectIdToTimeRange(state, { timeRangeId, calendarObjectId }) {
		state.fetchedTimeRangesById[timeRangeId].calendarObjectIds.push(calendarObjectId)
	},

	/**
	 * Removes a calendar-object-id from an already fetched time-range
	 *
	 * @param {Object} state The vuex state
	 * @param {Object} data The destructuring object
	 * @param {Number} data.timeRangeId The id of the timerange
	 * @param {String} data.calendarObjectId The id of the calendar-object to remove
	 */
	removeCalendarObjectIdToTimeRange(state, { timeRangeId, calendarObjectId }) {
		const index = state.fetchedTimeRangesById[timeRangeId]
			.calendarObjectIds
			.indexOf(calendarObjectId)
		if (index !== -1) {
			state.fetchedTimeRangesById[timeRangeId]
				.calendarObjectIds
				.slice(index, 1)
		}
	},

	/**
	 * Updates the last-fetched timestamp of a time-range
	 *
	 * @param {Object} state The vuex state
	 * @param {Object} data The destructuring object
	 * @param {Number} data.timeRangeId The id of the timerange
	 * @param {Number} lastFetched Timestamp of last-fetched
	 */
	updateTimestampOfLastFetched(state, { timeRangeId, lastFetched }) {
		state.fetchedTimeRangesById[timeRangeId].lastFetched = lastFetched
	}
}

const getters = {

	/**
	 * Get all time-ranges for a calendar
	 *
	 * @param {Object} state The vuex state
	 * @returns {function({String}): {Object}[]}
	 */
	getAllTimeRangesForCalendar: (state) => (calendarId) =>
		state.fetchedTimeRanges.filter(f => (f.calendarId === calendarId)),

	/**
	 * Get time-range covering
	 *
	 * @param {Object} state The vuex state
	 * @returns {function({Number}, {Number}, {Number}): {Object}|false}
	 */
	getTimeRangeForCalendarCoveringRange: (state) => (calendarId, requestedFrom, requestedTo) => {
		return state.fetchedTimeRanges.first(f => {
			return f.calendarId === calendarId && f.from <= requestedFrom && f.to >= requestedTo
		})
	},

	/**
	 * Get all time-ranges that have been last fetched before a given time
	 *
	 * @param {Object} state The vuex state
	 * @returns {function({Number}): {Object}[]}
	 */
	getAllTimeRangesOlderThan: (state) => (olderThan) =>
		state.fetchedTimeRanges.filter(f => (f.lastFetched <= olderThan)),
}

const actions = {}

export default { state, mutations, getters, actions }
