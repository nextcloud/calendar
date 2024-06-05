/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import Vue from 'vue'
import Vuex from 'vuex'

import calendarObjectInstance from './calendarObjectInstance.js'
import calendarObjects from './calendarObjects.js'
import calendars from './calendars.js'
import contacts from './contacts.js'
import davRestrictions from './davRestrictions.js'
import fetchedTimeRanges from './fetchedTimeRanges.js'
import importFiles from './importFiles.js'
import importState from './importState.js'
import principals from './principals.js'
import settings from './settings.js'

Vue.use(Vuex)

export default new Vuex.Store({
	modules: {
		calendarObjectInstance,
		calendarObjects,
		calendars,
		contacts,
		davRestrictions,
		fetchedTimeRanges,
		importFiles,
		importState,
		principals,
		settings,
	},
	// // Throw errors when the state is edited outside of mutations
	// strict: true
})
