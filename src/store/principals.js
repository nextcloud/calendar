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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import Vue from 'vue'
import client from '../services/cdav.js'
import logger from '../services/loggerService'
import { getDefaultPrincipalObject, mapDavToPrincipal } from '../models/principal'

const state = {
	principals: [],
	principalsById: {},
	currentUserPrincipal: null
}

const mutations = {

	/**
	 * Adds a principal to the state
	 *
	 * @param {Object} state The vuex state
	 * @param {Object} principal The principal to add
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
	 * @param {Object} state The vuex state
	 * @param {Object} data destructuring object
	 * @param {String} data.principalId principalId of the current-user-principal
	 */
	setCurrentUserPrincipal(state, { principalId }) {
		state.currentUserPrincipal = principalId
	}
}

const getters = {

	/**
	 * Gets a principal object by its url
	 *
	 * @param {Object} state the store data
	 * @returns {function({String}): {Object}}
	 */
	getPrincipalByUrl: (state) => (url) => state.principals.find((principal) => principal.url === url),

	/**
	 * Gets a principal object by its id
	 *
	 * @param {Object} state the store data
	 * @returns {function({String}): {Object}}
	 */
	getPrincipalById: (state) => (id) => state.principalsById['id'],

	/**
	 * Gets the principal object of the current-user-principal
	 *
	 * @param {Object} state the store data
	 * @returns {{Object}}
	 */
	getCurrentUserPrincipal: (state) => state.principalsById[state.currentUserPrincipal],

	/**
	 * Gets the email-address of the current-user-principal
	 *
	 * @param {Object} state the store data
	 * @returns {String}
	 */
	getCurrentUserPrincipalEmail: (state) => state.principalsById[state.currentUserPrincipal].emailAddress,
}

const actions = {

	/**
	 * Fetches a principal from the DAV server and commits it to the state
	 *
	 * @param {Object} context The vuex context
	 * @param {String} url The URL of the principal
	 * @returns {Promise<void>}
	 */
	async fetchPrincipalByUrl(context, url) {
		// Don't refetch principals we already have
		if (context.getters.getPrincipalByUrl(url)) {
			return
		}

		const principal = await client.findPrincipal(url)
		if (!principal) {
			// TODO - handle error
			return
		}

		context.commit('addPrincipal', {
			principal: mapDavToPrincipal(principal)
		})
	},

	/**
	 * Fetches the current-user-principal
	 *
	 * @param {Object} context The vuex context
	 * @returns {Promise<void>}
	 */
	async fetchCurrentUserPrincipal(context) {
		const currentUserPrincipal = client.currentUserPrincipal
		if (!currentUserPrincipal) {
			// TODO - handle error
			return
		}

		const principal = mapDavToPrincipal(currentUserPrincipal)
		context.commit('addPrincipal', { principal })
		context.commit('setCurrentUserPrincipal', { principalId: principal.id })
		logger.debug(`Current user principal is ${principal.url}`)
	}
}

export default { state, mutations, getters, actions }
