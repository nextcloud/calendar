/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
const state = {
	minimumDate: '1970-01-01T00:00:00Z',
	maximumDate: '2037-12-31T23:59:59Z',
}

const mutations = {

	/**
	 * Initialize restrictions imposed by CalDAV server
	 *
	 * @param {object} state The Vuex state
	 * @param {object} data The destructuring object
	 * @param {string} data.minimumDate The minimum-date allowed by the CalDAV server
	 * @param {string} data.maximumDate The maximum-date allowed by the CalDAV server
	 */
	loadDavRestrictionsFromServer(state, { minimumDate, maximumDate }) {
		state.minimumDate = minimumDate
		state.maximumDate = maximumDate
	},
}

const getters = {}

const actions = {}

export default { state, mutations, getters, actions }
