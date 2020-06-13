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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import Vue from 'vue'
import {
	findPrincipalByUrl,
	getCurrentUserPrincipal,
} from '../services/caldavService.js'
import logger from '../utils/logger.js'
import {
	getDefaultPrincipalObject,
	mapDavToPrincipal,
} from '../models/principal.js'

const state = {
	principals: [],
	principalsById: {},
	currentUserPrincipal: null,
}

const mutations = {

	/**
	 * Adds a principal to the state
	 *
	 * @param {object} state The vuex state
	 * @param {object} data The destructuring object
	 * @param {object} data.principal The principal to add
	 */
	addPrincipal(state, { principal }) {
		const object = getDefaultPrincipalObject(principal)

		if (state.principalsById[object.id]) {
			return
		}

		state.principals.push(object)
		Vue.set(state.principalsById, object.id, object)
	},

	/**
	 * Adds the current user principal to the state
	 *
	 * @param {object} state The vuex state
	 * @param {object} data destructuring object
	 * @param {string} data.principalId principalId of the current-user-principal
	 */
	setCurrentUserPrincipal(state, { principalId }) {
		state.currentUserPrincipal = principalId
	},

	/**
	 * Changes the schedule-default-calendar-URL of a principal
	 *
	 * @param {object} state The vuex state
	 * @param {object} data The destructuring object
	 * @param {object} data.principal The principal to modify
	 * @param {string} data.scheduleDefaultCalendarUrl The new schedule-default-calendar-URL
	 */
	changePrincipalScheduleDefaultCalendarUrl(state, { principal, scheduleDefaultCalendarUrl }) {
		Vue.set(
			state.principalsById[principal.id],
			'scheduleDefaultCalendarUrl',
			scheduleDefaultCalendarUrl,
		)
	},
}

const getters = {

	/**
	 * Gets a principal object by its url
	 *
	 * @param {object} state the store data
	 * @return {function({String}): {Object}}
	 */
	getPrincipalByUrl: (state) => (url) => state.principals.find((principal) => principal.url === url),

	/**
	 * Gets a principal object by its id
	 *
	 * @param {object} state the store data
	 * @return {function({String}): {Object}}
	 */
	getPrincipalById: (state) => (id) => state.principalsById[id],

	/**
	 * Gets the principal object of the current-user-principal
	 *
	 * @param {object} state the store data
	 * @return {{Object}}
	 */
	getCurrentUserPrincipal: (state) => state.principalsById[state.currentUserPrincipal],

	/**
	 * Gets the email-address of the current-user-principal
	 *
	 * @param {object} state the store data
	 * @return {string|undefined}
	 */
	getCurrentUserPrincipalEmail: (state) => state.principalsById[state.currentUserPrincipal]?.emailAddress,
}

const actions = {

	/**
	 * Fetches a principal from the DAV server and commits it to the state
	 *
	 * @param {object} context The vuex context
	 * @param {string} url The URL of the principal
	 * @return {Promise<void>}
	 */
	async fetchPrincipalByUrl(context, { url }) {
		// Don't refetch principals we already have
		if (context.getters.getPrincipalByUrl(url)) {
			return
		}

		const principal = await findPrincipalByUrl(url)
		if (!principal) {
			// TODO - handle error
			return
		}

		context.commit('addPrincipal', {
			principal: mapDavToPrincipal(principal),
		})
	},

	/**
	 * Fetches the current-user-principal
	 *
	 * @param {object} context The vuex context
	 * @return {Promise<void>}
	 */
	async fetchCurrentUserPrincipal(context) {
		const currentUserPrincipal = getCurrentUserPrincipal()
		if (!currentUserPrincipal) {
			// TODO - handle error
			return
		}

		const principal = mapDavToPrincipal(currentUserPrincipal)
		context.commit('addPrincipal', { principal })
		context.commit('setCurrentUserPrincipal', { principalId: principal.id })
		logger.debug(`Current user principal is ${principal.url}`)
	},

	/**
	 * Change a principal's schedule-default-calendar-URL
	 *
	 * @param {object} context The vuex context
	 * @param {object} data The destructuring object
	 * @param {object} data.principal The principal to modify
	 * @param {string} data.scheduleDefaultCalendarUrl The new schedule-default-calendar-URL
	 * @return {Promise<void>}
	 */
	async changePrincipalScheduleDefaultCalendarUrl(context, { principal, scheduleDefaultCalendarUrl }) {
		principal.dav.scheduleDefaultCalendarUrl = scheduleDefaultCalendarUrl

		await principal.dav.update()
		context.commit('changePrincipalScheduleDefaultCalendarUrl', {
			principal,
			scheduleDefaultCalendarUrl,
		})
	},
}

export default { state, mutations, getters, actions }
