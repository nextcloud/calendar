/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author Thomas Citharel <tcit@tcit.fr>
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
