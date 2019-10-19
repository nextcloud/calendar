/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 * @author Thomas Citharel <tcit@tcit.fr>
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
/* eslint-disable import/first */
import Vue from 'vue'
Vue.config.devtools = true

import Vuex from 'vuex'
import calendarObjectInstance from './calendarObjectInstance'
import calendarObjects from './calendarObjects'
import calendars from './calendars.js'
import contacts from './contacts.js'
import davRestrictions from './davRestrictions'
import fetchedTimeRanges from './fetchedTimeRanges.js'
import importFiles from './importFiles'
import importState from './importState'
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
		settings
	}
	// // Throw errors when the state is edited outside of mutations
	// strict: true
})
