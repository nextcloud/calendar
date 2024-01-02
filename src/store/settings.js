/**
 * @copyright Copyright (c) 2020 Georg Ehrke
 * @copyright Copyright (c) 2022 Informatyka Boguslawski sp. z o.o. sp.k., http://www.ib.pl/
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
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
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { enableBirthdayCalendar } from '../services/caldavService.js'
import { mapDavCollectionToCalendar } from '../models/calendar.js'
import { detectTimezone } from '../services/timezoneDetectionService.js'
import { setConfig as setCalendarJsConfig } from '@nextcloud/calendar-js'
import { setConfig } from '../services/settings.js'
import { logInfo } from '../utils/logger.js'
import getTimezoneManager from '../services/timezoneDataProviderService.js'
import * as AttachmentService from '../services/attachmentService.js'

const state = {
	// env
	appVersion: null,
	firstRun: null,
	talkEnabled: false,
	disableAppointments: false,
	publicCalendars: null,
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
	hideEventExport: false,
	forceEventAlarmType: false,
	canSubscribeLink: true,
	showResources: true,
	// user-defined Nextcloud settings
	momentLocale: 'en',
	attachmentsFolder: '/Calendar',
	attachmentsFolderCreated: false,
}

const mutations = {

	/**
	 * Updates the user's setting for event limit
	 *
	 * @param {object} state The Vuex state
	 */
	toggleEventLimitEnabled(state) {
		state.eventLimit = !state.eventLimit
	},

	/**
	 * Updates the user's setting for visibility of event popover
	 *
	 * @param {object} state The Vuex state
	 */
	togglePopoverEnabled(state) {
		state.skipPopover = !state.skipPopover
	},

	/**
	 * Updates the user's setting for visibility of weekends
	 *
	 * @param {object} state The Vuex state
	 */
	toggleTasksEnabled(state) {
		state.showTasks = !state.showTasks
	},

	/**
	 * Updates the user's setting for visibility of weekends
	 *
	 * @param {object} state The Vuex state
	 */
	toggleWeekendsEnabled(state) {
		state.showWeekends = !state.showWeekends
	},

	/**
	 * Updates the user's setting for visibility of week numbers
	 *
	 * @param {object} state The Vuex state
	 */
	toggleWeekNumberEnabled(state) {
		state.showWeekNumbers = !state.showWeekNumbers
	},

	/**
	 * Updates the user's preferred slotDuration
	 *
	 * @param {object} state The Vuex state
	 * @param {object} data The destructuring object
	 * @param {string} data.slotDuration The new slot duration
	 */
	setSlotDuration(state, { slotDuration }) {
		state.slotDuration = slotDuration
	},

	/**
	 * Updates the user's preferred defaultReminder
	 *
	 * @param {object} state The Vuex state
	 * @param {object} data The destructuring object
	 * @param {string} data.defaultReminder The new default reminder length
	 */
	 setDefaultReminder(state, { defaultReminder }) {
		state.defaultReminder = defaultReminder
	},

	/**
	 * Updates the user's timezone
	 *
	 * @param {object} state The Vuex state
	 * @param {object} data The destructuring object
	 * @param {string} data.timezoneId The new timezone
	 */
	setTimezone(state, { timezoneId }) {
		state.timezone = timezoneId
	},

	/**
	 * Updates the user's attachments folder
	 *
	 * @param {object} state The Vuex state
	 * @param {object} data The destructuring object
	 * @param {string} data.attachmentsFolder The new attachments folder
	 */
	setAttachmentsFolder(state, { attachmentsFolder }) {
		state.attachmentsFolder = attachmentsFolder
		state.attachmentsFolderCreated = false
	},

	/**
	 * Update wheter the user's attachments folder has been created
	 *
	 * @param {object} state The Vuex state
	 * @param {object} data The destructuring object
	 * @param {boolean} data.attachmentsFolderCreated True if the folder has been created
	 */
	setAttachmentsFolderCreated(state, { attachmentsFolderCreated }) {
		state.attachmentsFolderCreated = attachmentsFolderCreated
	},

	/**
	 * Initialize settings
	 *
	 * @param {object} state The Vuex state
	 * @param {object} data The destructuring object
	 * @param {string} data.appVersion The version of the Nextcloud app
	 * @param {boolean} data.eventLimit Whether or not to limit number of visible events in grid view
	 * @param {boolean} data.firstRun Whether or not this is the first run
	 * @param {boolean} data.showWeekNumbers Whether or not to show week numbers
	 * @param {boolean} data.showTasks Whether or not to display tasks with a due-date
	 * @param {boolean} data.showWeekends Whether or not to display weekends
	 * @param {boolean} data.skipPopover Whether or not to skip the simple event popover
	 * @param {string} data.slotDuration The duration of one slot in the agendaView
	 * @param {string} data.defaultReminder The default reminder to set on newly created events
	 * @param {boolean} data.talkEnabled Whether or not the talk app is enabled
	 * @param {boolean} data.tasksEnabled Whether ot not the tasks app is enabled
	 * @param {string} data.timezone The timezone to view the calendar in. Either an Olsen timezone or "automatic"
	 * @param {boolean} data.hideEventExport
	 * @param {string} data.forceEventAlarmType
	 * @param {boolean} data.disableAppointments Allow to disable the appointments feature
	 * @param {boolean} data.canSubscribeLink
	 * @param {string} data.attachmentsFolder Default user's attachments folder
	 * @param {boolean} data.showResources Show or hide the resources tab
	 * @param {string} data.publicCalendars
	 */
	loadSettingsFromServer(state, { appVersion, eventLimit, firstRun, showWeekNumbers, showTasks, showWeekends, skipPopover, slotDuration, defaultReminder, talkEnabled, tasksEnabled, timezone, hideEventExport, forceEventAlarmType, disableAppointments, canSubscribeLink, attachmentsFolder, showResources, publicCalendars }) {
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
	- HideEventExport: ${hideEventExport}
	- ForceEventAlarmType: ${forceEventAlarmType}
	- disableAppointments: ${disableAppointments}
	- CanSubscribeLink: ${canSubscribeLink}
	- attachmentsFolder: ${attachmentsFolder}
	- ShowResources: ${showResources}
	- PublicCalendars: ${publicCalendars}
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
		state.hideEventExport = hideEventExport
		state.forceEventAlarmType = forceEventAlarmType
		state.disableAppointments = disableAppointments
		state.canSubscribeLink = canSubscribeLink
		state.attachmentsFolder = attachmentsFolder
		state.showResources = showResources
		state.publicCalendars = publicCalendars
	},

	/**
	 * Sets the name of the moment.js locale to be used
	 *
	 * @param {object} state The Vuex state
	 * @param {object} data The destructuring object
	 * @param {string} data.locale The moment.js locale to be used
	 */
	setMomentLocale(state, { locale }) {
		logInfo(`Updated moment locale: ${locale}`)

		state.momentLocale = locale
	},
}

const getters = {

	isTalkEnabled: (state) => state.talkEnabled,

	/**
	 * Gets the resolved timezone.
	 * If the timezone is set to automatic, it returns the user's current timezone
	 * Otherwise, it returns the Olsen timezone stored
	 *
	 * @param {object} state The Vuex state
	 * @return {string}
	 */
	getResolvedTimezone: (state) => state.timezone === 'automatic'
		? detectTimezone()
		: state.timezone,

	/**
	 * Gets the resolved timezone object.
	 * Falls back to UTC if timezone is invalid.
	 *
	 * @param {object} state The Vuex state
	 * @param {object} getters The vuex getters
	 * @return {object} The calendar-js timezone object
	 */
	getResolvedTimezoneObject: (state, getters) => {
		const timezone = getters.getResolvedTimezone
		let timezoneObject = getTimezoneManager().getTimezoneForId(timezone)
		if (!timezoneObject) {
			timezoneObject = getTimezoneManager().getTimezoneForId('UTC')
		}
		return timezoneObject
	},
}

const actions = {

	/**
	 * Updates the user's setting for visibility of birthday calendar
	 *
	 * @param {object} vuex The Vuex destructuring object
	 * @param {object} vuex.getters The Vuex Getters
	 * @param {Function} vuex.commit The Vuex commit Function
	 * @param {Function} vuex.dispatch The Vuex dispatch Function
	 * @return {Promise<void>}
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
	 * @param {object} vuex The Vuex destructuring object
	 * @param {object} vuex.state The Vuex state
	 * @param {Function} vuex.commit The Vuex commit Function
	 * @return {Promise<void>}
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
	 * @param {object} context The Vuex context
	 * @param {object} context.state The store state
	 * @param {object} context.commit The store mutations
	 * @return {Promise<void>}
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
	 * @param {object} context The Vuex context
	 * @param {object} context.state The store state
	 * @param {object} context.commit The store mutations
	 * @return {Promise<void>}
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
	 * @param {object} vuex The Vuex destructuring object
	 * @param {object} vuex.state The Vuex state
	 * @param {Function} vuex.commit The Vuex commit Function
	 * @return {Promise<void>}
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
	 * @param {object} vuex The Vuex destructuring object
	 * @param {object} vuex.state The Vuex state
	 * @param {Function} vuex.commit The Vuex commit Function
	 * @return {Promise<void>}
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
	 * @param {object} context The Vuex destructuring object
	 * @param {object} data The destructuring object
	 * @param {string} data.initialView New view to be used as initial view
	 * @return {Promise<void>}
	 */
	async setInitialView(context, { initialView }) {
		await setConfig('view', initialView)
	},

	/**
	 * Updates the user's preferred slotDuration
	 *
	 * @param {object} vuex The Vuex destructuring object
	 * @param {object} vuex.state The Vuex state
	 * @param {Function} vuex.commit The Vuex commit Function
	 * @param {object} data The destructuring object
	 * @param {string} data.slotDuration The new slot duration
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
	 * @param {object} vuex The Vuex destructuring object
	 * @param {object} vuex.state The Vuex state
	 * @param {Function} vuex.commit The Vuex commit Function
	 * @param {object} data The destructuring object
	 * @param {string} data.defaultReminder The new default reminder
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
	 * @param {object} vuex The Vuex destructuring object
	 * @param {object} vuex.state The Vuex state
	 * @param {Function} vuex.commit The Vuex commit Function
	 * @param {object} data The destructuring object
	 * @param {string} data.timezoneId The new timezone
	 * @return {Promise<void>}
	 */
	async setTimezone({ state, commit }, { timezoneId }) {
		if (state.timezone === timezoneId) {
			return
		}

		await setConfig('timezone', timezoneId)
		commit('setTimezone', { timezoneId })
	},

	/**
	 * Updates the user's attachments folder
	 *
	 * @param {object} vuex The Vuex destructuring object
	 * @param {object} vuex.state The Vuex state
	 * @param {Function} vuex.commit The Vuex commit Function
	 * @param {object} data The destructuring object
	 * @param {string} data.attachmentsFolder The new attachments folder
	 * @return {Promise<void>}
	 */
	async setAttachmentsFolder({ state, commit }, { attachmentsFolder }) {
		if (state.attachmentsFolder === attachmentsFolder) {
			return
		}

		await setConfig('attachmentsFolder', attachmentsFolder)
		commit('setAttachmentsFolder', { attachmentsFolder })
	},

	/**
	 * Create the user's attachment folder if it doesn't exist and return its path
	 *
	 * @param {object} vuex The Vuex destructuring object
	 * @param {object} vuex.state The Vuex state
	 * @param {Function} vuex.commit The Vuex commit Function
	 * @param {Function} vuex.dispatch The Vuex commit function
	 * @param {object} vuex.getters The Vuex getters object
	 * @return {Promise<string>} The path of the user's attachments folder
	 */
	async createAttachmentsFolder({ state, commit, dispatch, getters }) {
		if (state.attachmentsFolderCreated) {
			return state.attachmentsFolder
		}

		const userId = getters.getCurrentUserPrincipal.dav.userId
		const path = await AttachmentService.createFolder(state.attachmentsFolder, userId)
		if (path !== state.attachmentsFolder) {
			await dispatch('setAttachmentsFolder', { attachmentsFolder: path })
		}
		commit('setAttachmentsFolderCreated', { attachmentsFolderCreated: true })
		return path
	},

	/**
	 * Initializes the calendar-js configuration
	 *
	 * @param {object} vuex The Vuex destructuring object
	 * @param {object} vuex.state The Vuex state
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
