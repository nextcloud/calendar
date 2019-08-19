/**
 * @copyright Copyright (c) 2018 Team Popcorn <teampopcornberlin@gmail.com>
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Team Popcorn <teampopcornberlin@gmail.com>
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

const state = {
	importState: {
		total: 0,
		accepted: 0,
		denied: 0,
		stage: 'default',
		calendarId: -1
	}
}

const mutations = {

	/**
	 * Increment the number of calendar-objects accepted
	 *
	 * @param {Object} state the store data
	 */
	incrementAccepted(state) {
		state.importState.accepted++
	},

	/**
	 * Increment the number of calendar-objects denied
	 *
	 * @param {Object} state the store data
	 */
	incrementDenied(state) {
		state.importState.denied++
	},

	/**
	 * Set the total number of calendar-objects
	 *
	 * @param {Object} state the store data
	 * @param {string} total the total number of calendar-objects to import
	 */
	setTotal(state, total) {
		state.importState.total = total
	},

	/**
	 * Set the calendarId
	 *
	 * @param {Object} state the store data
	 * @param {string} calendarId The Id of the calendar to import into
	 */
	setCalendarId(state, calendarId) {
		state.importState.calendarId = calendarId
	},

	/**
	 * Change stage to the indicated one
	 *
	 * @param {Object} state the store data
	 * @param {string} stage the name of the stage ('default', 'importing', 'parsing', 'done')
	 */
	changeStage(state, stage) {
		state.importState.stage = stage
	},

	/**
	 * Reset to the default state
	 *
	 * @param {Object} state the store data
	 */
	resetState(state) {
		state.importState.total = 0
		state.importState.accepted = 0
		state.importState.denied = 0
		state.stage = 'default'
		state.calendarId = -1
	}
}

const getters = {}
const actions = {}

export default { state, mutations, getters, actions }
