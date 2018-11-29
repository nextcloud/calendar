/**
 * @copyright Copyright (c) 2018 Georg Ehrke
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
import client from '../services/cdav.js'

const principalModel = {
	id: '',
	calendarUserType: '',
	emailAddress: '',
	displayname: '',
	userId: '',
	url: '',
	dav: false,
}

export function mapDavToPrincipal(principal) {
	return {
		id: principal.url,
		calendarUserType: principal.calendarUserType,
		emailAddress: principal.email,
		displayname: principal.displayname,
		userId: principal.userId,
		url: principal.principalUrl,
		dav: principal
	}
}

const state = {
	principals: []
}

const mutations = {
	addPrincipal(state, { principal }) {
		state.principals.push(Object.assign({}, principalModel, principal))
	},
}

const getters = {
	getPrincipalByUrl: (state) => (url) => {
		console.debug(state.principals)
		return state.principals.find((principal) => principal.url === url)
	}
}

const actions = {
	async fetchPrincipalByUrl(context, url) {
		const principal = await client.findPrincipal(url)
		context.commit('addPrincipal', { principal: mapDavToPrincipal(principal) })
	}
}

export default { state, mutations, getters, actions }
