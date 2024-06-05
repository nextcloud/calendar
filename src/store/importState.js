/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { IMPORT_STAGE_DEFAULT } from '../models/consts.js'

const state = {
	total: 0,
	accepted: 0,
	denied: 0,
	stage: IMPORT_STAGE_DEFAULT,
}

const mutations = {

	/**
	 * Increment the number of calendar-objects accepted
	 *
	 * @param {object} state the store data
	 */
	incrementAccepted(state) {
		state.accepted++
	},

	/**
	 * Increment the number of calendar-objects denied
	 *
	 * @param {object} state the store data
	 */
	incrementDenied(state) {
		state.denied++
	},

	/**
	 * Set the total number of calendar-objects
	 *
	 * @param {object} state the store data
	 * @param {number} total the total number of calendar-objects to import
	 */
	setTotal(state, total) {
		state.total = total
	},

	/**
	 * Change stage to the indicated one
	 *
	 * @param {object} state the store data
	 * @param {string} stage the name of the stage, see /src/models/consts.js
	 */
	changeStage(state, stage) {
		state.stage = stage
	},

	/**
	 * Reset to the default state
	 *
	 * @param {object} state the store data
	 */
	resetState(state) {
		state.total = 0
		state.accepted = 0
		state.denied = 0
		state.stage = IMPORT_STAGE_DEFAULT
	},
}

const getters = {}
const actions = {}

export default { state, mutations, getters, actions }
