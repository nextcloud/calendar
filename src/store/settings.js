/**
 * @copyright Copyright (c) 2019 Georg Ehrke
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
import HttpClient from '@nextcloud/axios'
import client from '../services/caldavService.js'
import { getLinkToConfig } from '../utils/settings.js'
import { mapDavCollectionToCalendar } from '../models/calendar'
import detectTimezone from '../services/timezoneDetectionService'

const state = {
	appVersion: null,
	firstRun: null,
	showWeekends: null,
	showWeekNumbers: null,
	skipPopover: null,
	timezone: null
}

const mutations = {

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
	 * @param {Object} settings The full settings object
	 */
	loadSettingsFromServer(state, settings) {
		console.debug('Initial settings:', settings)

		state.appVersion = settings.appVersion
		state.firstRun = settings.firstRun
		state.showWeekNumbers = settings.showWeekNumbers
		state.showWeekends = settings.showWeekends
		state.skipPopover = settings.skipPopover
		state.timezone = settings.timezone
	}
}

const getters = {

	/**
	 * Whether or not a birthday calendar exists
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} getters the vuex getters
	 * @returns {boolean}
	 */
	hasBirthdayCalendar: (state, getters) => {
		return !!getters.getBirthdayCalendar
	},

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
		: state.timezone
}

const actions = {

	/**
	 * Updates the user's setting for visibility of birthday calendar
	 *
	 * @param {Object} context The Vuex context
	 * @returns {Promise<void>}
	 */
	async toggleBirthdayCalendarEnabled(context) {
		if (context.getters.hasBirthdayCalendar) {
			const calendar = context.getters.getBirthdayCalendar
			return context.dispatch('deleteCalendar', { calendar })
		} else {
			await client.calendarHomes[0].enableBirthdayCalendar()
			const davCalendar = await client.calendarHomes[0].find('contact_birthdays')
			const calendar = mapDavCollectionToCalendar(davCalendar)
			context.commit('addCalendar', { calendar })
		}
	},

	/**
	 * Updates the user's setting for visibility of event popover
	 *
	 * @param {Object} context The Vuex context
	 * @returns {Promise<void>}
	 */
	async togglePopoverEnabled(context) {
		const newState = !context.state.skipPopover
		const value = newState ? 'no' : 'yes'

		await HttpClient.post(getLinkToConfig('skipPopover'), { value })
			.then((response) => {
				context.commit('togglePopoverEnabled')
			}).catch((error) => {
				throw error
			})
	},

	/**
	 * Updates the user's setting for visibility of weekends
	 *
	 * @param {Object} context The Vuex context
	 * @returns {Promise<void>}
	 */
	async toggleWeekendsEnabled(context) {
		const newState = !context.state.showWeekends
		const value = newState ? 'yes' : 'no'

		await HttpClient.post(getLinkToConfig('showWeekends'), { value })
			.then((response) => {
				context.commit('toggleWeekendsEnabled')
			}).catch((error) => {
				throw error
			})
	},

	/**
	 * Updates the user's setting for visibility of week numbers
	 *
	 * @param {Object} context The Vuex context
	 * @returns {Promise<void>}
	 */
	async toggleWeekNumberEnabled(context) {
		const newState = !context.state.showWeekNumbers
		const value = newState ? 'yes' : 'no'

		await HttpClient.post(getLinkToConfig('showWeekNr'), { value })
			.then((response) => {
				context.commit('toggleWeekNumberEnabled')
			}).catch((error) => {
				throw error
			})
	},

	/**
	 * Updates the view to be used as initial view when opening
	 * the calendar app again
	 *
	 * @param {Object} context The Vuex context
	 * @param {Object} data The destructuring object
	 * @param {String} data.initialView New view to be used as initial view
	 * @returns {Promise<void>}
	 */
	async setInitialView(context, { initialView }) {
		await HttpClient.post(getLinkToConfig('view'), {
			value: initialView
		})
	},

	/**
	 * Updates the user's timezone
	 *
	 * @param {Object} context The Vuex context
	 * @param {Object} data The destructuring object
	 * @param {String} data.timezoneId The new timezone
	 * @returns {Promise<void>}
	 */
	async setTimezone(context, { timezoneId }) {
		if (context.state.timezone === timezoneId) {
			return
		}

		await HttpClient.post(getLinkToConfig('timezone'), {
			value: timezoneId
		}).then((response) => {
			context.commit('setTimezone', { timezoneId })
		}).catch((error) => {
			throw error
		})
	}
}

export default { state, mutations, getters, actions }
