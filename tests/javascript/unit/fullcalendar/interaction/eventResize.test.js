/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import eventResize from "../../../../../src/fullcalendar/interaction/eventResize.js";

import { getDurationValueFromFullCalendarDuration} from '../../../../../src/fullcalendar/duration.js'
import {getObjectAtRecurrenceId} from "../../../../../src/utils/calendarObject.js";
jest.mock('../../../../../src/fullcalendar/duration.js')
jest.mock("../../../../../src/utils/calendarObject.js")

describe('fullcalendar/eventResize test suite', () => {

	beforeEach(() => {
		getDurationValueFromFullCalendarDuration.mockClear()
		getObjectAtRecurrenceId.mockClear()
	})

	it('should properly resize a non-recurring event', async () => {
		const store = {
			dispatch: jest.fn()
		}
		const event = {
			extendedProps: {
				objectId: 'object123',
				recurrenceId: '1573554842'
			}
		}
		const startDelta = {
			hours: 5
		}
		const endDelta = {}
		const revert = jest.fn()

		getDurationValueFromFullCalendarDuration
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 5 })
			.mockReturnValueOnce(false)

		const eventComponent = {
			addDurationToStart: jest.fn(),
			addDurationToEnd: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
		}
		const calendarObject = {
			_isCalendarObject: true,
		}
		getObjectAtRecurrenceId
			.mockReturnValue(eventComponent)

		store.dispatch
			.mockResolvedValueOnce(calendarObject) // getEventByObjectId
			.mockResolvedValueOnce() // updateCalendarObject

		const eventResizeFunction = eventResize(store)
		await eventResizeFunction({ event, startDelta, endDelta, revert })

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(2)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, startDelta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, endDelta)

		expect(store.dispatch).toHaveBeenCalledTimes(2)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getEventByObjectId', { objectId: 'object123' })
		expect(store.dispatch).toHaveBeenNthCalledWith(2, 'updateCalendarObject', { calendarObject })

		expect(eventComponent.addDurationToStart).toHaveBeenCalledTimes(1)
		expect(eventComponent.addDurationToStart).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 })

		expect(eventComponent.addDurationToEnd).toHaveBeenCalledTimes(0)

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(1)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(0)
	})

	it('should properly resize a recurring event', async () => {
		const store = {
			dispatch: jest.fn()
		}
		const event = {
			extendedProps: {
				objectId: 'object123',
				recurrenceId: '1573554842'
			}
		}
		const startDelta = {}
		const endDelta = {
			hours: 5
		}
		const revert = jest.fn()

		getDurationValueFromFullCalendarDuration
			.mockReturnValueOnce(false)
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 5 })

		const eventComponent = {
			addDurationToStart: jest.fn(),
			addDurationToEnd: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(true),
			createRecurrenceException: jest.fn(),
		}
		const calendarObject = {
			_isCalendarObject: true,
		}
		getObjectAtRecurrenceId
			.mockReturnValue(eventComponent)

		store.dispatch
			.mockResolvedValueOnce(calendarObject) // getEventByObjectId
			.mockResolvedValueOnce() // updateCalendarObject

		const eventResizeFunction = eventResize(store)
		await eventResizeFunction({ event, startDelta, endDelta, revert })

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(2)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, startDelta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, endDelta)

		expect(store.dispatch).toHaveBeenCalledTimes(2)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getEventByObjectId', { objectId: 'object123' })
		expect(store.dispatch).toHaveBeenNthCalledWith(2, 'updateCalendarObject', { calendarObject })

		expect(eventComponent.addDurationToStart).toHaveBeenCalledTimes(0)

		expect(eventComponent.addDurationToEnd).toHaveBeenCalledTimes(1)
		expect(eventComponent.addDurationToEnd).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 })

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(1)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(1)

		expect(revert).toHaveBeenCalledTimes(0)
	})

	it('should revert the action when neither a valid start nor end resize was given', async () => {
		const store = {
			dispatch: jest.fn()
		}
		const event = {
			extendedProps: {
				objectId: 'object123',
				recurrenceId: '1573554842'
			}
		}
		const startDelta = {}
		const endDelta = {}
		const revert = jest.fn()

		getDurationValueFromFullCalendarDuration
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(false)

		const eventComponent = {
			addDurationToStart: jest.fn(),
			addDurationToEnd: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(true),
			createRecurrenceException: jest.fn(),
		}
		const calendarObject = {
			_isCalendarObject: true,
		}
		getObjectAtRecurrenceId
			.mockReturnValue(eventComponent)

		store.dispatch
			.mockResolvedValueOnce(calendarObject) // getEventByObjectId
			.mockResolvedValueOnce() // updateCalendarObject

		const eventResizeFunction = eventResize(store)
		await eventResizeFunction({ event, startDelta, endDelta, revert })

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(2)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, startDelta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, endDelta)

		expect(store.dispatch).toHaveBeenCalledTimes(0)

		expect(eventComponent.addDurationToStart).toHaveBeenCalledTimes(0)
		expect(eventComponent.addDurationToEnd).toHaveBeenCalledTimes(0)

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(0)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert the action when the object was not found', async () => {
		const store = {
			dispatch: jest.fn()
		}
		const event = {
			extendedProps: {
				objectId: 'object123',
				recurrenceId: '1573554842'
			}
		}
		const startDelta = {
			hours: 5
		}
		const endDelta = {}
		const revert = jest.fn()

		getDurationValueFromFullCalendarDuration
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 5 })
			.mockReturnValueOnce(false)

		const eventComponent = {
			addDurationToStart: jest.fn(),
			addDurationToEnd: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
		}
		const calendarObject = {
			_isCalendarObject: true,
		}
		getObjectAtRecurrenceId
			.mockReturnValue(eventComponent)

		store.dispatch
			.mockImplementationOnce(() => {
				throw new Error()
			}) // getEventByObjectId
			.mockResolvedValueOnce() // updateCalendarObject

		const eventResizeFunction = eventResize(store)
		await eventResizeFunction({ event, startDelta, endDelta, revert })

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(2)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, startDelta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, endDelta)

		expect(store.dispatch).toHaveBeenCalledTimes(1)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getEventByObjectId', { objectId: 'object123' })

		expect(eventComponent.addDurationToStart).toHaveBeenCalledTimes(0)
		expect(eventComponent.addDurationToEnd).toHaveBeenCalledTimes(0)

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(0)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert the action when the recurrence was not found', async () => {
		const store = {
			dispatch: jest.fn()
		}
		const event = {
			extendedProps: {
				objectId: 'object123',
				recurrenceId: '1573554842'
			}
		}
		const startDelta = {
			hours: 5
		}
		const endDelta = {}
		const revert = jest.fn()

		getDurationValueFromFullCalendarDuration
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 5 })
			.mockReturnValueOnce(false)

		const eventComponent = {
			addDurationToStart: jest.fn(),
			addDurationToEnd: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
		}
		const calendarObject = {
			_isCalendarObject: true,
		}
		getObjectAtRecurrenceId
			.mockReturnValue(null)

		store.dispatch
			.mockResolvedValueOnce(calendarObject) // getEventByObjectId
			.mockResolvedValueOnce() // updateCalendarObject

		const eventResizeFunction = eventResize(store)
		await eventResizeFunction({ event, startDelta, endDelta, revert })

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(2)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, startDelta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, endDelta)

		expect(store.dispatch).toHaveBeenCalledTimes(1)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getEventByObjectId', { objectId: 'object123' })

		expect(eventComponent.addDurationToStart).toHaveBeenCalledTimes(0)
		expect(eventComponent.addDurationToEnd).toHaveBeenCalledTimes(0)

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(0)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(1)
	})

	it('should revert the action when there was an error updating the event', async () => {
		const store = {
			dispatch: jest.fn()
		}
		const event = {
			extendedProps: {
				objectId: 'object123',
				recurrenceId: '1573554842'
			}
		}
		const startDelta = {
			hours: 5
		}
		const endDelta = {}
		const revert = jest.fn()

		getDurationValueFromFullCalendarDuration
			.mockReturnValueOnce({ calendarJsDurationValue: true, hours: 5 })
			.mockReturnValueOnce(false)

		const eventComponent = {
			addDurationToStart: jest.fn(),
			addDurationToEnd: jest.fn(),
			canCreateRecurrenceExceptions: jest.fn().mockReturnValue(false),
			createRecurrenceException: jest.fn(),
		}
		const calendarObject = {
			_isCalendarObject: true,
		}
		getObjectAtRecurrenceId
			.mockReturnValue(eventComponent)

		store.dispatch
			.mockResolvedValueOnce(calendarObject) // getEventByObjectId
			.mockImplementationOnce(() => {
				throw new Error()
			}) // updateCalendarObject

		store.commit = jest.fn()

		const eventResizeFunction = eventResize(store)
		await eventResizeFunction({ event, startDelta, endDelta, revert })

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(2)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, startDelta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, endDelta)

		expect(store.dispatch).toHaveBeenCalledTimes(2)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getEventByObjectId', { objectId: 'object123' })
		expect(store.dispatch).toHaveBeenNthCalledWith(2, 'updateCalendarObject', { calendarObject })

		expect(store.commit).toHaveBeenCalledTimes(1)
		expect(store.commit).toHaveBeenNthCalledWith(1, 'resetCalendarObjectToDav', { calendarObject: calendarObject })

		expect(eventComponent.addDurationToStart).toHaveBeenCalledTimes(1)
		expect(eventComponent.addDurationToStart).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 })

		expect(eventComponent.addDurationToEnd).toHaveBeenCalledTimes(0)

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(1)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(1)
	})

})
