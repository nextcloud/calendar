/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 * @copyright Copyright (c) 2022 Informatyka Boguslawski sp. z o.o. sp.k., http://www.ib.pl/
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
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import settingsStore from '../../../../src/store/settings.js'
import { enableBirthdayCalendar } from '../../../../src/services/caldavService.js'
import { mapDavCollectionToCalendar } from '../../../../src/models/calendar.js'
import { detectTimezone } from '../../../../src/services/timezoneDetectionService.js'
import { setConfig as setCalendarJsConfig } from '@nextcloud/calendar-js'
import { setConfig } from '../../../../src/services/settings.js'
import { logInfo } from '../../../../src/utils/logger.js'

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
	})

	it('should provide a default state', () => {
		expect(settingsStore.state).toEqual({
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

	it('should provide a mutation to toggle the eventLimit setting', () => {
		const state = {
			eventLimit: false,
		}

		settingsStore.mutations.toggleEventLimitEnabled(state)
		expect(state.eventLimit).toEqual(true)

		settingsStore.mutations.toggleEventLimitEnabled(state)
		expect(state.eventLimit).toEqual(false)
	})

	it('should provide a mutation to toggle the popover setting', () => {
		const state = {
			skipPopover: false,
		}

		settingsStore.mutations.togglePopoverEnabled(state)
		expect(state.skipPopover).toEqual(true)

		settingsStore.mutations.togglePopoverEnabled(state)
		expect(state.skipPopover).toEqual(false)
	})

	it('should provide a mutation to toggle the task setting', () => {
		const state = {
			showTasks: false,
		}

		settingsStore.mutations.toggleTasksEnabled(state)
		expect(state.showTasks).toEqual(true)

		settingsStore.mutations.toggleTasksEnabled(state)
		expect(state.showTasks).toEqual(false)
	})

	it('should provide a mutation to toggle the weekends setting', () => {
		const state = {
			showWeekends: false,
		}

		settingsStore.mutations.toggleWeekendsEnabled(state)
		expect(state.showWeekends).toEqual(true)

		settingsStore.mutations.toggleWeekendsEnabled(state)
		expect(state.showWeekends).toEqual(false)
	})

	it('should provide a mutation to toggle the week-number setting', () => {
		const state = {
			showWeekNumbers: false,
		}

		settingsStore.mutations.toggleWeekNumberEnabled(state)
		expect(state.showWeekNumbers).toEqual(true)

		settingsStore.mutations.toggleWeekNumberEnabled(state)
		expect(state.showWeekNumbers).toEqual(false)
	})

	it('should provide a mutation to set the slot duration setting', () => {
		const state = {
			slotDuration: 'previousValue',
		}

		settingsStore.mutations.setSlotDuration(state, { slotDuration: '00:30:00' })
		expect(state.slotDuration).toEqual('00:30:00')
	})

	it('should provide a mutation to set the default reminder duration setting', () => {
		const state = {
			defaultReminder: 'previousValue',
		}

		settingsStore.mutations.setDefaultReminder(state, { defaultReminder: '-300' })
		expect(state.defaultReminder).toEqual('-300')
	})

	it('should provide a mutation to set the timezone setting', () => {
		const state = {
			timezone: 'previousValue',
		}

		settingsStore.mutations.setTimezone(state, { timezoneId: 'Europe/Berlin' })
		expect(state.timezone).toEqual('Europe/Berlin')
	})

	it('should provide a mutation to set the settings initially', () => {
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

		settingsStore.mutations.loadSettingsFromServer(state, settings)

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
		expect(state).toEqual({
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
			showResources: true,
			publicCalendars: null,
		})
	})

	it('should provide a mutation to set the resolved moment locale', () => {
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
			tasksEnabled: false,
			timezone: 'automatic',
			momentLocale: 'en',
			otherProp: 'bar',
		}

		settingsStore.mutations.setMomentLocale(state, { locale: 'de' })
		expect(logInfo).toHaveBeenCalledTimes(1)
		expect(logInfo).toHaveBeenNthCalledWith(1, 'Updated moment locale: de')

		expect(state).toEqual({
			appVersion: null,
			firstRun: null,
			talkEnabled: false,
			eventLimit: null,
			showTasks: null,
			showWeekends: null,
			showWeekNumbers: null,
			skipPopover: null,
			slotDuration: null,
			tasksEnabled: false,
			timezone: 'automatic',
			momentLocale: 'de',
			otherProp: 'bar',
		})
	})

	it('should provide a getter the get the resolved timezone - automatic', () => {
		const state = {
			timezone: 'automatic',
		}

		detectTimezone
			.mockReturnValueOnce('Europe/Berlin')

		expect(settingsStore.getters.getResolvedTimezone(state)).toEqual('Europe/Berlin')

		expect(detectTimezone).toHaveBeenCalledTimes(1)
	})

	it('should provide a getter the get the resolved timezone - non-automatic', () => {
		const state = {
			timezone: 'Europe/Berlin',
		}

		expect(settingsStore.getters.getResolvedTimezone(state)).toEqual('Europe/Berlin')

		expect(detectTimezone).toHaveBeenCalledTimes(0)
	})

	it('should provide an action to toggle the birthday calendar - enabled to disabled', async () => {
		expect.assertions(3)

		const getters = {
			hasBirthdayCalendar: true,
			getBirthdayCalendar: {
				id: 'contact_birthdays',
			},
		}
		const commit = jest.fn()
		const dispatch = jest.fn()

		dispatch.mockResolvedValueOnce()

		await settingsStore.actions.toggleBirthdayCalendarEnabled({ getters, commit, dispatch })

		expect(dispatch).toHaveBeenCalledTimes(1)
		expect(dispatch).toHaveBeenNthCalledWith(1, 'deleteCalendar', { calendar: getters.getBirthdayCalendar })
		expect(commit).toHaveBeenCalledTimes(0)
	})

	it('should provide an action to toggle the birthday calendar - disabled to enabled', async () => {
		expect.assertions(5)

		const getters = {
			hasBirthdayCalendar: false,
			getBirthdayCalendar: null,
		}
		const commit = jest.fn()
		const dispatch = jest.fn()

		const davCalendar = {
			davCalendar: true,
		}
		enableBirthdayCalendar.mockResolvedValueOnce(davCalendar)

		const calendar = {
			id: 'new-birthday-calendar',
		}
		mapDavCollectionToCalendar.mockReturnValueOnce(calendar)

		await settingsStore.actions.toggleBirthdayCalendarEnabled({ getters, commit, dispatch })

		expect(enableBirthdayCalendar).toHaveBeenCalledTimes(1)
		expect(mapDavCollectionToCalendar).toHaveBeenCalledTimes(1)
		expect(mapDavCollectionToCalendar).toHaveBeenNthCalledWith(1, davCalendar)
		expect(commit).toHaveBeenCalledTimes(1)
		expect(commit).toHaveBeenNthCalledWith(1, 'addCalendar', { calendar })

	})

	it('should provide an action to toggle the event limit setting - false to true', async () => {
		expect.assertions(4)

		const state = {
			eventLimit: false,
		}
		const commit = jest.fn()

		setConfig.mockReturnValueOnce()

		await settingsStore.actions.toggleEventLimitEnabled({ state, commit })
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'eventLimit', 'yes')
		expect(commit).toHaveBeenCalledTimes(1)
		expect(commit).toHaveBeenNthCalledWith(1, 'toggleEventLimitEnabled')
	})

	it('should provide an action to toggle the event limit setting - true to false', async () => {
		expect.assertions(4)

		const state = {
			eventLimit: true,
		}
		const commit = jest.fn()

		setConfig.mockReturnValueOnce()

		await settingsStore.actions.toggleEventLimitEnabled({ state, commit })
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'eventLimit', 'no')
		expect(commit).toHaveBeenCalledTimes(1)
		expect(commit).toHaveBeenNthCalledWith(1, 'toggleEventLimitEnabled')

	})

	it('should provide an action to toggle the popover setting - false to true', async () => {
		expect.assertions(4)

		const state = {
			skipPopover: false,
		}
		const commit = jest.fn()

		setConfig.mockReturnValueOnce()

		await settingsStore.actions.togglePopoverEnabled({ state, commit })
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'skipPopover', 'yes')
		expect(commit).toHaveBeenCalledTimes(1)
		expect(commit).toHaveBeenNthCalledWith(1, 'togglePopoverEnabled')
	})

	it('should provide an action to toggle the popover setting - true to false', async () => {
		expect.assertions(4)

		const state = {
			skipPopover: true,
		}
		const commit = jest.fn()

		setConfig.mockReturnValueOnce()

		await settingsStore.actions.togglePopoverEnabled({ state, commit })
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'skipPopover', 'no')
		expect(commit).toHaveBeenCalledTimes(1)
		expect(commit).toHaveBeenNthCalledWith(1, 'togglePopoverEnabled')
	})

	it('should provide an action to toggle the weekends setting - false to true', async () => {
		expect.assertions(4)

		const state = {
			showWeekends: false,
		}
		const commit = jest.fn()

		setConfig.mockReturnValueOnce()

		await settingsStore.actions.toggleWeekendsEnabled({ state, commit })
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'showWeekends', 'yes')
		expect(commit).toHaveBeenCalledTimes(1)
		expect(commit).toHaveBeenNthCalledWith(1, 'toggleWeekendsEnabled')
	})

	it('should provide an action to toggle the weekends setting - true to false', async () => {
		expect.assertions(4)

		const state = {
			showWeekends: true,
		}
		const commit = jest.fn()

		setConfig.mockReturnValueOnce()

		await settingsStore.actions.toggleWeekendsEnabled({ state, commit })
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'showWeekends', 'no')
		expect(commit).toHaveBeenCalledTimes(1)
		expect(commit).toHaveBeenNthCalledWith(1, 'toggleWeekendsEnabled')
	})

	it('should provide an action to toggle the week-number setting - false to true', async () => {
		expect.assertions(4)

		const state = {
			showWeekNumbers: false,
		}
		const commit = jest.fn()

		setConfig.mockReturnValueOnce()

		await settingsStore.actions.toggleWeekNumberEnabled({ state, commit })
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'showWeekNr', 'yes')
		expect(commit).toHaveBeenCalledTimes(1)
		expect(commit).toHaveBeenNthCalledWith(1, 'toggleWeekNumberEnabled')
	})

	it('should provide an action to toggle the week-number setting - true to false', async () => {
		expect.assertions(4)

		const state = {
			showWeekNumbers: true,
		}
		const commit = jest.fn()

		setConfig.mockReturnValueOnce()

		await settingsStore.actions.toggleWeekNumberEnabled({ state, commit })
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'showWeekNr', 'no')
		expect(commit).toHaveBeenCalledTimes(1)
		expect(commit).toHaveBeenNthCalledWith(1, 'toggleWeekNumberEnabled')
	})

	it('should provide an action to toggle the tasks-enabled setting - false to true', async () => {
		expect.assertions(6)

		const state = {
			showTasks: false,
		}
		const commit = jest.fn()

		setConfig.mockReturnValueOnce()

		await settingsStore.actions.toggleTasksEnabled({ state, commit })
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'showTasks', 'yes')
		expect(commit).toHaveBeenCalledTimes(3)
		expect(commit).toHaveBeenNthCalledWith(1, 'toggleTasksEnabled')
		expect(commit).toHaveBeenNthCalledWith(2, 'clearFetchedTimeRanges')
		expect(commit).toHaveBeenNthCalledWith(3, 'incrementModificationCount')
	})

	it('should provide an action to toggle the tasks-enabled setting - true to false', async () => {
		expect.assertions(6)

		const state = {
			showTasks: true,
		}
		const commit = jest.fn()

		setConfig.mockReturnValueOnce()

		await settingsStore.actions.toggleTasksEnabled({ state, commit })
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'showTasks', 'no')
		expect(commit).toHaveBeenCalledTimes(3)
		expect(commit).toHaveBeenNthCalledWith(1, 'toggleTasksEnabled')
		expect(commit).toHaveBeenNthCalledWith(2, 'clearFetchedTimeRanges')
		expect(commit).toHaveBeenNthCalledWith(3, 'incrementModificationCount')
	})

	it('should provide an action to set the last used view', async () => {
		expect.assertions(2)

		setConfig.mockReturnValueOnce()

		await settingsStore.actions.setInitialView({}, { initialView: 'agendaDay' })
		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'view', 'agendaDay')
	})

	it('should provide an action to set the slot duration setting - same value', async () => {
		expect.assertions(2)

		const state = {
			slotDuration: '00:15:00',
		}
		const commit = jest.fn()

		await settingsStore.actions.setSlotDuration({ state, commit }, { slotDuration: '00:15:00' })

		expect(setConfig).toHaveBeenCalledTimes(0)
		expect(commit).toHaveBeenCalledTimes(0)
	})

	it('should provide an action to set the slot duration setting - different value', async () => {
		expect.assertions(4)

		const state = {
			slotDuration: '00:15:00',
		}
		const commit = jest.fn()

		setConfig.mockResolvedValueOnce()

		await settingsStore.actions.setSlotDuration({ state, commit }, { slotDuration: '00:30:00' })

		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'slotDuration', '00:30:00')
		expect(commit).toHaveBeenCalledTimes(1)
		expect(commit).toHaveBeenNthCalledWith(1, 'setSlotDuration', { slotDuration: '00:30:00' })
	})

	it('should provide an action to set the default reminder setting - same value', async () => {
		expect.assertions(2)

		const state = {
			defaultReminder: 'none',
		}
		const commit = jest.fn()

		await settingsStore.actions.setDefaultReminder({ state, commit }, { defaultReminder: 'none' })

		expect(setConfig).toHaveBeenCalledTimes(0)
		expect(commit).toHaveBeenCalledTimes(0)
	})

	it('should provide an action to set the default reminder setting - different value', async () => {
		expect.assertions(4)

		const state = {
			defaultReminder: 'none',
		}
		const commit = jest.fn()

		setConfig.mockResolvedValueOnce()

		await settingsStore.actions.setDefaultReminder({ state, commit }, { defaultReminder: '00:10:00' })

		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'defaultReminder', '00:10:00')
		expect(commit).toHaveBeenCalledTimes(1)
		expect(commit).toHaveBeenNthCalledWith(1, 'setDefaultReminder', { defaultReminder: '00:10:00' })
	})

	it('should provide an action to set the timezone setting - same value', async () => {
		expect.assertions(2)

		const state = {
			timezone: 'automatic',
		}
		const commit = jest.fn()

		await settingsStore.actions.setTimezone({ state, commit }, { timezoneId: 'automatic' })

		expect(setConfig).toHaveBeenCalledTimes(0)
		expect(commit).toHaveBeenCalledTimes(0)
	})

	it('should provide an action to set the timezone setting - different value', async () => {
		expect.assertions(4)

		const state = {
			timezone: 'automatic',
		}
		const commit = jest.fn()

		setConfig.mockResolvedValueOnce()

		await settingsStore.actions.setTimezone({ state, commit }, { timezoneId: 'Europe/Berlin' })

		expect(setConfig).toHaveBeenCalledTimes(1)
		expect(setConfig).toHaveBeenNthCalledWith(1, 'timezone', 'Europe/Berlin')
		expect(commit).toHaveBeenCalledTimes(1)
		expect(commit).toHaveBeenNthCalledWith(1, 'setTimezone', { timezoneId: 'Europe/Berlin' })
	})

	it('should provide an action to initialize the calendar-js config', () => {
		const state = {
			appVersion: '2.3.4',
		}

		settingsStore.actions.initializeCalendarJsConfig({ state })

		expect(setCalendarJsConfig).toHaveBeenCalledTimes(2)
		expect(setCalendarJsConfig).toHaveBeenNthCalledWith(1, 'PRODID', '-//IDN nextcloud.com//Calendar app 2.3.4//EN')
		expect(setCalendarJsConfig).toHaveBeenNthCalledWith(2, 'property-list-significant-change', [
			'SUMMARY',
			'LOCATION',
			'DESCRIPTION',
		])
	})

})
