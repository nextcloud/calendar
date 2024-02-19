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
import {
	findPrincipalByUrl,
	getCurrentUserPrincipal,
} from '../services/caldavService.js'
import logger from '../utils/logger.js'
import {
	getDefaultPrincipalObject,
	mapDavToPrincipal,
} from '../models/principal.js'
import { defineStore } from 'pinia'

export default defineStore('principals', {
	state: () => {
		return {
			principals: [],
			principalsById: {},
			currentUserPrincipal: null,
		}
	},
	getters: {
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
	},
	actions: {
		/**
		 * Fetches a principal from the DAV server and commits it to the state
		 *
		 * @param {string} url The URL of the principal
		 * @return {Promise<void>}
		 */
		async fetchPrincipalByUrl({ url }) {
			// Don't refetch principals we already have
			if (this.getPrincipalByUrl(url)) {
				return
			}

			const principal = await findPrincipalByUrl(url)
			if (!principal) {
				// TODO - handle error
				return
			}

			this.addPrincipalMutation({ principal: mapDavToPrincipal(principal) })

		},

		/**
		 * Fetches the current-user-principal
		 *
		 * @return {Promise<void>}
		 */
		async fetchCurrentUserPrincipal() {
			const currentUserPrincipal = getCurrentUserPrincipal()
			if (!currentUserPrincipal) {
				// TODO - handle error
				return
			}

			const principal = mapDavToPrincipal(currentUserPrincipal)
			this.addPrincipalMutation({ principal })
			this.currentUserPrincipal = principal.id
			logger.debug(`Current user principal is ${principal.url}`)
		},

		/**
		 * Adds a principal to the state
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.principal The principal to add
		 */
		addPrincipalMutation({ principal }) {
			const object = getDefaultPrincipalObject(principal)

			if (this.principalsById[object.id]) {
				return
			}

			this.principals.push(object)
			this.principalsById[object.id] = object
		},
	},
})
