/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @author Richard Steinmetz <richard@steinmetz.cloud>
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
import eventDrop from '../../../../../src/fullcalendar/interaction/eventDrop.js'
import { getDurationValueFromFullCalendarDuration } from '../../../../../src/fullcalendar/duration.js'
import getTimezoneManager from '../../../../../src/services/timezoneDataProviderService.js'

jest.mock('../../../../../src/fullcalendar/duration.js')
jest.mock('../../../../../src/services/timezoneDataProviderService.js')

describe('fullcalendar/eventDrop test suite', () => {

	beforeEach(() => {
		getDurationValueFromFullCalendarDuration.mockClear()
		getTimezoneManager.mockClear()
	})

	it('should properly drop a non-recurring event', async () => {
		const store = {
			commit: jest.fn(),
			dispatch: jest.fn(),
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
			isPartOfRecurrenceSet: jest.fn().mockReturnValue(false),
			primaryItem: null,
		}

		const calendarObjectInstance = {
			eventComponent,
		}

		const calendarObject = {
			_isCalendarObject: true,
			calendarObjectInstance,
			calendarId: '42',
		}

		store.dispatch.mockResolvedValueOnce({ calendarObject, calendarObjectInstance }) // getCalendarObjectInstanceByObjectIdAndRecurrenceId
		store.dispatch.mockResolvedValueOnce() // saveCalendarObjectInstance

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.commit).toHaveBeenCalledTimes(1)
		expect(store.commit).toHaveBeenNthCalledWith(1, 'resetCalendarObjectInstanceObjectIdAndRecurrenceId')

		expect(store.dispatch).toHaveBeenCalledTimes(2)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getCalendarObjectInstanceByObjectIdAndRecurrenceId', { objectId: 'object123', recurrenceId: '1573554842' })
		expect(store.dispatch).toHaveBeenNthCalledWith(2, 'saveCalendarObjectInstance', { thisAndAllFuture: false, calendarId: '42' })

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(1)
		expect(eventComponent.shiftByDuration).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 }, false, { calendarJsTimezone: true, tzid: 'America/New_York' }, { calendarJsDurationValue: true, days: 1 }, { calendarJsDurationValue: true, hours: 2 })

		expect(eventComponent.isPartOfRecurrenceSet).toHaveBeenCalledTimes(1)
		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(0)
	})

	it('should properly drop a non-recurring event - unknown timezone', async () => {
		const store = {
			commit: jest.fn(),
			dispatch: jest.fn(),
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
			isPartOfRecurrenceSet: jest.fn().mockReturnValue(false),
			primaryItem: null,
		}

		const calendarObjectInstance = {
			eventComponent,
		}

		const calendarObject = {
			_isCalendarObject: true,
			calendarObjectInstance,
			calendarId: '42',
		}

		store.dispatch.mockResolvedValueOnce({ calendarObject, calendarObjectInstance }) // getCalendarObjectInstanceByObjectIdAndRecurrenceId
		store.dispatch.mockResolvedValueOnce() // saveCalendarObject

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
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.commit).toHaveBeenCalledTimes(1)
		expect(store.commit).toHaveBeenNthCalledWith(1, 'resetCalendarObjectInstanceObjectIdAndRecurrenceId')

		expect(store.dispatch).toHaveBeenCalledTimes(2)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getCalendarObjectInstanceByObjectIdAndRecurrenceId', { objectId: 'object123', recurrenceId: '1573554842' })
		expect(store.dispatch).toHaveBeenNthCalledWith(2, 'saveCalendarObjectInstance', { thisAndAllFuture: false, calendarId: '42' })

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(1)
		expect(eventComponent.shiftByDuration).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 }, false, { calendarJsTimezone: true, tzid: 'UTC' }, { calendarJsDurationValue: true, days: 1 }, { calendarJsDurationValue: true, hours: 2 })

		expect(eventComponent.isPartOfRecurrenceSet).toHaveBeenCalledTimes(1)
		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(0)
	})

	it('should properly drop a recurring event', async () => {
		const store = {
			commit: jest.fn(),
			dispatch: jest.fn(),
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
			isPartOfRecurrenceSet: jest.fn().mockReturnValue(true),
		}

		const calendarObjectInstance = {
			eventComponent,
		}

		const calendarObject = {
			_isCalendarObject: true,
			calendarObjectInstance,
			calendarId: '42',
		}

		store.dispatch.mockResolvedValueOnce({ calendarObject, calendarObjectInstance }) // getCalendarObjectInstanceByObjectIdAndRecurrenceIds
		store.dispatch.mockResolvedValueOnce(true) // showDragRecurrenceModal
		store.dispatch.mockResolvedValueOnce() // saveCalendarObjectInstance

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.commit).toHaveBeenCalledTimes(1)
		expect(store.commit).toHaveBeenNthCalledWith(1, 'resetCalendarObjectInstanceObjectIdAndRecurrenceId')

		expect(store.dispatch).toHaveBeenCalledTimes(3)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getCalendarObjectInstanceByObjectIdAndRecurrenceId', { objectId: 'object123', recurrenceId: '1573554842' })
		expect(store.dispatch).toHaveBeenNthCalledWith(2, 'showDragRecurrenceModal', { eventComponent })
		expect(store.dispatch).toHaveBeenNthCalledWith(3, 'saveCalendarObjectInstance', { calendarId: '42', thisAndAllFuture: true })

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(1)
		expect(eventComponent.shiftByDuration).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 }, false, { calendarJsTimezone: true, tzid: 'America/New_York' }, { calendarJsDurationValue: true, days: 1 }, { calendarJsDurationValue: true, hours: 2 })

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(1)
		expect(eventComponent.isPartOfRecurrenceSet).toHaveBeenCalledTimes(1)

		expect(revert).toHaveBeenCalledTimes(0)
	})

	it('should revert if delta duration could not be parsed', async () => {
		const store = {}
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
			.mockReturnValueOnce(false)
			.mockReturnValueOnce({ calendarJsDurationValue: true, days: 1 })
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 2 })

		const getTimezoneForId = jest.fn()
			.mockReturnValueOnce({ calendarJsTimezone: true, tzid: 'America/New_York' })
		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId,
			})

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert if default allday duration could not be parsed', async () => {
		const store = {}
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
			.mockReturnValueOnce(false)
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 2 })

		const getTimezoneForId = jest.fn()
			.mockReturnValueOnce({ calendarJsTimezone: true, tzid: 'America/New_York' })
		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId,
			})

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert if default timed duration could not be parsed', async () => {
		const store = {
			dispatch: jest.fn(),
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

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.dispatch).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert the action when the recurrence was not found', async () => {
		const store = {
			commit: jest.fn(),
			dispatch: jest.fn(),
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

		store.dispatch.mockImplementationOnce(() => {
			throw new Error('Recurrence was not found')
		}) // getCalendarObjectInstanceByObjectIdAndRecurrenceId

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.commit).toHaveBeenCalledTimes(1)
		expect(store.commit).toHaveBeenNthCalledWith(1, 'resetCalendarObjectInstanceObjectIdAndRecurrenceId')

		expect(store.dispatch).toHaveBeenCalledTimes(1)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getCalendarObjectInstanceByObjectIdAndRecurrenceId', { objectId: 'object123', recurrenceId: '1573554842' })

		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert the action when shiftByDuration throws an exception', async () => {
		const store = {
			commit: jest.fn(),
			dispatch: jest.fn(),
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
				throw new Error('Failed to shift event')
			}),
		}
		const calendarObjectInstance = {
			eventComponent,
		}
		const calendarObject = {
			_isCalendarObject: true,
			calendarObjectInstance,
		}

		store.dispatch.mockResolvedValueOnce({ calendarObject, calendarObjectInstance }) // getCalendarObjectInstanceByObjectIdAndRecurrenceId

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.commit).toHaveBeenCalledTimes(2)
		expect(store.commit).toHaveBeenNthCalledWith(1, 'resetCalendarObjectToDav', { calendarObject })
		expect(store.commit).toHaveBeenNthCalledWith(2, 'resetCalendarObjectInstanceObjectIdAndRecurrenceId')

		expect(store.dispatch).toHaveBeenCalledTimes(1)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getCalendarObjectInstanceByObjectIdAndRecurrenceId', { objectId: 'object123', recurrenceId: '1573554842' })

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(1)
		expect(eventComponent.shiftByDuration).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 }, false, { calendarJsTimezone: true, tzid: 'America/New_York' }, { calendarJsDurationValue: true, days: 1 }, { calendarJsDurationValue: true, hours: 2 })

		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert the action when there was an error updating the event', async () => {
		const store = {
			commit: jest.fn(),
			dispatch: jest.fn(),
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
			isPartOfRecurrenceSet: jest.fn().mockReturnValue(false),
		}
		const calendarObjectInstance = {
			eventComponent,
		}
		const calendarObject = {
			_isCalendarObject: true,
			calendarObjectInstance,
			calendarId: '42',
		}

		store.dispatch.mockResolvedValueOnce({ calendarObject, calendarObjectInstance }) // getCalendarObjectInstanceByObjectIdAndRecurrenceId
		store.dispatch.mockImplementationOnce(() => {
			throw new Error()
		}) // updateCalendarObjectInstance

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.commit).toHaveBeenCalledTimes(2)
		expect(store.commit).toHaveBeenNthCalledWith(1, 'resetCalendarObjectToDav', { calendarObject })
		expect(store.commit).toHaveBeenNthCalledWith(2, 'resetCalendarObjectInstanceObjectIdAndRecurrenceId')

		expect(store.dispatch).toHaveBeenCalledTimes(2)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getCalendarObjectInstanceByObjectIdAndRecurrenceId', { objectId: 'object123', recurrenceId: '1573554842' })
		expect(store.dispatch).toHaveBeenNthCalledWith(2, 'saveCalendarObjectInstance', { calendarId: '42', thisAndAllFuture: false })

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(1)
		expect(eventComponent.shiftByDuration).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 }, false, { calendarJsTimezone: true, tzid: 'America/New_York' }, { calendarJsDurationValue: true, days: 1 }, { calendarJsDurationValue: true, hours: 2 })

		expect(eventComponent.isPartOfRecurrenceSet).toHaveBeenCalledTimes(1)
		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert the action when the user closes the modal', async () => {
		const store = {
			commit: jest.fn(),
			dispatch: jest.fn(),
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
			isPartOfRecurrenceSet: jest.fn().mockReturnValue(true),
		}
		const calendarObjectInstance = {
			eventComponent,
		}
		const calendarObject = {
			_isCalendarObject: true,
			calendarObjectInstance,
			calendarId: '42',
		}

		store.dispatch.mockResolvedValueOnce({ calendarObject, calendarObjectInstance }) // getCalendarObjectInstanceByObjectIdAndRecurrenceId
		store.dispatch.mockImplementationOnce(() => {
			throw new Error('closedByUser')
		}) // showDragRecurrenceModal

		const eventDropFunction = eventDrop(store, fcAPI)
		await eventDropFunction({ event, delta, revert })

		expect(fcAPI.getOption).toHaveBeenCalledTimes(3)
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(1, 'defaultAllDayEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(2, 'defaultTimedEventDuration')
		expect(fcAPI.getOption).toHaveBeenNthCalledWith(3, 'timeZone')

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(3)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, delta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, { days: 1 })
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(3, { hours: 2 })

		expect(store.commit).toHaveBeenCalledTimes(2)
		expect(store.commit).toHaveBeenNthCalledWith(1, 'resetCalendarObjectToDav', { calendarObject })
		expect(store.commit).toHaveBeenNthCalledWith(2, 'resetCalendarObjectInstanceObjectIdAndRecurrenceId')

		expect(store.dispatch).toHaveBeenCalledTimes(2)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getCalendarObjectInstanceByObjectIdAndRecurrenceId', { objectId: 'object123', recurrenceId: '1573554842' })
		expect(store.dispatch).toHaveBeenNthCalledWith(2, 'showDragRecurrenceModal', { eventComponent })

		expect(eventComponent.shiftByDuration).toHaveBeenCalledTimes(1)
		expect(eventComponent.shiftByDuration).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 }, false, { calendarJsTimezone: true, tzid: 'America/New_York' }, { calendarJsDurationValue: true, days: 1 }, { calendarJsDurationValue: true, hours: 2 })

		expect(eventComponent.isPartOfRecurrenceSet).toHaveBeenCalledTimes(1)
		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(1)

		expect(revert).toHaveBeenCalledTimes(1)
	})
})
