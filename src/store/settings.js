/**
 * @copyright Copyright (c) 2020 Georg Ehrke
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
import { enableBirthdayCalendar } from '../services/caldavService.js'
import { mapDavCollectionToCalendar } from '../models/calendar'
import { detectTimezone } from '../services/timezoneDetectionService'
import { setConfig as setCalendarJsConfig } from 'calendar-js'
import { setConfig } from '../services/settings.js'
import { logInfo } from '../utils/logger.js'

const state = {
	// env
	appVersion: null,
	firstRun: null,
	talkEnabled: false,
	// user-defined calendar settings
	eventLimit: null,
	showTasks: null,
	showWeekends: null,
	showWeekNumbers: null,
	skipPopover: null,
	slotDuration: null,
	defaultReminder: null,
	tasksEnabled: false,
	timezone: 'automatic',
	// user-defined Nextcloud settings
	momentLocale: 'en',
}

const mutations = {

	/**
	 * Updates the user's setting for event limit
	 *
	 * @param {Object} state The Vuex state
	 */
	toggleEventLimitEnabled(state) {
		state.eventLimit = !state.eventLimit
	},

	/**
	 * Updates the user's setting for visibility of event popover
	 *
	 * @param {Object} state The Vuex state
	 */
	togglePopoverEnabled(state) {
		state.skipPopover = !state.skipPopover
	},

	/**
	 * Updates the user's setting for visibility of weekends
	 *
	 * @param {Object} state The Vuex state
	 */
	toggleTasksEnabled(state) {
		state.showTasks = !state.showTasks
	},

	/**
	 * Updates the user's setting for visibility of weekends
	 *
	 * @param {Object} state The Vuex state
	 */
	toggleWeekendsEnabled(state) {
		state.showWeekends = !state.showWeekends
	},

	/**
	 * Updates the user's setting for visibility of week numbers
	 *
	 * @param {Object} state The Vuex state
	 */
	toggleWeekNumberEnabled(state) {
		state.showWeekNumbers = !state.showWeekNumbers
	},

	/**
	 * Updates the user's preferred slotDuration
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {String} data.slotDuration The new slot duration
	 */
	setSlotDuration(state, { slotDuration }) {
		state.slotDuration = slotDuration
	},

	/**
	 * Updates the user's preferred defaultReminder
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {String} data.defaultReminder The new default reminder length
	 */
	 setDefaultReminder(state, { defaultReminder }) {
		state.defaultReminder = defaultReminder
	},

	/**
	 * Updates the user's timezone
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {String} data.timezoneId The new timezone
	 */
	setTimezone(state, { timezoneId }) {
		state.timezone = timezoneId
	},

	/**
	 * Initialize settings
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {String} data.appVersion The version of the Nextcloud app
	 * @param {Boolean} data.eventLimit Whether or not to limit number of visible events in grid view
	 * @param {Boolean} data.firstRun Whether or not this is the first run
	 * @param {Boolean} data.showWeekNumbers Whether or not to show week numbers
	 * @param {Boolean} data.showTasks Whether or not to display tasks with a due-date
	 * @param {Boolean} data.showWeekends Whether or not to display weekends
	 * @param {Boolean} data.skipPopover Whether or not to skip the simple event popover
	 * @param {String} data.slotDuration The duration of one slot in the agendaView
	 * @param {String} data.defaultReminder The default reminder to set on newly created events
	 * @param {Boolean} data.talkEnabled Whether or not the talk app is enabled
	 * @param {Boolean} data.tasksEnabled Whether ot not the tasks app is enabled
	 * @param {String} data.timezone The timezone to view the calendar in. Either an Olsen timezone or "automatic"
	 */
	loadSettingsFromServer(state, { appVersion, eventLimit, firstRun, showWeekNumbers, showTasks, showWeekends, skipPopover, slotDuration, defaultReminder, talkEnabled, tasksEnabled, timezone }) {
		logInfo(`
Initial settings:
	- AppVersion: ${appVersion}
	- EventLimit: ${eventLimit}
	- FirstRun: ${firstRun}
	- ShowWeekNumbers: ${showWeekNumbers}
	- ShowTasks: ${showTasks}
	- ShowWeekends: ${showWeekends}
	- SkipPopover: ${skipPopover}
	- SlotDuration: ${slotDuration}
	- DefaultReminder: ${defaultReminder}
	- TalkEnabled: ${talkEnabled}
	- TasksEnabled: ${tasksEnabled}
	- Timezone: ${timezone}
`)

		state.appVersion = appVersion
		state.eventLimit = eventLimit
		state.firstRun = firstRun
		state.showWeekNumbers = showWeekNumbers
		state.showTasks = showTasks
		state.showWeekends = showWeekends
		state.skipPopover = skipPopover
		state.slotDuration = slotDuration
		state.defaultReminder = defaultReminder
		state.talkEnabled = talkEnabled
		state.tasksEnabled = tasksEnabled
		state.timezone = timezone
	},

	/**
	 * Sets the name of the moment.js locale to be used
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {String} data.locale The moment.js locale to be used
	 */
	setMomentLocale(state, { locale }) {
		logInfo(`Updated moment locale: ${locale}`)

		state.momentLocale = locale
	},
}

const getters = {

	/**
	 * Gets the resolved timezone.
	 * If the timezone is set to automatic, it returns the user's current timezone
	 * Otherwise, it returns the Olsen timezone stored
	 *
	 * @param {Object} state The Vuex state
	 * @returns {String}
	 */
	getResolvedTimezone: (state) => state.timezone === 'automatic'
		? detectTimezone()
		: state.timezone,
}

const actions = {

	/**
	 * Updates the user's setting for visibility of birthday calendar
	 *
	 * @param {Object} vuex The Vuex destructuring object
	 * @param {Object} vuex.getters The Vuex Getters
	 * @param {Function} vuex.commit The Vuex commit Function
	 * @param {Function} vuex.dispatch The Vuex dispatch Function
	 * @returns {Promise<void>}
	 */
	async toggleBirthdayCalendarEnabled({ getters, commit, dispatch }) {
		if (getters.hasBirthdayCalendar) {
			const calendar = getters.getBirthdayCalendar
			await dispatch('deleteCalendar', { calendar })
		} else {
			const davCalendar = await enableBirthdayCalendar()
			const calendar = mapDavCollectionToCalendar(davCalendar)
			commit('addCalendar', { calendar })
		}
	},

	/**
	 * Updates the user's setting for event limit
	 *
	 * @param {Object} vuex The Vuex destructuring object
	 * @param {Object} vuex.state The Vuex state
	 * @param {Function} vuex.commit The Vuex commit Function
	 * @returns {Promise<void>}
	 */
	async toggleEventLimitEnabled({ state, commit }) {
		const newState = !state.eventLimit
		const value = newState ? 'yes' : 'no'

		await setConfig('eventLimit', value)
		commit('toggleEventLimitEnabled')
	},

	/**
	 * Updates the user's setting for visibility of event popover
	 *
	 * @param {Object} context The Vuex context
	 * @returns {Promise<void>}
	 */
	async togglePopoverEnabled({ state, commit }) {
		const newState = !state.skipPopover
		const value = newState ? 'yes' : 'no'

		await setConfig('skipPopover', value)
		commit('togglePopoverEnabled')
	},

	/**
	 * Updates the user's setting for visibility of weekends
	 *
	 * @param {Object} context The Vuex context
	 * @returns {Promise<void>}
	 */
	async toggleWeekendsEnabled({ state, commit }) {
		const newState = !state.showWeekends
		const value = newState ? 'yes' : 'no'

		await setConfig('showWeekends', value)
		commit('toggleWeekendsEnabled')
	},

	/**
	 * Updates the user's setting for visibility of tasks
	 *
	 * @param {Object} vuex The Vuex destructuring object
	 * @param {Object} vuex.state The Vuex state
	 * @param {Function} vuex.commit The Vuex commit Function
	 * @returns {Promise<void>}
	 */
	async toggleTasksEnabled({ state, commit }) {
		const newState = !state.showTasks
		const value = newState ? 'yes' : 'no'

		await setConfig('showTasks', value)
		commit('toggleTasksEnabled')
		commit('clearFetchedTimeRanges')
		commit('incrementModificationCount')
	},

	/**
	 * Updates the user's setting for visibility of week numbers
	 *
	 * @param {Object} vuex The Vuex destructuring object
	 * @param {Object} vuex.state The Vuex state
	 * @param {Function} vuex.commit The Vuex commit Function
	 * @returns {Promise<void>}
	 */
	async toggleWeekNumberEnabled({ state, commit }) {
		const newState = !state.showWeekNumbers
		const value = newState ? 'yes' : 'no'

		await setConfig('showWeekNr', value)
		commit('toggleWeekNumberEnabled')
	},

	/**
	 * Updates the view to be used as initial view when opening
	 * the calendar app again
	 *
	 * @param {Object} context The Vuex destructuring object
	 * @param {Object} data The destructuring object
	 * @param {String} data.initialView New view to be used as initial view
	 * @returns {Promise<void>}
	 */
	async setInitialView(context, { initialView }) {
		await setConfig('view', initialView)
	},

	/**
	 * Updates the user's preferred slotDuration
	 *
	 * @param {Object} vuex The Vuex destructuring object
	 * @param {Object} vuex.state The Vuex state
	 * @param {Function} vuex.commit The Vuex commit Function
	 * @param {Object} data The destructuring object
	 * @param {String} data.slotDuration The new slot duration
	 */
	async setSlotDuration({ state, commit }, { slotDuration }) {
		if (state.slotDuration === slotDuration) {
			return
		}

		await setConfig('slotDuration', slotDuration)
		commit('setSlotDuration', { slotDuration })
	},

	/**
	 * Updates the user's preferred defaultReminder
	 *
	 * @param {Object} vuex The Vuex destructuring object
	 * @param {Object} vuex.state The Vuex state
	 * @param {Function} vuex.commit The Vuex commit Function
	 * @param {Object} data The destructuring object
	 * @param {String} data.defaultReminder The new default reminder
	 */
	async setDefaultReminder({ state, commit }, { defaultReminder }) {
		if (state.defaultReminder === defaultReminder) {
			return
		}

		await setConfig('defaultReminder', defaultReminder)
		commit('setDefaultReminder', { defaultReminder })
	},

	/**
	 * Updates the user's timezone
	 *
	 * @param {Object} vuex The Vuex destructuring object
	 * @param {Object} vuex.state The Vuex state
	 * @param {Function} vuex.commit The Vuex commit Function
	 * @param {Object} data The destructuring object
	 * @param {String} data.timezoneId The new timezone
	 * @returns {Promise<void>}
	 */
	async setTimezone({ state, commit }, { timezoneId }) {
		if (state.timezone === timezoneId) {
			return
		}

		await setConfig('timezone', timezoneId)
		commit('setTimezone', { timezoneId })
	},

	/**
	 * Initializes the calendar-js configuration
	 *
	 * @param {Object} vuex The Vuex destructuring object
	 * @param {Object} vuex.state The Vuex state
	 */
	initializeCalendarJsConfig({ state }) {
		setCalendarJsConfig('PRODID', `-//IDN nextcloud.com//Calendar app ${state.appVersion}//EN`)
		setCalendarJsConfig('property-list-significant-change', [
			'SUMMARY',
			'LOCATION',
			'DESCRIPTION',
		])
	},
}

export default { state, mutations, getters, actions }
