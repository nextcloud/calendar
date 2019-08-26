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
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import Vue from 'vue'

const state = {
	davRestrictions: {
		minimumDate: '1970-01-01T00:00:00Z',
		maximumDate: '2036-12-31T23:59:59Z'
	}
}

const mutations = {

	/**
	 * Initialize restrictions imposed by CalDAV server
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} davRestrictions The full settings object
	 */
	loadDavRestrictionsFromServer(state, davRestrictions) {
		Vue.set(state, 'davRestrictions', davRestrictions)
	}
}

const getters = {}

const actions = {}

export default { state, mutations, getters, actions }
