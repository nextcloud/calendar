/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { enableBirthdayCalendar } from '../services/caldavService.js'
import { mapDavCollectionToCalendar } from '../models/calendar.js'
import { detectTimezone } from '../services/timezoneDetectionService.js'
import { setConfig as setCalendarJsConfig } from '@nextcloud/calendar-js'
import { setConfig } from '../services/settings.js'
import { logInfo } from '../utils/logger.js'
import { defineStore } from 'pinia'
import getTimezoneManager from '../services/timezoneDataProviderService.js'
import * as AttachmentService from '../services/attachmentService.js'
import usePrincipalsStore from './principals.js'
import useFetchedTimeRangesStore from './fetchedTimeRanges.js'
import useCalendarsStore from './calendars.js'
import useCalendarObjectsStore from './calendarObjects.js'

export default defineStore('settings', {
	state: () => {
		return {
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
	},
	getters: {
		/**
		 * Gets the resolved timezone.
		 * If the timezone is set to automatic, it returns the user's current timezone
		 * Otherwise, it returns the Olsen timezone stored
		 *
		 * @param {object} state The pinia state
		 * @return {string}
		 */
		getResolvedTimezone: (state) => state.timezone === 'automatic'
			? detectTimezone()
			: state.timezone,

		/**
		 * Gets the resolved timezone object.
		 * Falls back to UTC if timezone is invalid.
		 *
		 * @return {object} The calendar-js timezone object
		 */
		getResolvedTimezoneObject() {
			const timezone = this.getResolvedTimezone
			let timezoneObject = getTimezoneManager().getTimezoneForId(timezone)
			if (!timezoneObject) {
				timezoneObject = getTimezoneManager().getTimezoneForId('UTC')
			}
			return timezoneObject
		},
	},
	actions: {
		/**
		 * Updates the user's setting for visibility of birthday calendar
		 *
		 * @return {Promise<void>}
		 */
		async toggleBirthdayCalendarEnabled() {
			const calendarsStore = useCalendarsStore()
			const hasBirthdayCalendar = !!calendarsStore.getBirthdayCalendar

			if (hasBirthdayCalendar) {
				const calendar = calendarsStore.getBirthdayCalendar
				await calendarsStore.deleteCalendar({ calendar })
			} else {
				const davCalendar = await enableBirthdayCalendar()
				const calendar = mapDavCollectionToCalendar(davCalendar)
				calendarsStore.addCalendarMutation({ calendar })
			}
		},

		/**
		 * Updates the user's setting for event limit
		 *
		 * @return {Promise<void>}
		 */
		async toggleEventLimitEnabled() {
			const newState = !this.eventLimit
			const value = newState ? 'yes' : 'no'

			await setConfig('eventLimit', value)
			this.eventLimit = !this.eventLimit
		},

		/**
		 * Updates the user's setting for visibility of event popover
		 *
		 * @return {Promise<void>}
		 */
		async togglePopoverEnabled() {
			const newState = !this.skipPopover
			const value = newState ? 'yes' : 'no'

			await setConfig('skipPopover', value)
			this.skipPopover = !this.skipPopover
		},

		/**
		 * Updates the user's setting for visibility of weekends
		 *
		 * @return {Promise<void>}
		 */
		async toggleWeekendsEnabled() {
			const newState = !this.showWeekends
			const value = newState ? 'yes' : 'no'

			await setConfig('showWeekends', value)
			this.showWeekends = !this.showWeekends
		},

		/**
		 * Updates the user's setting for visibility of tasks
		 *
		 * @return {Promise<void>}
		 */
		async toggleTasksEnabled() {
			const fetchedTimeRangesStore = useFetchedTimeRangesStore()
			const calendarObjectsStore = useCalendarObjectsStore()
			const newState = !this.showTasks
			const value = newState ? 'yes' : 'no'

			await setConfig('showTasks', value)
			this.showTasks = !this.showTasks
			fetchedTimeRangesStore.clearFetchedTimeRanges()
			calendarObjectsStore.modificationCount++
		},

		/**
		 * Updates the user's setting for visibility of week numbers
		 *
		 * @return {Promise<void>}
		 */
		async toggleWeekNumberEnabled() {
			const newState = !this.showWeekNumbers
			const value = newState ? 'yes' : 'no'

			await setConfig('showWeekNr', value)
			this.showWeekNumbers = !this.showWeekNumbers
		},

		/**
		 * Updates the view to be used as initial view when opening
		 * the calendar app again
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.initialView New view to be used as initial view
		 * @return {Promise<void>}
		 */
		async setInitialView({ initialView }) {
			await setConfig('view', initialView)
		},

		/**
		 * Updates the user's preferred slotDuration
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.slotDuration The new slot duration
		 */
		async setSlotDuration({ slotDuration }) {
			if (this.slotDuration === slotDuration) {
				return
			}

			await setConfig('slotDuration', slotDuration)
			this.slotDuration = slotDuration
		},

		/**
		 * Updates the user's preferred defaultReminder
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.defaultReminder The new default reminder
		 */
		async setDefaultReminder({ defaultReminder }) {
			if (this.defaultReminder === defaultReminder) {
				return
			}

			await setConfig('defaultReminder', defaultReminder)
			this.defaultReminder = defaultReminder
		},

		/**
		 * Updates the user's timezone
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.timezoneId The new timezone
		 * @return {Promise<void>}
		 */
		async setTimezone({ timezoneId }) {
			if (this.timezone === timezoneId) {
				return
			}

			await setConfig('timezone', timezoneId)
			this.timezone = timezoneId
		},

		/**
		 * Updates the user's attachments folder
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.attachmentsFolder The new attachments folder
		 * @return {Promise<void>}
		 */
		async setAttachmentsFolder({ attachmentsFolder }) {
			if (this.attachmentsFolder === attachmentsFolder) {
				return
			}

			await setConfig('attachmentsFolder', attachmentsFolder)
			this.attachmentsFolder = attachmentsFolder
			this.attachmentsFolderCreated = false
		},

		/**
		 * Create the user's attachment folder if it doesn't exist and return its path
		 *
		 * @return {Promise<string>} The path of the user's attachments folder
		 */
		async createAttachmentsFolder() {
			const principalsStore = usePrincipalsStore()

			if (this.attachmentsFolderCreated) {
				return this.attachmentsFolder
			}

			const userId = principalsStore.getCurrentUserPrincipal.dav.userId /// TODO make work with new eventual principals.js
			const path = await AttachmentService.createFolder(this.attachmentsFolder, userId)
			if (path !== this.attachmentsFolder) {
				await this.setAttachmentsFolder({ attachmentsFolder: path })
			}
			this.attachmentsFolderCreated = true
			return path
		},

		/**
		 * Initializes the calendar-js configuration
		 */
		initializeCalendarJsConfig() {
			setCalendarJsConfig('PRODID', `-//IDN nextcloud.com//Calendar app ${this.appVersion}//EN`)
			setCalendarJsConfig('property-list-significant-change', [
				'SUMMARY',
				'LOCATION',
				'DESCRIPTION',
			])
		},

		/**
		 * Initialize settings
		 *
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
		loadSettingsFromServer({ appVersion, eventLimit, firstRun, showWeekNumbers, showTasks, showWeekends, skipPopover, slotDuration, defaultReminder, talkEnabled, tasksEnabled, timezone, hideEventExport, forceEventAlarmType, disableAppointments, canSubscribeLink, attachmentsFolder, showResources, publicCalendars }) {
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

			this.appVersion = appVersion
			this.eventLimit = eventLimit
			this.firstRun = firstRun
			this.showWeekNumbers = showWeekNumbers
			this.showTasks = showTasks
			this.showWeekends = showWeekends
			this.skipPopover = skipPopover
			this.slotDuration = slotDuration
			this.defaultReminder = defaultReminder
			this.talkEnabled = talkEnabled
			this.tasksEnabled = tasksEnabled
			this.timezone = timezone
			this.hideEventExport = hideEventExport
			this.forceEventAlarmType = forceEventAlarmType
			this.disableAppointments = disableAppointments
			this.canSubscribeLink = canSubscribeLink
			this.attachmentsFolder = attachmentsFolder
			this.showResources = showResources
			this.publicCalendars = publicCalendars
		},

		/**
		 * Sets the name of the moment.js locale to be used
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.locale The moment.js locale to be used
		 */
		setMomentLocale({ locale }) {
			logInfo(`Updated moment locale: ${locale}`)

			this.momentLocale = locale
		},
	},

})
