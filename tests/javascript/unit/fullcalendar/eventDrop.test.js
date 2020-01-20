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
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import eventDrop from "../../../../src/fullcalendar/eventDrop.js";
import { getDurationValueFromFullCalendarDuration} from "../../../../src/fullcalendar/duration.js";
import getTimezoneManager from '../../../../src/services/timezoneDataProviderService.js'

jest.mock("../../../../src/fullcalendar/duration.js")
jest.mock('../../../../src/services/timezoneDataProviderService.js')

describe('fullcalendar/eventDrop test suite', () => {

	beforeEach(() => {
		getDurationValueFromFullCalendarDuration.mockClear()
		getTimezoneManager.mockClear()
	})

	it('should properly drop a non-recurring event', async () => {
		const store = {
			dispatch: jest.fn()
		}
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
				recurrenceId: '1573554842'
			}
		}
		const delta = {
			hours: 5
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
				getTimezoneForId
			})

		const eventComponent = {
			shiftByDuration: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
		}
		const calendarObject = {
			getObjectAtRecurrenceId: jest.fn().mockReturnValueOnce(eventComponent),
			resetToDav: jest.fn()
		}

		store.dispatch.mockResolvedValueOnce(calendarObject) // getEventByObjectId
		store.dispatch.mockResolvedValueOnce() // updateCalendarObject

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1})
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.dispatch).toHaveBeenCalledTimes(2)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getEventByObjectId', { objectId: 'object123' })
		expect(store.dispatch).toHaveBeenNthCalledWith(2, 'updateCalendarObject', { calendarObject })

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(1)
		expect(eventComponent.shiftByDuration).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 }, false, { calendarJsTimezone: true, tzid: 'America/New_York' }, { calendarJsDurationValue: true, days: 1 }, { calendarJsDurationValue: true, hours: 2 })

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(1)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(calendarObject.resetToDav).toHaveBeenCalledTimes(0)
		expect(revert).toHaveBeenCalledTimes(0)
	})

	it('should properly drop a non-recurring event - unknown timezone', async () => {
		const store = {
			dispatch: jest.fn()
		}
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
				recurrenceId: '1573554842'
			}
		}
		const delta = {
			hours: 5
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
				getTimezoneForId
			})

		const eventComponent = {
			shiftByDuration: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
		}
		const calendarObject = {
			getObjectAtRecurrenceId: jest.fn().mockReturnValueOnce(eventComponent),
			resetToDav: jest.fn()
		}

		store.dispatch.mockResolvedValueOnce(calendarObject) // getEventByObjectId
		store.dispatch.mockResolvedValueOnce() // updateCalendarObject

		const eventDropFunction = eventDrop(store, fcAPI)
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
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1})
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.dispatch).toHaveBeenCalledTimes(2)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getEventByObjectId', { objectId: 'object123' })
		expect(store.dispatch).toHaveBeenNthCalledWith(2, 'updateCalendarObject', { calendarObject })

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(1)
		expect(eventComponent.shiftByDuration).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 }, false, { calendarJsTimezone: true, tzid: 'UTC' }, { calendarJsDurationValue: true, days: 1 }, { calendarJsDurationValue: true, hours: 2 })

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(1)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(calendarObject.resetToDav).toHaveBeenCalledTimes(0)
		expect(revert).toHaveBeenCalledTimes(0)
	})

	it('should properly drop a recurring event', async () => {
		const store = {
			dispatch: jest.fn()
		}
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
				recurrenceId: '1573554842'
			}
		}
		const delta = {
			hours: 5
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
				getTimezoneForId
			})

		const eventComponent = {
			shiftByDuration: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(true),
			createRecurrenceException: jest.fn(),
		}
		const calendarObject = {
			getObjectAtRecurrenceId: jest.fn().mockReturnValueOnce(eventComponent),
			resetToDav: jest.fn()
		}

		store.dispatch.mockResolvedValueOnce(calendarObject) // getEventByObjectId
		store.dispatch.mockResolvedValueOnce() // updateCalendarObject

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1})
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.dispatch).toHaveBeenCalledTimes(2)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getEventByObjectId', { objectId: 'object123' })
		expect(store.dispatch).toHaveBeenNthCalledWith(2, 'updateCalendarObject', { calendarObject })

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(1)
		expect(eventComponent.shiftByDuration).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 }, false, { calendarJsTimezone: true, tzid: 'America/New_York' }, { calendarJsDurationValue: true, days: 1 }, { calendarJsDurationValue: true, hours: 2 })

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(1)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(1)
		expect(eventComponent.createRecurrenceException).toHaveBeenNthCalledWith(1)

		expect(calendarObject.resetToDav).toHaveBeenCalledTimes(0)
		expect(revert).toHaveBeenCalledTimes(0)
	})

	it('should revert if delta duration could not be parsed', async () => {
		const store = {
			dispatch: jest.fn()
		}
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
				recurrenceId: '1573554842'
			}
		}
		const delta = {
			hours: 5
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
				getTimezoneForId
			})

		const eventComponent = {
			shiftByDuration: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
		}
		const calendarObject = {
			getObjectAtRecurrenceId: jest.fn().mockReturnValueOnce(eventComponent),
			resetToDav: jest.fn()
		}

		store.dispatch.mockResolvedValueOnce(calendarObject) // getEventByObjectId
		store.dispatch.mockResolvedValueOnce() // updateCalendarObject

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1})
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.dispatch).toHaveBeenCalledTimes(0)

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(0)
		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(0)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(calendarObject.resetToDav).toHaveBeenCalledTimes(0)
		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert if default allday duration could not be parsed', async () => {
		const store = {
			dispatch: jest.fn()
		}
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
				recurrenceId: '1573554842'
			}
		}
		const delta = {
			hours: 5
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
				getTimezoneForId
			})

		const eventComponent = {
			shiftByDuration: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
		}
		const calendarObject = {
			getObjectAtRecurrenceId: jest.fn().mockReturnValueOnce(eventComponent),
			resetToDav: jest.fn()
		}

		store.dispatch.mockResolvedValueOnce(calendarObject) // getEventByObjectId
		store.dispatch.mockResolvedValueOnce() // updateCalendarObject

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1})
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.dispatch).toHaveBeenCalledTimes(0)

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(0)
		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(0)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(calendarObject.resetToDav).toHaveBeenCalledTimes(0)
		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert if default timed duration could not be parsed', async () => {
		const store = {
			dispatch: jest.fn()
		}
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
				recurrenceId: '1573554842'
			}
		}
		const delta = {
			hours: 5
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
				getTimezoneForId
			})

		const eventComponent = {
			shiftByDuration: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
		}
		const calendarObject = {
			getObjectAtRecurrenceId: jest.fn().mockReturnValueOnce(eventComponent),
			resetToDav: jest.fn()
		}

		store.dispatch.mockResolvedValueOnce(calendarObject) // getEventByObjectId
		store.dispatch.mockResolvedValueOnce() // updateCalendarObject

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1})
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.dispatch).toHaveBeenCalledTimes(0)

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(0)
		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(0)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(calendarObject.resetToDav).toHaveBeenCalledTimes(0)
		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert the action when the object was not found', async () => {
		const store = {
			dispatch: jest.fn()
		}
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
				recurrenceId: '1573554842'
			}
		}
		const delta = {
			hours: 5
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
				getTimezoneForId
			})

		const eventComponent = {
			shiftByDuration: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
		}
		const calendarObject = {
			getObjectAtRecurrenceId: jest.fn().mockReturnValueOnce(eventComponent),
			resetToDav: jest.fn()
		}

		store.dispatch.mockRejectedValueOnce({ message: 'error message' }) // getEventByObjectId

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1})
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.dispatch).toHaveBeenCalledTimes(1)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getEventByObjectId', { objectId: 'object123' })

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(0)
		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(0)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(calendarObject.resetToDav).toHaveBeenCalledTimes(0)
		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert the action when the recurrence was not found', async () => {
		const store = {
			dispatch: jest.fn()
		}
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
				recurrenceId: '1573554842'
			}
		}
		const delta = {
			hours: 5
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
				getTimezoneForId
			})

		const calendarObject = {
			getObjectAtRecurrenceId: jest.fn().mockReturnValueOnce(null),
			resetToDav: jest.fn()
		}

		store.dispatch.mockResolvedValueOnce(calendarObject) // getEventByObjectId
		store.dispatch.mockResolvedValueOnce() // updateCalendarObject

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1})
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.dispatch).toHaveBeenCalledTimes(1)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getEventByObjectId', { objectId: 'object123' })

		expect(calendarObject.resetToDav).toHaveBeenCalledTimes(0)
		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert the action when shiftByDuration throws an exception', async () => {
		const store = {
			dispatch: jest.fn()
		}
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
				recurrenceId: '1573554842'
			}
		}
		const delta = {
			hours: 5
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
				getTimezoneForId
			})

		const eventComponent = {
			shiftByDuration: jest.fn().mockImplementation(() => {
				throw new Error();
			}),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
		}
		const calendarObject = {
			getObjectAtRecurrenceId: jest.fn().mockReturnValueOnce(eventComponent),
			resetToDav: jest.fn()
		}

		store.dispatch.mockResolvedValueOnce(calendarObject) // getEventByObjectId
		store.dispatch.mockResolvedValueOnce() // updateCalendarObject

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1})
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.dispatch).toHaveBeenCalledTimes(1)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getEventByObjectId', { objectId: 'object123' })

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(1)
		expect(eventComponent.shiftByDuration).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 }, false, { calendarJsTimezone: true, tzid: 'America/New_York' }, { calendarJsDurationValue: true, days: 1 }, { calendarJsDurationValue: true, hours: 2 })

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(0)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(calendarObject.resetToDav).toHaveBeenCalledTimes(1)
		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert the action when there was an error updating the event', async () => {
		const store = {
			dispatch: jest.fn()
		}
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
				recurrenceId: '1573554842'
			}
		}
		const delta = {
			hours: 5
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
				getTimezoneForId
			})

		const eventComponent = {
			shiftByDuration: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
		}
		const calendarObject = {
			getObjectAtRecurrenceId: jest.fn().mockReturnValueOnce(eventComponent),
			resetToDav: jest.fn()
		}

		store.dispatch.mockResolvedValueOnce(calendarObject) // getEventByObjectId
		store.dispatch.mockImplementationOnce(() => {
			throw new Error()
		}) // updateCalendarObject

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1})
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.dispatch).toHaveBeenCalledTimes(2)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getEventByObjectId', { objectId: 'object123' })
		expect(store.dispatch).toHaveBeenNthCalledWith(2, 'updateCalendarObject', { calendarObject })

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(1)
		expect(eventComponent.shiftByDuration).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 }, false, { calendarJsTimezone: true, tzid: 'America/New_York' }, { calendarJsDurationValue: true, days: 1 }, { calendarJsDurationValue: true, hours: 2 })

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(1)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(calendarObject.resetToDav).toHaveBeenCalledTimes(1)
		expect(revert).toHaveBeenCalledTimes(1)
	})
})
