/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import eventDrop from '../../../../../src/fullcalendar/interaction/eventDrop.js'
import { getDurationValueFromFullCalendarDuration } from '../../../../../src/fullcalendar/duration.js'
import getTimezoneManager from '../../../../../src/services/timezoneDataProviderService.js'
import { getObjectAtRecurrenceId } from '../../../../../src/utils/calendarObject.js'
import useCalendarsStore from '../../../../../src/store/calendars.js'
import useCalendarObjectsStore from '../../../../../src/store/calendarObjects.js'
import usePrincipalsStore from '../../../../../src/store/principals.js'
import { translate } from '@nextcloud/l10n'
import { showWarning } from '@nextcloud/dialogs'

jest.mock('../../../../../src/fullcalendar/duration.js')
jest.mock('../../../../../src/services/timezoneDataProviderService.js')
jest.mock('../../../../../src/utils/calendarObject.js')
jest.mock('../../../../../src/store/calendars.js')
jest.mock('../../../../../src/store/calendarObjects.js')
jest.mock('../../../../../src/store/principals.js')
jest.mock('@nextcloud/l10n')
jest.mock('@nextcloud/dialogs')

describe('fullcalendar/eventDrop test suite', () => {

	beforeEach(() => {
		getDurationValueFromFullCalendarDuration.mockClear()
		getTimezoneManager.mockClear()
		getObjectAtRecurrenceId.mockClear()
		useCalendarsStore.mockClear()
		useCalendarObjectsStore.mockClear()
		usePrincipalsStore.mockClear()
		translate.mockClear()
		showWarning.mockClear()
	})

	it('should properly drop a non-recurring event', async () => {
		const calendarsStore = {
			getEventByObjectId: jest.fn(),
		}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const calendarObjectsStore = {
			updateCalendarObject: jest.fn(),
		}
		useCalendarObjectsStore.mockReturnValue(calendarObjectsStore)
		const principalsStore = {
			getCurrentUserPrincipalEmail: 'organizer@example.org',
		}
		usePrincipalsStore.mockReturnValue(principalsStore)

		const fcAPI = {
			getOption: jest.fn()
				.mockReturnValueOnce({ days: 1 })
				.mockReturnValueOnce({ hours: 2 })
				.mockReturnValueOnce('America/New_York'),
		}

		const event = {
			allDay: false,
			extendedProps: {
				objectId: 'object123',
				recurrenceId: '1573554842',
			},
		}
		const delta = {
			hours: 5,
		}
		const revert = jest.fn()

		getDurationValueFromFullCalendarDuration
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 5 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, days: 1 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 2 })

		const getTimezoneForId = jest.fn()
			.mockReturnValueOnce({ calendarJsTimezone: true, tzid: 'America/New_York' })
		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId,
			})

		const eventComponent = {
			shiftByDuration: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
			organizer: 'mailto:organizer@example.org',
			hasProperty: jest.fn().mockReturnValue(true),
			getFirstProperty: jest.fn().mockReturnValue({ value: 'mailto:organizer@example.org' }),
			getAttendeeIterator: jest.fn().mockReturnValue([]),
		}
		const calendarObject = {
			_isCalendarObject: true,
		}
		getObjectAtRecurrenceId
			.mockReturnValue(eventComponent)

		calendarsStore.getEventByObjectId.mockResolvedValueOnce(calendarObject)
		calendarObjectsStore.updateCalendarObject.mockResolvedValueOnce()

		const eventDropFunction = eventDrop(fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(useCalendarsStore).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenNthCalledWith(1, { objectId: 'object123' })

		expect(useCalendarObjectsStore).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.updateCalendarObject).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.updateCalendarObject).toHaveBeenNthCalledWith(1, { calendarObject })

		expect(usePrincipalsStore).toHaveBeenCalledTimes(1)

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(1)
		expect(eventComponent.shiftByDuration).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 }, false, { calendarJsTimezone: true, tzid: 'America/New_York' }, { calendarJsDurationValue: true, days: 1 }, { calendarJsDurationValue: true, hours: 2 })

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(1)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(0)
	})

	it('should properly drop a non-recurring event - unknown timezone', async () => {
		const calendarsStore = {
			getEventByObjectId: jest.fn(),
		}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const calendarObjectsStore = {
			updateCalendarObject: jest.fn(),
		}
		useCalendarObjectsStore.mockReturnValue(calendarObjectsStore)
		const fcAPI = {
			getOption: jest.fn()
				.mockReturnValueOnce({ days: 1 })
				.mockReturnValueOnce({ hours: 2 })
				.mockReturnValueOnce('America/New_York'),
		}
		const principalsStore = {
			getCurrentUserPrincipalEmail: 'organizer@example.org',
		}
		usePrincipalsStore.mockReturnValue(principalsStore)

		const event = {
			allDay: false,
			extendedProps: {
				objectId: 'object123',
				recurrenceId: '1573554842',
			},
		}
		const delta = {
			hours: 5,
		}
		const revert = jest.fn()

		getDurationValueFromFullCalendarDuration
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 5 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, days: 1 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 2 })

		const getTimezoneForId = jest.fn()
			.mockReturnValueOnce(null)
			.mockReturnValueOnce({ calendarJsTimezone: true, tzid: 'UTC' })
		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId,
			})

		const eventComponent = {
			shiftByDuration: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
			organizer: 'mailto:organizer@example.org',
			hasProperty: jest.fn().mockReturnValue(true),
			getFirstProperty: jest.fn().mockReturnValue({ value: 'mailto:organizer@example.org' }),
			getAttendeeIterator: jest.fn().mockReturnValue([]),
		}

		const calendarObject = {
			_isCalendarObject: true,
		}
		getObjectAtRecurrenceId
			.mockReturnValue(eventComponent)

		calendarsStore.getEventByObjectId.mockResolvedValueOnce(calendarObject)
		calendarObjectsStore.updateCalendarObject.mockResolvedValueOnce()

		const eventDropFunction = eventDrop(fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(getTimezoneForId).toHaveBeenCalledTimes(2)
		expect(getTimezoneForId).toHaveBeenNthCalledWith(1, 'America/New_York')
		expect(getTimezoneForId).toHaveBeenNthCalledWith(2, 'UTC')

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(useCalendarsStore).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenNthCalledWith(1, { objectId: 'object123' })

		expect(useCalendarObjectsStore).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.updateCalendarObject).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.updateCalendarObject).toHaveBeenNthCalledWith(1, { calendarObject })

		expect(usePrincipalsStore).toHaveBeenCalledTimes(1)

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(1)
		expect(eventComponent.shiftByDuration).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 }, false, { calendarJsTimezone: true, tzid: 'UTC' }, { calendarJsDurationValue: true, days: 1 }, { calendarJsDurationValue: true, hours: 2 })

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(1)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(0)
	})

	it('should properly drop a recurring event', async () => {
		const calendarsStore = {
			getEventByObjectId: jest.fn(),
		}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const calendarObjectsStore = {
			updateCalendarObject: jest.fn(),
		}
		useCalendarObjectsStore.mockReturnValue(calendarObjectsStore)
		const fcAPI = {
			getOption: jest.fn()
				.mockReturnValueOnce({ days: 1 })
				.mockReturnValueOnce({ hours: 2 })
				.mockReturnValueOnce('America/New_York'),
		}
		const principalsStore = {
			getCurrentUserPrincipalEmail: 'organizer@example.org',
		}
		usePrincipalsStore.mockReturnValue(principalsStore)

		const event = {
			allDay: false,
			extendedProps: {
				objectId: 'object123',
				recurrenceId: '1573554842',
			},
		}
		const delta = {
			hours: 5,
		}
		const revert = jest.fn()

		getDurationValueFromFullCalendarDuration
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 5 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, days: 1 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 2 })

		const getTimezoneForId = jest.fn()
			.mockReturnValueOnce({ calendarJsTimezone: true, tzid: 'America/New_York' })
		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId,
			})

		const eventComponent = {
			shiftByDuration: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(true),
			createRecurrenceException: jest.fn(),
			organizer: 'mailto:organizer@example.org',
			hasProperty: jest.fn().mockReturnValue(true),
			getFirstProperty: jest.fn().mockReturnValue({ value: 'mailto:organizer@example.org' }),
			getAttendeeIterator: jest.fn().mockReturnValue([]),
		}
		const calendarObject = {
			_isCalendarObject: true,
		}
		getObjectAtRecurrenceId
			.mockReturnValue(eventComponent)

		calendarsStore.getEventByObjectId.mockResolvedValueOnce(calendarObject)
		calendarObjectsStore.updateCalendarObject.mockResolvedValueOnce()

		const eventDropFunction = eventDrop(fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(useCalendarsStore).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenNthCalledWith(1, { objectId: 'object123' })

		expect(useCalendarObjectsStore).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.updateCalendarObject).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.updateCalendarObject).toHaveBeenNthCalledWith(1, { calendarObject })

		expect(usePrincipalsStore).toHaveBeenCalledTimes(1)

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(1)
		expect(eventComponent.shiftByDuration).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 }, false, { calendarJsTimezone: true, tzid: 'America/New_York' }, { calendarJsDurationValue: true, days: 1 }, { calendarJsDurationValue: true, hours: 2 })

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(1)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(1)
		expect(eventComponent.createRecurrenceException).toHaveBeenNthCalledWith(1)

		expect(revert).toHaveBeenCalledTimes(0)
	})

	it('should revert if delta duration could not be parsed', async () => {
		const calendarsStore = {}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const calendarObjectsStore = {}
		useCalendarObjectsStore.mockReturnValue(calendarObjectsStore)
		const fcAPI = {
			getOption: jest.fn()
				.mockReturnValueOnce({ days: 1 })
				.mockReturnValueOnce({ hours: 2 })
				.mockReturnValueOnce('America/New_York'),
		}
		const principalsStore = {
			getCurrentUserPrincipalEmail: 'organizer@example.org',
		}
		usePrincipalsStore.mockReturnValue(principalsStore)

		const event = {
			allDay: false,
			extendedProps: {
				objectId: 'object123',
				recurrenceId: '1573554842',
			},
		}
		const delta = {
			hours: 5,
		}
		const revert = jest.fn()

		getDurationValueFromFullCalendarDuration
			.mockReturnValueOnce(false)
			.mockReturnValueOnce({ calendarJsDurationValue: true, days: 1 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 2 })

		const getTimezoneForId = jest.fn()
			.mockReturnValueOnce({ calendarJsTimezone: true, tzid: 'America/New_York' })
		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId,
			})

		const eventComponent = {
			shiftByDuration: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
			organizer: 'mailto:organizer@example.org',
		}
		const calendarObject = {
			_isCalendarObject: true,
		}
		getObjectAtRecurrenceId
			.mockReturnValue(eventComponent)

		const eventDropFunction = eventDrop(fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(useCalendarsStore).toHaveBeenCalledTimes(1)
		expect(useCalendarObjectsStore).toHaveBeenCalledTimes(1)
		expect(usePrincipalsStore).toHaveBeenCalledTimes(1)

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(0)
		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(0)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert if default allday duration could not be parsed', async () => {
		const calendarsStore = {}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const calendarObjectsStore = {}
		useCalendarObjectsStore.mockReturnValue(calendarObjectsStore)
		const fcAPI = {
			getOption: jest.fn()
				.mockReturnValueOnce({ days: 1 })
				.mockReturnValueOnce({ hours: 2 })
				.mockReturnValueOnce('America/New_York'),
		}
		const principalsStore = {
			getCurrentUserPrincipalEmail: 'organizer@example.org',
		}
		usePrincipalsStore.mockReturnValue(principalsStore)

		const event = {
			allDay: false,
			extendedProps: {
				objectId: 'object123',
				recurrenceId: '1573554842',
			},
		}
		const delta = {
			hours: 5,
		}
		const revert = jest.fn()

		getDurationValueFromFullCalendarDuration
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 5 })
			.mockReturnValueOnce(false)
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 2 })

		const getTimezoneForId = jest.fn()
			.mockReturnValueOnce({ calendarJsTimezone: true, tzid: 'America/New_York' })
		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId,
			})

		const eventComponent = {
			shiftByDuration: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
			organizer: 'mailto:organizer@example.org',
		}
		const calendarObject = {
			_isCalendarObject: true,
		}
		getObjectAtRecurrenceId
			.mockReturnValue(eventComponent)

		const eventDropFunction = eventDrop(fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(useCalendarsStore).toHaveBeenCalledTimes(1)
		expect(useCalendarObjectsStore).toHaveBeenCalledTimes(1)
		expect(usePrincipalsStore).toHaveBeenCalledTimes(1)

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(0)
		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(0)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert if default timed duration could not be parsed', async () => {
		const calendarsStore = {}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const calendarObjectsStore = {}
		useCalendarObjectsStore.mockReturnValue(calendarObjectsStore)
		const fcAPI = {
			getOption: jest.fn()
				.mockReturnValueOnce({ days: 1 })
				.mockReturnValueOnce({ hours: 2 })
				.mockReturnValueOnce('America/New_York'),
		}
		const principalsStore = {
			getCurrentUserPrincipalEmail: 'organizer@example.org',
		}
		usePrincipalsStore.mockReturnValue(principalsStore)

		const event = {
			allDay: false,
			extendedProps: {
				objectId: 'object123',
				recurrenceId: '1573554842',
			},
		}
		const delta = {
			hours: 5,
		}
		const revert = jest.fn()

		getDurationValueFromFullCalendarDuration
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 1 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, days: 1 })
			.mockReturnValueOnce(false)

		const getTimezoneForId = jest.fn()
			.mockReturnValueOnce({ calendarJsTimezone: true, tzid: 'America/New_York' })
		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId,
			})

		const eventComponent = {
			shiftByDuration: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
			organizer: 'mailto:organizer@example.org',
		}
		const calendarObject = {
			_isCalendarObject: true,
		}
		getObjectAtRecurrenceId
			.mockReturnValue(eventComponent)

		const eventDropFunction = eventDrop(fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(useCalendarsStore).toHaveBeenCalledTimes(1)
		expect(useCalendarObjectsStore).toHaveBeenCalledTimes(1)
		expect(usePrincipalsStore).toHaveBeenCalledTimes(1)

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(0)
		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(0)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert the action when the object was not found', async () => {
		const calendarsStore = {
			getEventByObjectId: jest.fn(),
		}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const calendarObjectsStore = {}
		useCalendarObjectsStore.mockReturnValue(calendarObjectsStore)
		const fcAPI = {
			getOption: jest.fn()
				.mockReturnValueOnce({ days: 1 })
				.mockReturnValueOnce({ hours: 2 })
				.mockReturnValueOnce('America/New_York'),
		}
		const principalsStore = {
			getCurrentUserPrincipalEmail: 'organizer@example.org',
		}
		usePrincipalsStore.mockReturnValue(principalsStore)

		const event = {
			allDay: false,
			extendedProps: {
				objectId: 'object123',
				recurrenceId: '1573554842',
			},
		}
		const delta = {
			hours: 5,
		}
		const revert = jest.fn()

		getDurationValueFromFullCalendarDuration
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 5 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, days: 1 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 2 })

		const getTimezoneForId = jest.fn()
			.mockReturnValueOnce({ calendarJsTimezone: true, tzid: 'America/New_York' })
		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId,
			})

		const eventComponent = {
			shiftByDuration: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
			organizer: 'mailto:organizer@example.org',
		}
		const calendarObject = {
			_isCalendarObject: true,
		}
		getObjectAtRecurrenceId
			.mockReturnValue(eventComponent)

		calendarsStore.getEventByObjectId
			.mockRejectedValueOnce({ message: 'error message' })

		const eventDropFunction = eventDrop(fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(useCalendarsStore).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenNthCalledWith(1, { objectId: 'object123' })

		expect(useCalendarObjectsStore).toHaveBeenCalledTimes(1)

		expect(usePrincipalsStore).toHaveBeenCalledTimes(1)

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(0)
		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(0)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert the action when the recurrence was not found', async () => {
		const calendarsStore = {
			getEventByObjectId: jest.fn(),
		}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const calendarObjectsStore = {}
		useCalendarObjectsStore.mockReturnValue(calendarObjectsStore)
		const principalsStore = {
			getCurrentUserPrincipalEmail: 'organizer@example.org',
		}
		usePrincipalsStore.mockReturnValue(principalsStore)
		const fcAPI = {
			getOption: jest.fn()
				.mockReturnValueOnce({ days: 1 })
				.mockReturnValueOnce({ hours: 2 })
				.mockReturnValueOnce('America/New_York'),
		}

		const event = {
			allDay: false,
			extendedProps: {
				objectId: 'object123',
				recurrenceId: '1573554842',
			},
		}
		const delta = {
			hours: 5,
		}
		const revert = jest.fn()

		getDurationValueFromFullCalendarDuration
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 5 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, days: 1 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 2 })

		const getTimezoneForId = jest.fn()
			.mockReturnValueOnce({ calendarJsTimezone: true, tzid: 'America/New_York' })
		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId,
			})

		const calendarObject = {
			_isCalendarObject: true,
		}
		getObjectAtRecurrenceId
			.mockReturnValue(null)

		calendarsStore.getEventByObjectId.mockResolvedValueOnce(calendarObject)

		const eventDropFunction = eventDrop(fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(useCalendarsStore).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenNthCalledWith(1, { objectId: 'object123' })

		expect(useCalendarObjectsStore).toHaveBeenCalledTimes(1)

		expect(usePrincipalsStore).toHaveBeenCalledTimes(1)

		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert the action when shiftByDuration throws an exception', async () => {
		const calendarsStore = {
			getEventByObjectId: jest.fn(),
		}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const calendarObjectsStore = {
			resetCalendarObjectToDavMutation: jest.fn(),
		}
		useCalendarObjectsStore.mockReturnValue(calendarObjectsStore)
		const principalsStore = {
			getCurrentUserPrincipalEmail: 'organizer@example.org',
		}
		usePrincipalsStore.mockReturnValue(principalsStore)
		const fcAPI = {
			getOption: jest.fn()
				.mockReturnValueOnce({ days: 1 })
				.mockReturnValueOnce({ hours: 2 })
				.mockReturnValueOnce('America/New_York'),
		}

		const event = {
			allDay: false,
			extendedProps: {
				objectId: 'object123',
				recurrenceId: '1573554842',
			},
		}
		const delta = {
			hours: 5,
		}
		const revert = jest.fn()

		getDurationValueFromFullCalendarDuration
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 5 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, days: 1 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 2 })

		const getTimezoneForId = jest.fn()
			.mockReturnValueOnce({ calendarJsTimezone: true, tzid: 'America/New_York' })
		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId,
			})

		const eventComponent = {
			shiftByDuration: jest.fn().mockImplementation(() => {
				throw new Error()
			}),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
			organizer: 'mailto:organizer@example.org',
			hasProperty: jest.fn().mockReturnValue(true),
			getFirstProperty: jest.fn().mockReturnValue({ value: 'mailto:organizer@example.org' }),
  getAttendeeIterator: jest.fn().mockReturnValue([]),
		}
		const calendarObject = {
			_isCalendarObject: true,
		}
		getObjectAtRecurrenceId
			.mockReturnValue(eventComponent)

		calendarsStore.getEventByObjectId.mockResolvedValueOnce(calendarObject)
		calendarObjectsStore.resetCalendarObjectToDavMutation.mockReturnValueOnce()

		const eventDropFunction = eventDrop(fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(useCalendarsStore).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenNthCalledWith(1, { objectId: 'object123' })

		expect(useCalendarObjectsStore).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.resetCalendarObjectToDavMutation).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.resetCalendarObjectToDavMutation).toHaveBeenNthCalledWith(1, { calendarObject })
		expect(usePrincipalsStore).toHaveBeenCalledTimes(1)

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(1)
		expect(eventComponent.shiftByDuration).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 }, false, { calendarJsTimezone: true, tzid: 'America/New_York' }, { calendarJsDurationValue: true, days: 1 }, { calendarJsDurationValue: true, hours: 2 })

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(0)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert the action when there was an error updating the event', async () => {
		const calendarsStore = {
			getEventByObjectId: jest.fn(),
		}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const calendarObjectsStore = {
			updateCalendarObject: jest.fn(),
			resetCalendarObjectToDavMutation: jest.fn(),
		}
		useCalendarObjectsStore.mockReturnValue(calendarObjectsStore)
		const principalsStore = {
			getCurrentUserPrincipalEmail: 'organizer@example.org',
		}
		usePrincipalsStore.mockReturnValue(principalsStore)
		const fcAPI = {
			getOption: jest.fn()
				.mockReturnValueOnce({ days: 1 })
				.mockReturnValueOnce({ hours: 2 })
				.mockReturnValueOnce('America/New_York'),
		}

		const event = {
			allDay: false,
			extendedProps: {
				objectId: 'object123',
				recurrenceId: '1573554842',
			},
		}
		const delta = {
			hours: 5,
		}
		const revert = jest.fn()

		getDurationValueFromFullCalendarDuration
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 5 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, days: 1 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 2 })

		const getTimezoneForId = jest.fn()
			.mockReturnValueOnce({ calendarJsTimezone: true, tzid: 'America/New_York' })
		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId,
			})

		const eventComponent = {
			shiftByDuration: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
			organizer: 'mailto:organizer@example.org',
			hasProperty: jest.fn().mockReturnValue(true),
			getFirstProperty: jest.fn().mockReturnValue({ value: 'mailto:organizer@example.org' }),
  getAttendeeIterator: jest.fn().mockReturnValue([]),
		}
		const calendarObject = {
			_isCalendarObject: true,
		}
		getObjectAtRecurrenceId
			.mockReturnValue(eventComponent)

		calendarsStore.getEventByObjectId.mockResolvedValueOnce(calendarObject)
		calendarObjectsStore.updateCalendarObject.mockRejectedValueOnce(new Error())
		calendarObjectsStore.resetCalendarObjectToDavMutation.mockReturnValueOnce()

		const eventDropFunction = eventDrop(fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(useCalendarsStore).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenNthCalledWith(1, { objectId: 'object123' })

		expect(useCalendarObjectsStore).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.updateCalendarObject).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.updateCalendarObject).toHaveBeenNthCalledWith(1, { calendarObject })
		expect(calendarObjectsStore.resetCalendarObjectToDavMutation).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.resetCalendarObjectToDavMutation).toHaveBeenNthCalledWith(1, { calendarObject })

		expect(usePrincipalsStore).toHaveBeenCalledTimes(1)

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(1)
		expect(eventComponent.shiftByDuration).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 }, false, { calendarJsTimezone: true, tzid: 'America/New_York' }, { calendarJsDurationValue: true, days: 1 }, { calendarJsDurationValue: true, hours: 2 })

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(1)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert the action when current user is an attendee', async () => {
		const calendarsStore = {
			getEventByObjectId: jest.fn(),
		}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const calendarObjectsStore = {
			updateCalendarObject: jest.fn(),
		}
		useCalendarObjectsStore.mockReturnValue(calendarObjectsStore)
		const principalsStore = {
			getCurrentUserPrincipalEmail: 'attendee@example.com',
		}
		usePrincipalsStore.mockReturnValue(principalsStore)

		const fcAPI = {
			getOption: jest.fn()
				.mockReturnValueOnce({ days: 1 })
				.mockReturnValueOnce({ hours: 2 })
				.mockReturnValueOnce('America/New_York'),
		}

		const event = {
			allDay: false,
			extendedProps: {
				objectId: 'object123',
				recurrenceId: '1573554842',
			},
		}
		const delta = {
			hours: 5,
		}
		const revert = jest.fn()

		translate
			.mockReturnValue('translated message')

		getDurationValueFromFullCalendarDuration
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 5 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, days: 1 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 2 })

		const getTimezoneForId = jest.fn()
			.mockReturnValueOnce({ calendarJsTimezone: true, tzid: 'America/New_York' })
		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId,
			})

		const eventComponent = {
			shiftByDuration: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
			organizer: 'mailto:organizer@example.org',

		}
		const calendarObject = {
			_isCalendarObject: true,
		}
		getObjectAtRecurrenceId
			.mockReturnValue(eventComponent)

		calendarsStore.getEventByObjectId.mockResolvedValueOnce(calendarObject)
		calendarObjectsStore.updateCalendarObject.mockResolvedValueOnce()

		const eventDropFunction = eventDrop(fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(useCalendarsStore).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenNthCalledWith(1, { objectId: 'object123' })

		expect(useCalendarObjectsStore).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.updateCalendarObject).toHaveBeenCalledTimes(0)

		expect(usePrincipalsStore).toHaveBeenCalledTimes(1)

		expect(translate).toHaveBeenCalledTimes(1)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'You are not allowed to edit this event as an attendee.')

		expect(showWarning).toHaveBeenCalledTimes(1)
		expect(showWarning).toHaveBeenNthCalledWith(1, 'translated message')

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(0)

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(0)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(1)
	})
})
