/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import useSettingsStore from '../../../../src/store/settings.js'
import useCalendarObjectsStore from '../../../../src/store/calendarObjects.js'
import useCalendarsStore from '../../../../src/store/calendars.js'
import useFetchedTimeRangesStore from '../../../../src/store/fetchedTimeRanges.js'
import { setActivePinia, createPinia } from 'pinia'

import { enableBirthdayCalendar } from '../../../../src/services/caldavService.js'
import { getDefaultCalendarObject, mapDavCollectionToCalendar } from '../../../../src/models/calendar.js'
import { detectTimezone } from '../../../../src/services/timezoneDetectionService.js'
import { setConfig as setCalendarJsConfig } from '@nextcloud/calendar-js'
import { setConfig } from '../../../../src/services/settings.js'
import { logInfo } from '../../../../src/utils/logger.js'
import { CALDAV_BIRTHDAY_CALENDAR } from '../../../../src/models/consts'

jest.mock('../../../../src/services/caldavService.js')
jest.mock('../../../../src/models/calendar.js')
jest.mock('../../../../src/services/timezoneDetectionService.js')
jest.mock('@nextcloud/calendar-js')
jest.mock('../../../../src/services/settings.js')
jest.mock('../../../../src/utils/logger.js')

describe('store/settings test suite', () => {

	beforeEach(() => {
		enableBirthdayCalendar.mockClear()
		mapDavCollectionToCalendar.mockClear()
		detectTimezone.mockClear()
		setCalendarJsConfig.mockClear()
		setConfig.mockClear()
		logInfo.mockClear()

		setActivePinia(createPinia())
	})

	it('should provide a default state', () => {
		const settingsStore = useSettingsStore()

		expect(settingsStore.$state).toEqual({
			appVersion: null,
			firstRun: null,
			forceEventAlarmType: false,
			hideEventExport: false,
			talkEnabled: false,
			eventLimit: null,
			showTasks: null,
			showWeekends: null,
			showWeekNumbers: null,
			skipPopover: null,
			slotDuration: null,
			defaultReminder: null,
			tasksEnabled: false,
			timezone: 'automatic',
			momentLocale: 'en',
			disableAppointments: false,
			canSubscribeLink: true,
			attachmentsFolder: '/Calendar',
			attachmentsFolderCreated: false,
			showResources: true,
			publicCalendars: null,
		})
	})

	it('should provide a mutation to set the settings initially', () => {
		const settingsStore = useSettingsStore()

		const state = {
			appVersion: null,
			firstRun: null,
			talkEnabled: false,
			eventLimit: null,
			showTasks: null,
			showWeekends: null,
			showWeekNumbers: null,
			skipPopover: null,
			slotDuration: null,
			defaultReminder: null,
			tasksEnabled: false,
			timezone: 'automatic',
			momentLocale: 'en',
			otherProp: 'bar',
			hideEventExport: false,
			forceEventAlarmType: false,
			disableAppointments: false,
			canSubscribeLink: true,
			attachmentsFolder: '/Calendar',
			showResources: true,
			publicCalendars: null,
		}

		settingsStore.$state = state

		const settings = {
			appVersion: '2.1.0',
			eventLimit: false,
			firstRun: true,
			showWeekNumbers: true,
			showTasks: false,
			showWeekends: true,
			skipPopover: true,
			slotDuration: '00:30:00',
			defaultReminder: '-600',
			talkEnabled: false,
			tasksEnabled: true,
			timezone: 'Europe/Berlin',
			otherUnknownSetting: 'foo',
			hideEventExport: false,
			forceEventAlarmType: false,
			disableAppointments: false,
			canSubscribeLink: true,
			attachmentsFolder: '/Attachments',
			showResources: true,
			publicCalendars: null,
		}

		settingsStore.loadSettingsFromServer(settings)

		expect(logInfo).toHaveBeenCalledTimes(1)
		expect(logInfo).toHaveBeenNthCalledWith(1, `
Initial settings:
	- AppVersion: 2.1.0
	- EventLimit: false
	- FirstRun: true
	- ShowWeekNumbers: true
	- ShowTasks: false
	- ShowWeekends: true
	- SkipPopover: true
	- SlotDuration: 00:30:00
	- DefaultReminder: -600
	- TalkEnabled: false
	- TasksEnabled: true
	- Timezone: Europe/Berlin
	- HideEventExport: false
	- ForceEventAlarmType: false
	- disableAppointments: false
	- CanSubscribeLink: true
	- attachmentsFolder: /Attachments
	- ShowResources: true
	- PublicCalendars: null
`)
		expect(settingsStore.$state).toEqual({
			appVersion: '2.1.0',
			eventLimit: false,
			firstRun: true,
			showWeekNumbers: true,
			showTasks: false,
			showWeekends: true,
			skipPopover: true,
			slotDuration: '00:30:00',
			defaultReminder: '-600',
			talkEnabled: false,
			tasksEnabled: true,
			timezone: 'Europe/Berlin',
			momentLocale: 'en',
			otherProp: 'bar',
			hideEventExport: false,
			forceEventAlarmType: false,
			disableAppointments: false,
			canSubscribeLink: true,
			attachmentsFolder: '/Attachments',
			attachmentsFolderCreated: false,
			showResources: true,
			publicCalendars: null,
		})
	})

	it('should provide a mutation to set the resolved moment locale', () => {
		const settingsStore = useSettingsStore()

		const state = {
			momentLocale: 'en',
		}

		settingsStore.$state = state

		settingsStore.setMomentLocale({ locale: 'de' })
		expect(logInfo).toHaveBeenCalledTimes(1)
		expect(logInfo).toHaveBeenNthCalledWith(1, 'Updated moment locale: de')

		expect(settingsStore.momentLocale).toEqual('de')
	})

	it('should provide a getter the get the resolved timezone - automatic', () => {
		const settingsStore = useSettingsStore()

		const state = {
			timezone: 'automatic',
		}

		settingsStore.timezone = state.timezone

		detectTimezone
			.mockReturnValueOnce('Europe/Berlin')

		expect(settingsStore.getResolvedTimezone).toEqual('Europe/Berlin')

		expect(detectTimezone).toHaveBeenCalledTimes(1)
	})

	it('should provide a getter the get the resolved timezone - non-automatic', () => {
		const settingsStore = useSettingsStore()

		const state = {
			timezone: 'Europe/Berlin',
		}

		settingsStore.timezone = state.timezone

		expect(settingsStore.getResolvedTimezone).toEqual('Europe/Berlin')

		expect(detectTimezone).toHaveBeenCalledTimes(0)
	})

	it('should provide an action to toggle the birthday calendar - enabled to disabled', async () => {
		const settingsStore = useSettingsStore()
		const calendarsStore = useCalendarsStore()

		const birthdayCalendar = {
			id: 'bday',
			url: `foo/bar/${CALDAV_BIRTHDAY_CALENDAR}/`,
			dav: {
				delete: jest.fn().mockResolvedValueOnce(),
			},
		}

		expect.assertions(3)

		mapDavCollectionToCalendar.mockImplementationOnce((collection) => collection)
		getDefaultCalendarObject.mockImplementationOnce((obj) => obj)

		calendarsStore.addCalendarMutation({ calendar: birthdayCalendar })

		expect(calendarsStore.getBirthdayCalendar).toEqual(birthdayCalendar)
		await settingsStore.toggleBirthdayCalendarEnabled()
		expect(calendarsStore.getBirthdayCalendar).toBeNull()

		expect(birthdayCalendar.dav.delete).toHaveBeenCalledTimes(1)
	})

	it('should provide an action to toggle the birthday calendar - disabled to enabled', async () => {
		const settingsStore = useSettingsStore()
		const calendarsStore = useCalendarsStore()

		const birthdayCalendar = {
			id: 'bday',
			url: `foo/bar/${CALDAV_BIRTHDAY_CALENDAR}/`,
		}

		expect.assertions(3)

		enableBirthdayCalendar.mockResolvedValueOnce(birthdayCalendar)
		mapDavCollectionToCalendar.mockImplementationOnce((collection) => collection)
		getDefaultCalendarObject.mockImplementationOnce((obj) => obj)

		expect(calendarsStore.getBirthdayCalendar).toBeNull()
		await settingsStore.toggleBirthdayCalendarEnabled()
		expect(calendarsStore.getBirthdayCalendar).toEqual(birthdayCalendar)

		expect(enableBirthdayCalendar).toHaveBeenCalledTimes(1)
	})

	it('should provide an action to toggle the event limit setting - false to true', async () => {
		const settingsStore = useSettingsStore()

		expect.assertions(3)
		const state = {
			eventLimit: false,
		}

		settingsStore.eventLimit = state.eventLimit
		setConfig.mockReturnValueOnce()

		await settingsStore.toggleEventLimitEnabled()

		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'eventLimit', 'yes')

		expect(settingsStore.eventLimit).toEqual(true)
	})

	it('should provide an action to toggle the event limit setting - true to false', async () => {
		const settingsStore = useSettingsStore()

		expect.assertions(3)
		const state = {
			eventLimit: true,
		}

		settingsStore.eventLimit = state.eventLimit
		setConfig.mockReturnValueOnce()

		await settingsStore.toggleEventLimitEnabled()
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'eventLimit', 'no')

		expect(settingsStore.eventLimit).toEqual(false)
	})

	it('should provide an action to toggle the popover setting - false to true', async () => {
		const settingsStore = useSettingsStore()

		expect.assertions(3)
		const state = {
			skipPopover: false,
		}

		settingsStore.skipPopover = state.skipPopover
		setConfig.mockReturnValueOnce()

		await settingsStore.togglePopoverEnabled()
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'skipPopover', 'yes')

		expect(settingsStore.skipPopover).toEqual(true)
	})

	it('should provide an action to toggle the popover setting - true to false', async () => {
		const settingsStore = useSettingsStore()

		expect.assertions(3)
		const state = {
			skipPopover: true,
		}

		settingsStore.skipPopover = state.skipPopover
		setConfig.mockReturnValueOnce()

		await settingsStore.togglePopoverEnabled()
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'skipPopover', 'no')

		expect(settingsStore.skipPopover).toEqual(false)
	})

	it('should provide an action to toggle the weekends setting - false to true', async () => {
		const settingsStore = useSettingsStore()

		expect.assertions(3)
		const state = {
			showWeekends: false,
		}

		settingsStore.showWeekends = state.showWeekends
		setConfig.mockReturnValueOnce()

		await settingsStore.toggleWeekendsEnabled()
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'showWeekends', 'yes')

		expect(settingsStore.showWeekends).toEqual(true)
	})

	it('should provide an action to toggle the weekends setting - true to false', async () => {
		const settingsStore = useSettingsStore()

		expect.assertions(3)
		const state = {
			showWeekends: true,
		}

		settingsStore.showWeekends = state.showWeekends
		setConfig.mockReturnValueOnce()

		await settingsStore.toggleWeekendsEnabled()
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'showWeekends', 'no')

		expect(settingsStore.showWeekends).toEqual(false)
	})

	it('should provide an action to toggle the week-number setting - false to true', async () => {
		const settingsStore = useSettingsStore()

		expect.assertions(3)
		const state = {
			showWeekNumbers: false,
		}

		settingsStore.showWeekNumbers = state.showWeekNumbers
		setConfig.mockReturnValueOnce()

		await settingsStore.toggleWeekNumberEnabled()
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'showWeekNr', 'yes')

		expect(settingsStore.showWeekNumbers).toEqual(true)
	})

	it('should provide an action to toggle the week-number setting - true to false', async () => {
		const settingsStore = useSettingsStore()

		expect.assertions(3)
		const state = {
			showWeekNumbers: true,
		}

		settingsStore.showWeekNumbers = state.showWeekNumbers
		setConfig.mockReturnValueOnce()

		await settingsStore.toggleWeekNumberEnabled()
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'showWeekNr', 'no')

		expect(settingsStore.showWeekNumbers).toEqual(false)
	})

	it('should provide an action to toggle the tasks-enabled setting - false to true', async () => {
		const settingsStore = useSettingsStore()
		const calendarObjectsStore = useCalendarObjectsStore()
		const fetchedTimeRangesStore = useFetchedTimeRangesStore()

		expect.assertions(7)

		settingsStore.showTasks = false
		calendarObjectsStore.modificationCount = 42
		fetchedTimeRangesStore.lastTimeRangeInsertId = 20
		fetchedTimeRangesStore.fetchedTimeRanges = ['foobar']
		fetchedTimeRangesStore.fetchedTimeRangesById = { foobar: 'baz' }

		setConfig.mockResolvedValueOnce()

		await settingsStore.toggleTasksEnabled()

		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'showTasks', 'yes')

		expect(settingsStore.showTasks).toEqual(true)
		expect(calendarObjectsStore.modificationCount).toEqual(43)
		expect(fetchedTimeRangesStore.lastTimeRangeInsertId).toEqual(-1)
		expect(fetchedTimeRangesStore.fetchedTimeRanges).toEqual([])
		expect(fetchedTimeRangesStore.fetchedTimeRangesById).toEqual({})
	})

	it('should provide an action to toggle the tasks-enabled setting - true to false', async () => {
		const settingsStore = useSettingsStore()
		const calendarObjectsStore = useCalendarObjectsStore()
		const fetchedTimeRangesStore = useFetchedTimeRangesStore()

		expect.assertions(7)

		settingsStore.showTasks = true
		calendarObjectsStore.modificationCount = 42
		fetchedTimeRangesStore.lastTimeRangeInsertId = 20
		fetchedTimeRangesStore.fetchedTimeRanges = ['foobar']
		fetchedTimeRangesStore.fetchedTimeRangesById = { foobar: 'baz' }

		setConfig.mockResolvedValueOnce()

		await settingsStore.toggleTasksEnabled()

		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'showTasks', 'no')

		expect(settingsStore.showTasks).toEqual(false)
		expect(calendarObjectsStore.modificationCount).toEqual(43)
		expect(fetchedTimeRangesStore.lastTimeRangeInsertId).toEqual(-1)
		expect(fetchedTimeRangesStore.fetchedTimeRanges).toEqual([])
		expect(fetchedTimeRangesStore.fetchedTimeRangesById).toEqual({})
	})

	it('should provide an action to set the last used view', async () => {
		const settingsStore = useSettingsStore()

		expect.assertions(2)

		setConfig.mockReturnValueOnce()

		await settingsStore.setInitialView({ initialView: 'agendaDay' })
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'view', 'agendaDay')
	})

	it('should provide an action to set the slot duration setting - same value', async () => {
		const settingsStore = useSettingsStore()

		expect.assertions(2)

		const state = {
			slotDuration: '00:15:00',
		}

		settingsStore.slotDuration = state.slotDuration

		await settingsStore.setSlotDuration({ slotDuration: '00:15:00' })

		expect(setConfig).toHaveBeenCalledTimes(0)
		expect(settingsStore.slotDuration).toEqual(state.slotDuration)
	})

	it('should provide an action to set the slot duration setting - different value', async () => {
		const settingsStore = useSettingsStore()

		expect.assertions(3)

		const state = {
			slotDuration: '00:15:00',
		}

		settingsStore.slotDuration = state.slotDuration
		setConfig.mockResolvedValueOnce()

		await settingsStore.setSlotDuration({ slotDuration: '00:30:00' })

		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'slotDuration', '00:30:00')

		expect(settingsStore.slotDuration).toEqual('00:30:00')
	})

	it('should provide an action to set the default reminder setting - same value', async () => {
		const settingsStore = useSettingsStore()

		expect.assertions(2)

		const state = {
			defaultReminder: 'none',
		}

		settingsStore.defaultReminder = state.defaultReminder

		await settingsStore.setDefaultReminder({ defaultReminder: 'none' })

		expect(setConfig).toHaveBeenCalledTimes(0)
		expect(settingsStore.defaultReminder).toEqual(state.defaultReminder)
	})

	it('should provide an action to set the default reminder setting - different value', async () => {
		const settingsStore = useSettingsStore()

		expect.assertions(3)

		const state = {
			defaultReminder: 'none',
		}

		settingsStore.defaultReminder = state.defaultReminder
		setConfig.mockResolvedValueOnce()

		await settingsStore.setDefaultReminder({ defaultReminder: '00:10:00' })

		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'defaultReminder', '00:10:00')

		expect(settingsStore.defaultReminder).toEqual('00:10:00')
	})

	it('should provide an action to set the timezone setting - same value', async () => {
		const settingsStore = useSettingsStore()

		expect.assertions(2)

		const state = {
			timezone: 'automatic',
		}

		settingsStore.timezone = state.timezone
		await settingsStore.setTimezone({ timezoneId: 'automatic' })

		expect(setConfig).toHaveBeenCalledTimes(0)
		expect(settingsStore.timezone).toEqual(state.timezone)
	})

	it('should provide an action to set the timezone setting - different value', async () => {
		const settingsStore = useSettingsStore()

		expect.assertions(3)

		const state = {
			timezone: 'automatic',
		}

		settingsStore.timezone = state.timezone
		setConfig.mockResolvedValueOnce()

		await settingsStore.setTimezone({ timezoneId: 'Europe/Berlin' })

		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'timezone', 'Europe/Berlin')

		expect(settingsStore.timezone).toEqual('Europe/Berlin')
	})

	it('should provide an action to initialize the calendar-js config', () => {
		const settingsStore = useSettingsStore()

		const state = {
			appVersion: '2.3.4',
		}

		settingsStore.appVersion = state.appVersion
		settingsStore.initializeCalendarJsConfig()

		expect(setCalendarJsConfig).toHaveBeenCalledTimes(2)
		expect(setCalendarJsConfig).toHaveBeenNthCalledWith(1, 'PRODID', '-//IDN nextcloud.com//Calendar app 2.3.4//EN')
		expect(setCalendarJsConfig).toHaveBeenNthCalledWith(2, 'property-list-significant-change', [
			'SUMMARY',
			'LOCATION',
			'DESCRIPTION',
		])
	})

})
