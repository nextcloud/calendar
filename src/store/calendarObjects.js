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

const state = {
	calendarObjects: {},
}

const mutations = {

	/**
	 * Adds an array of calendar-objects to the store
	 *
	 * @param {Object} state The store data
	 * @param {Object[]} calendarObjects Calendar-objects to add
	 */
	appendCalendarObjects(state, calendarObjects = []) {
		for (const calendarObject of calendarObjects) {
			if (calendarObject instanceof CalendarObject) {
				Vue.set(state.calendarObjects, calendarObject.id, calendarObject)
			} else {
				logger.error('Invalid calendarObject object')
			}
		}
	},

	/**
	 * Adds one calendar-object to the store
	 *
	 * @param {Object} state The store data
	 * @param {Object} calendarObject Calendar-object to add
	 */
	appendCalendarObject(state, calendarObject) {
		if (calendarObject instanceof CalendarObject) {
			Vue.set(state.calendarObjects, calendarObject.id, calendarObject)
		} else {
			logger.error('Invalid calendarObject object')
		}
	},

	/**
	 * Removes a calendar-object from the store
	 *
	 * @param {Object} state The store data
	 * @param {Object} calendarObject Calendar-object to add
	 */
	deleteCalendarObject(state, calendarObject) {
		Vue.set(state.calendarObject, calendarObject.id)
	}
}

const getters = {}
const actions = {}

export default { state, mutations, getters, actions }
