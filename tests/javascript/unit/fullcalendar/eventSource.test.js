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
import eventSource from "../../../../src/fullcalendar/eventSource.js";

import { generateTextColorForHex } from '../../../../src/utils/color.js'
import getTimezoneManager from '../../../../src/services/timezoneDataProviderService'
import { getUnixTimestampFromDate } from '../../../../src/utils/date.js'
import { eventSourceFunction } from '../../../../src/fullcalendar/eventSourceFunction.js'

jest.mock('../../../../src/utils/color.js')
jest.mock('../../../../src/services/timezoneDataProviderService')
jest.mock('../../../../src/utils/date.js')
jest.mock('../../../../src/fullcalendar/eventSourceFunction.js')

describe('fullcalendar/eventSource test suite', () => {

	beforeEach(() => {
		generateTextColorForHex.mockClear()
		getTimezoneManager.mockClear()
		getUnixTimestampFromDate.mockClear()
		eventSourceFunction.mockClear()
	})

	it('should provide an eventSource for a given calendar', () => {
		const store = {}
		const calendar = {
			id: 'calendar-id-123',
			color: '#ff00ff',
			isReadOnly: false
		}

		generateTextColorForHex
			.mockReturnValue('#00ff00')

		const eventSourceFunction = eventSource(store)
		expect(eventSourceFunction(calendar)).toEqual({
			id: 'calendar-id-123',
			backgroundColor: '#ff00ff',
			borderColor: '#ff00ff',
			textColor: '#00ff00',
			events: expect.any(Function)
		})

		expect(generateTextColorForHex).toHaveBeenCalledTimes(1)
		expect(generateTextColorForHex).toHaveBeenNthCalledWith(1, '#ff00ff')
	})

	it('should provide an eventSource for a given read-only calendar', () => {
		const store = {}
		const calendar = {
			id: 'calendar-id-123',
			color: '#ff00ff',
			isReadOnly: true
		}

		generateTextColorForHex
			.mockReturnValue('#00ff00')

		const eventSourceFunction = eventSource(store)
		expect(eventSourceFunction(calendar)).toEqual({
			id: 'calendar-id-123',
			backgroundColor: '#ff00ff',
			borderColor: '#ff00ff',
			textColor: '#00ff00',
			events: expect.any(Function),
			editable: false
		})

		expect(generateTextColorForHex).toHaveBeenCalledTimes(1)
		expect(generateTextColorForHex).toHaveBeenNthCalledWith(1, '#ff00ff')
	})

	it('should provide an eventSource function to provide events - fetch new timerange', async () => {
		const store = {
			dispatch: jest.fn()
				.mockReturnValueOnce(42),
			getters: {
				getTimeRangeForCalendarCoveringRange: jest.fn()
					.mockReturnValueOnce(false),
				getCalendarObjectsByTimeRangeId: jest.fn()
					.mockReturnValueOnce([{ calendarObjectId: 1 }, { calendarObjectId: 2 }])
			}
		}

		const calendar = {
			id: 'calendar-id-123',
			color: '#ff00ff',
			isReadOnly: true
		}

		const getTimezoneForId = jest.fn()
			.mockReturnValueOnce({ calendarJsTimezone: true, tzid: 'America/New_York' })
		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId
			})

		getUnixTimestampFromDate
			.mockReturnValueOnce(1234)
			.mockReturnValueOnce(5678)

		generateTextColorForHex
			.mockReturnValue('#00ff00')

		eventSourceFunction
			.mockReturnValueOnce([{ fcEventId: 1 },  { fcEventId: 2 }])

		const start = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2019, 0, 31, 59, 59, 59, 999))
		const timeZone = 'America/New_York'

		const successCallback = jest.fn()
		const failureCallback = jest.fn()

		const eventSourceFn = eventSource(store)
		const { events } = eventSourceFn(calendar)
		await events({ start, end, timeZone }, successCallback, failureCallback)

		expect(store.getters.getTimeRangeForCalendarCoveringRange).toHaveBeenCalledTimes(1)
		expect(store.getters.getTimeRangeForCalendarCoveringRange).toHaveBeenNthCalledWith(1, 'calendar-id-123', 1234, 5678)

		expect(store.dispatch).toHaveBeenCalledTimes(1)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getEventsFromCalendarInTimeRange', {
			calendar,
			from: start,
			to: end
		})

		expect(store.getters.getCalendarObjectsByTimeRangeId).toHaveBeenCalledTimes(1)
		expect(store.getters.getCalendarObjectsByTimeRangeId).toHaveBeenNthCalledWith(1, 42)

		expect(eventSourceFunction).toHaveBeenCalledTimes(1)
		expect(eventSourceFunction).toHaveBeenNthCalledWith(1, [{ calendarObjectId: 1 }, { calendarObjectId: 2 }], calendar, start, end, { calendarJsTimezone: true, tzid: 'America/New_York' })

		expect(successCallback).toHaveBeenCalledTimes(1)
		expect(successCallback).toHaveBeenNthCalledWith(1, [{ fcEventId: 1 },  { fcEventId: 2 }])

		expect(failureCallback).toHaveBeenCalledTimes(0)
	})

	it('should provide an eventSource function to provide events - existing timerange', async () => {
		const store = {
			dispatch: jest.fn()
				.mockReturnValueOnce(42),
			getters: {
				getTimeRangeForCalendarCoveringRange: jest.fn()
					.mockReturnValueOnce({
						id: 42
					}),
				getCalendarObjectsByTimeRangeId: jest.fn()
					.mockReturnValueOnce([{ calendarObjectId: 1 }, { calendarObjectId: 2 }])
			}
		}

		const calendar = {
			id: 'calendar-id-123',
			color: '#ff00ff',
			isReadOnly: true
		}

		const getTimezoneForId = jest.fn()
			.mockReturnValueOnce({ calendarJsTimezone: true, tzid: 'America/New_York' })
		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId
			})

		getUnixTimestampFromDate
			.mockReturnValueOnce(1234)
			.mockReturnValueOnce(5678)

		generateTextColorForHex
			.mockReturnValue('#00ff00')

		eventSourceFunction
			.mockReturnValueOnce([{ fcEventId: 1 },  { fcEventId: 2 }])

		const start = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2019, 0, 31, 59, 59, 59, 999))
		const timeZone = 'America/New_York'

		const successCallback = jest.fn()
		const failureCallback = jest.fn()

		const eventSourceFn = eventSource(store)
		const { events } = eventSourceFn(calendar)
		await events({ start, end, timeZone }, successCallback, failureCallback)

		expect(store.getters.getTimeRangeForCalendarCoveringRange).toHaveBeenCalledTimes(1)
		expect(store.getters.getTimeRangeForCalendarCoveringRange).toHaveBeenNthCalledWith(1, 'calendar-id-123', 1234, 5678)

		expect(store.dispatch).toHaveBeenCalledTimes(0)

		expect(store.getters.getCalendarObjectsByTimeRangeId).toHaveBeenCalledTimes(1)
		expect(store.getters.getCalendarObjectsByTimeRangeId).toHaveBeenNthCalledWith(1, 42)

		expect(eventSourceFunction).toHaveBeenCalledTimes(1)
		expect(eventSourceFunction).toHaveBeenNthCalledWith(1, [{ calendarObjectId: 1 }, { calendarObjectId: 2 }], calendar, start, end, { calendarJsTimezone: true, tzid: 'America/New_York' })

		expect(successCallback).toHaveBeenCalledTimes(1)
		expect(successCallback).toHaveBeenNthCalledWith(1, [{ fcEventId: 1 },  { fcEventId: 2 }])

		expect(failureCallback).toHaveBeenCalledTimes(0)
	})

	it('should provide an eventSource function that catches errors while fetching', async () => {
		const store = {
			dispatch: jest.fn()
				.mockImplementationOnce(() => {
					throw new Error()
				}),
			getters: {
				getTimeRangeForCalendarCoveringRange: jest.fn()
					.mockReturnValueOnce(false),
				getCalendarObjectsByTimeRangeId: jest.fn()
					.mockReturnValueOnce([{ calendarObjectId: 1 }, { calendarObjectId: 2 }])
			}
		}

		const calendar = {
			id: 'calendar-id-123',
			color: '#ff00ff',
			isReadOnly: true
		}

		const getTimezoneForId = jest.fn()
			.mockReturnValueOnce({ calendarJsTimezone: true, tzid: 'America/New_York' })
		getTimezoneManager
			.mockReturnValue({
				getTimezoneForId
			})

		getUnixTimestampFromDate
			.mockReturnValueOnce(1234)
			.mockReturnValueOnce(5678)

		generateTextColorForHex
			.mockReturnValue('#00ff00')

		eventSourceFunction
			.mockReturnValueOnce([{ fcEventId: 1 },  { fcEventId: 2 }])

		const start = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2019, 0, 31, 59, 59, 59, 999))
		const timeZone = 'America/New_York'

		const successCallback = jest.fn()
		const failureCallback = jest.fn()

		const eventSourceFn = eventSource(store)
		const { events } = eventSourceFn(calendar)
		await events({ start, end, timeZone }, successCallback, failureCallback)

		expect(store.getters.getTimeRangeForCalendarCoveringRange).toHaveBeenCalledTimes(1)
		expect(store.getters.getTimeRangeForCalendarCoveringRange).toHaveBeenNthCalledWith(1, 'calendar-id-123', 1234, 5678)

		expect(store.dispatch).toHaveBeenCalledTimes(1)
		expect(store.dispatch).toHaveBeenNthCalledWith(1, 'getEventsFromCalendarInTimeRange', {
			calendar,
			from: start,
			to: end
		})

		expect(store.getters.getCalendarObjectsByTimeRangeId).toHaveBeenCalledTimes(0)
		expect(eventSourceFunction).toHaveBeenCalledTimes(0)
		expect(successCallback).toHaveBeenCalledTimes(0)

		expect(failureCallback).toHaveBeenCalledTimes(1)
	})

})
