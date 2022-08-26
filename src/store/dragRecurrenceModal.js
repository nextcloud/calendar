/**
 * @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @author Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @license AGPL-3.0-or-later
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

const state = {
	show: false,
	resolve: null,
	reject: null,
	eventComponent: null,
}

const mutations = {
	/**
	 * Show the drag recurrence modal and save the promise callbacks for the modal
	 *
	 * @param {object} state The Vuex state
	 * @param {object} data The destructuring object
	 * @param {function(boolean): void} data.resolve Call to save the current drag process. Specify thisAndAllFuture via the first argument.
	 * @param {function(any=): void} data.reject Call to cancel the current drag process. Optionally pass an error.
	 * @param data.eventComponent
	 */
	showDragRecurrenceModal(state, { resolve, reject, eventComponent }) {
		state.show = true
		state.resolve = resolve
		state.reject = reject
		state.eventComponent = eventComponent
	},

	/**
	 * Hide the drag recurrence modal but leave the promise callbacks intact to prevent a deadlock
	 *
	 * @param {object} state The Vuex state
	 */
	hideDragRecurrenceModal(state) {
		state.show = false
	},
}

const getters = {}

const actions = {
	/**
	 * Show the drag recurrence modal and save the promise callbacks for the modal
	 *
	 * Automatically hides it after the promise is resolved or rejected (finally)
	 *
	 * @param {object} context The destructuring object for Vuex
	 * @param {Function} context.commit The Vuex commit function
	 * @param {object} data The destructuring object
	 * @param {object} data.eventComponent The event component to pass on to the modal
	 * @return {Promise<boolean>} Will resolve with thisAndAllFuture
	 */
	async showDragRecurrenceModal({ commit }, { eventComponent }) {
		try {
			return await new Promise((resolve, reject) => {
				commit('showDragRecurrenceModal', {
					resolve,
					reject,
					eventComponent,
				})
			})
		} finally {
			commit('hideDragRecurrenceModal')
		}
	},
}

export default { state, mutations, getters, actions }
