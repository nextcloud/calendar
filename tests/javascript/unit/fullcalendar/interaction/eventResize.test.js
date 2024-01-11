/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import eventResize from "../../../../../src/fullcalendar/interaction/eventResize.js";

import { getDurationValueFromFullCalendarDuration} from '../../../../../src/fullcalendar/duration.js'
import {getObjectAtRecurrenceId} from "../../../../../src/utils/calendarObject.js";
import useCalendarsStore from '../../../../../src/store/calendars.js'
import useCalendarObjectsStore from '../../../../../src/store/calendarObjects.js'

jest.mock('../../../../../src/fullcalendar/duration.js')
jest.mock("../../../../../src/utils/calendarObject.js")
jest.mock('../../../../../src/store/calendars.js')
jest.mock('../../../../../src/store/calendarObjects.js')

describe('fullcalendar/eventResize test suite', () => {

	beforeEach(() => {
		getDurationValueFromFullCalendarDuration.mockClear()
		getObjectAtRecurrenceId.mockClear()
		useCalendarsStore.mockClear()
		useCalendarObjectsStore.mockClear()
	})

	it('should properly resize a non-recurring event', async () => {
		const calendarsStore = {
			getEventByObjectId: jest.fn(),
		}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const calendarObjectsStore = {
			updateCalendarObject: jest.fn(),
		}
		useCalendarObjectsStore.mockReturnValue(calendarObjectsStore)
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

		calendarsStore.getEventByObjectId.mockResolvedValueOnce(calendarObject)
		calendarObjectsStore.updateCalendarObject.mockResolvedValueOnce()

		const eventResizeFunction = eventResize()
		await eventResizeFunction({ event, startDelta, endDelta, revert })

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(2)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, startDelta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, endDelta)

		expect(useCalendarsStore).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenNthCalledWith(1, { objectId: 'object123' })

		expect(useCalendarObjectsStore).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.updateCalendarObject).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.updateCalendarObject).toHaveBeenNthCalledWith(1, { calendarObject })

		expect(eventComponent.addDurationToStart).toHaveBeenCalledTimes(1)
		expect(eventComponent.addDurationToStart).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 })

		expect(eventComponent.addDurationToEnd).toHaveBeenCalledTimes(0)

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(1)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(0)
	})

	it('should properly resize a recurring event', async () => {
		const calendarsStore = {
			getEventByObjectId: jest.fn(),
		}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const calendarObjectsStore = {
			updateCalendarObject: jest.fn(),
		}
		useCalendarObjectsStore.mockReturnValue(calendarObjectsStore)
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

		calendarsStore.getEventByObjectId.mockResolvedValueOnce(calendarObject)
		calendarObjectsStore.updateCalendarObject.mockResolvedValueOnce()

		const eventResizeFunction = eventResize()
		await eventResizeFunction({ event, startDelta, endDelta, revert })

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(2)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, startDelta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, endDelta)

		expect(useCalendarsStore).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenNthCalledWith(1, { objectId: 'object123' })

		expect(useCalendarObjectsStore).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.updateCalendarObject).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.updateCalendarObject).toHaveBeenNthCalledWith(1, { calendarObject })

		expect(eventComponent.addDurationToStart).toHaveBeenCalledTimes(0)

		expect(eventComponent.addDurationToEnd).toHaveBeenCalledTimes(1)
		expect(eventComponent.addDurationToEnd).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 })

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(1)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(1)

		expect(revert).toHaveBeenCalledTimes(0)
	})

	it('should revert the action when neither a valid start nor end resize was given', async () => {
		const calendarsStore = {}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const calendarObjectsStore = {}
		useCalendarObjectsStore.mockReturnValue(calendarObjectsStore)
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

		const eventResizeFunction = eventResize()
		await eventResizeFunction({ event, startDelta, endDelta, revert })

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(2)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, startDelta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, endDelta)

		expect(useCalendarsStore).toHaveBeenCalledTimes(1)
		expect(useCalendarObjectsStore).toHaveBeenCalledTimes(1)

		expect(eventComponent.addDurationToStart).toHaveBeenCalledTimes(0)
		expect(eventComponent.addDurationToEnd).toHaveBeenCalledTimes(0)

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

		calendarsStore.getEventByObjectId.mockRejectedValueOnce(new Error())

		const eventResizeFunction = eventResize()
		await eventResizeFunction({ event, startDelta, endDelta, revert })

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(2)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, startDelta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, endDelta)

		expect(useCalendarsStore).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenNthCalledWith(1, { objectId: 'object123' })

		expect(useCalendarObjectsStore).toHaveBeenCalledTimes(1)

		expect(eventComponent.addDurationToStart).toHaveBeenCalledTimes(0)
		expect(eventComponent.addDurationToEnd).toHaveBeenCalledTimes(0)

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

		calendarsStore.getEventByObjectId.mockResolvedValueOnce(calendarObject)

		const eventResizeFunction = eventResize()
		await eventResizeFunction({ event, startDelta, endDelta, revert })

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(2)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, startDelta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, endDelta)

		expect(useCalendarsStore).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenNthCalledWith(1, { objectId: 'object123' })

		expect(useCalendarObjectsStore).toHaveBeenCalledTimes(1)

		expect(eventComponent.addDurationToStart).toHaveBeenCalledTimes(0)
		expect(eventComponent.addDurationToEnd).toHaveBeenCalledTimes(0)

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

		calendarsStore.getEventByObjectId.mockResolvedValueOnce(calendarObject)
		calendarObjectsStore.updateCalendarObject.mockRejectedValueOnce(new Error())
		calendarObjectsStore.resetCalendarObjectToDavMutation.mockReturnValueOnce()

		const eventResizeFunction = eventResize()
		await eventResizeFunction({ event, startDelta, endDelta, revert })

		expect(getDurationValueFromFullCalendarDuration).toHaveBeenCalledTimes(2)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(1, startDelta)
		expect(getDurationValueFromFullCalendarDuration).toHaveBeenNthCalledWith(2, endDelta)

		expect(useCalendarsStore).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventByObjectId).toHaveBeenNthCalledWith(1, { objectId: 'object123' })

		expect(useCalendarObjectsStore).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.updateCalendarObject).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.updateCalendarObject).toHaveBeenNthCalledWith(1, { calendarObject })
		expect(calendarObjectsStore.resetCalendarObjectToDavMutation).toHaveBeenCalledTimes(1)
		expect(calendarObjectsStore.resetCalendarObjectToDavMutation).toHaveBeenNthCalledWith(1, { calendarObject })

		expect(eventComponent.addDurationToStart).toHaveBeenCalledTimes(1)
		expect(eventComponent.addDurationToStart).toHaveBeenNthCalledWith(1, { calendarJsDurationValue: true, hours: 5 })

		expect(eventComponent.addDurationToEnd).toHaveBeenCalledTimes(0)

		expect(eventComponent.canCreateRecurrenceExceptions).toHaveBeenCalledTimes(1)
		expect(eventComponent.createRecurrenceException).toHaveBeenCalledTimes(0)

		expect(revert).toHaveBeenCalledTimes(1)
	})

})
