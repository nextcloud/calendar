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
import Vue from 'vue'
import HttpClient from 'nextcloud-axios'
import client from '../services/cdav'
import { getLinkToConfig } from '../services/settingsService'
import { mapDavCollectionToCalendar } from '../models/calendar'

const state = {
	settings: {
		appVersion: null,
		firstRun: null,
		showWeekends: null,
		showWeekNumbers: null,
		skipPopover: null,
		timezone: null
	}
}

const mutations = {

	/**
	 * Updates the user's setting for visibility of event popover
	 *
	 * @param {Object} state The Vuex state
	 */
	togglePopoverEnabled(state) {
		state.settings.showPopover = !state.showPopover
	},

	/**
	 * Updates the user's setting for visibility of weekends
	 *
	 * @param {Object} state The Vuex state
	 */
	toggleWeekendsEnabled(state) {
		state.settings.showWeekends = !state.showWeekends
	},

	/**
	 * Updates the user's setting for visibility of week numbers
	 *
	 * @param {Object} state The Vuex state
	 */
	toggleWeekNumberEnabled(state) {
		state.settings.showWeekNumbers = !state.showWeekNumbers
	},

	/**
	 * Updates the user's timezone
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {String} data.timezoneId The new timezone
	 */
	setTimezone(state, { timezoneId }) {
		state.settings.timezone = timezoneId
	},

	/**
	 * Initialize settings
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} settings The full settings object
	 */
	loadSettingsFromServer(state, settings) {
		Vue.set(state, 'settings', settings)
	}
}

const getters = {

	/**
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} getters the vuex getters
	 * @returns {boolean}
	 */
	hasBirthdayCalendar: (state, getters) => {
		return !!getters.getBirthdayCalendar
	},

	/**
	 *
	 * @param {Object} state The Vuex state
	 * @returns {Object}
	 */
	getSettings: (state) => state.settings
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
		const newState = !context.state.showPopover
		await HttpClient.post(getLinkToConfig(), {
			key: 'skipPopover',
			value: newState ? 'no' : 'yes'
		}).then((response) => {
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
		await HttpClient.post(getLinkToConfig(), {
			key: 'showWeekends',
			value: newState ? 'yes' : 'no'
		}).then((response) => {
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
		await HttpClient.post(getLinkToConfig(), {
			key: 'showWeekNr',
			value: newState ? 'yes' : 'no'
		}).then((response) => {
			context.commit('toggleWeekNumberEnabled')
		}).catch((error) => {
			throw error
		})
	},

	/**
	 *
	 * @param {Object} context The Vuex context
	 * @param {Object} data The destructuring object
	 * @param {String} data.initialView New view to be used as initial view
	 * @returns {Promise<void>}
	 */
	async setInitialView(context, { initialView }) {
		await HttpClient.post(getLinkToConfig(''), {
			key: 'initialView',
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
		context.commit('setTimezone', { timezoneId })
		// await HttpClient.post(getLinkToConfig(), {
		// 	key: 'timezone',
		// 	value: timezoneId
		// }).then((response) => {
		// 	context.commit('setTimezone', { timezoneId })
		// }).catch((error) => {
		// 	throw error
		// })
	}
}

export default { state, mutations, getters, actions }
