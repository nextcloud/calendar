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

/**
 * Pads on incoming principal object to contain all expected props
 *
 * @param {Object} obj Principal object to pad with default values
 * @returns {Object}
 */
function padObject(obj) {
	return Object.assign({}, {
		id: '',
		calendarUserType: '',
		emailAddress: '',
		displayname: '',
		userId: '',
		url: '',
		dav: false,
	}, obj)
}

/**
 * converts a dav principal into a vuex object
 *
 * @param {Object} principal cdav-library Principal object
 * @returns {{emailAddress: *, displayname: *, dav: *, id: *, calendarUserType: *, userId: *, url: *}}
 */
function mapDavToPrincipal(principal) {
	return {
		id: btoa(principal.url),
		calendarUserType: principal.calendarUserType,
		emailAddress: principal.email,
		displayname: principal.displayname,
		userId: principal.userId,
		url: principal.principalUrl,
		dav: principal
	}
}

const state = {
	principals: [],
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
		state.principals.push(padObject(principal))
	},

	/**
	 * Adds the current user principal to the state
	 *
	 * @param {Object} state The vuex state
	 * @param {Object} principal The principal to set as current-user-principal
	 */
	addCurrentUserPrincipal(state, { currentUserPrincipal }) {
		Vue.set(state, 'currentUserPrincipal', padObject(currentUserPrincipal))
	}
}

const getters = {

	/**
	 * Gets a principal by it's URL
	 *
	 * @param {Object} state The vuex state
	 * @returns {function({String}): {Object}}
	 */
	getPrincipalByUrl: (state) => (url) => {
		logger.log(state.principals)
		return state.principals.find((principal) => principal.url === url)
	}
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
		const principal = await client.findPrincipal(url)
		context.commit('addPrincipal', { principal: mapDavToPrincipal(principal) })
	}
}

export default { state, mutations, getters, actions }
