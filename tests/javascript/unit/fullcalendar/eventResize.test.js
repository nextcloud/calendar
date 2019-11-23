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
import eventResize from "../../../../src/fullcalendar/eventResize.js";

import { getDurationValueFromFullCalendarDuration} from '../../../../src/fullcalendar/duration.js'
jest.mock('../../../../src/fullcalendar/duration.js')

describe('fullcalendar/eventResize test suite', () => {

	beforeEach(() => {
		getDurationValueFromFullCalendarDuration.mockClear()
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
			getObjectAtRecurrenceId: jest.fn().mockReturnValueOnce(eventComponent),
			resetToDav: jest.fn()
		}

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

		expect(calendarObject.resetToDav).toHaveBeenCalledTimes(0)
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
			getObjectAtRecurrenceId: jest.fn().mockReturnValueOnce(eventComponent),
			resetToDav: jest.fn()
		}

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

		expect(calendarObject.resetToDav).toHaveBeenCalledTimes(0)
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
			getObjectAtRecurrenceId: jest.fn().mockReturnValueOnce(eventComponent),
			resetToDav: jest.fn()
		}

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

		expect(calendarObject.resetToDav).toHaveBeenCalledTimes(0)
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
			getObjectAtRecurrenceId: jest.fn().mockReturnValueOnce(eventComponent),
			resetToDav: jest.fn()
		}

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

		expect(calendarObject.resetToDav).toHaveBeenCalledTimes(0)
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
			getObjectAtRecurrenceId: jest.fn().mockReturnValueOnce(null),
			resetToDav: jest.fn()
		}

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

		expect(calendarObject.resetToDav).toHaveBeenCalledTimes(0)
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
			getObjectAtRecurrenceId: jest.fn().mockReturnValueOnce(eventComponent),
			resetToDav: jest.fn()
		}

		store.dispatch
			.mockResolvedValueOnce(calendarObject) // getEventByObjectId
			.mockImplementationOnce(() => {
				throw new Error()
			}) // updateCalendarObject

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

		expect(calendarObject.resetToDav).toHaveBeenCalledTimes(1)
		expect(revert).toHaveBeenCalledTimes(1)
	})

})
