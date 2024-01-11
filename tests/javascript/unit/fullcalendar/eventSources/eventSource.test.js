/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import eventSource from "../../../../../src/fullcalendar/eventSources/eventSource.js";

import { generateTextColorForHex } from '../../../../../src/utils/color.js'
import getTimezoneManager from '../../../../../src/services/timezoneDataProviderService'
import { getUnixTimestampFromDate } from '../../../../../src/utils/date.js'
import { eventSourceFunction } from '../../../../../src/fullcalendar/eventSources/eventSourceFunction.js'
import useFetchedTimeRangesStore from '../../../../../src/store/fetchedTimeRanges.js'
import useCalendarsStore from '../../../../../src/store/calendars.js'

jest.mock('../../../../../src/utils/color.js')
jest.mock('../../../../../src/services/timezoneDataProviderService')
jest.mock('../../../../../src/utils/date.js')
jest.mock('../../../../../src/fullcalendar/eventSources/eventSourceFunction.js')
jest.mock('../../../../../src/store/fetchedTimeRanges.js')
jest.mock('../../../../../src/store/calendars.js')

describe('fullcalendar/eventSource test suite', () => {

	beforeEach(() => {
		generateTextColorForHex.mockClear()
		getTimezoneManager.mockClear()
		getUnixTimestampFromDate.mockClear()
		eventSourceFunction.mockClear()
		useFetchedTimeRangesStore.mockClear()
		useCalendarsStore.mockClear()
	})

	it('should provide an eventSource for a given calendar', () => {
		const calendarsStore = {}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const fetchedTimeRangesStore = {}
		useFetchedTimeRangesStore.mockReturnValue(fetchedTimeRangesStore)
		const calendar = {
			id: 'calendar-id-123',
			color: '#ff00ff',
			readOnly: false
		}

		generateTextColorForHex
			.mockReturnValue('#00ff00')

		const eventSourceFunction = eventSource()
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
		const calendarsStore = {}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const fetchedTimeRangesStore = {}
		useFetchedTimeRangesStore.mockReturnValue(fetchedTimeRangesStore)
		const calendar = {
			id: 'calendar-id-123',
			color: '#ff00ff',
			readOnly: true
		}

		generateTextColorForHex
			.mockReturnValue('#00ff00')

		const eventSourceFunction = eventSource()
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
		const calendarsStore = {
			getEventsFromCalendarInTimeRange: jest.fn()
				.mockResolvedValueOnce(42),
		}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const fetchedTimeRangesStore = {
			getTimeRangeForCalendarCoveringRange: jest.fn()
				.mockReturnValueOnce(false),
			getCalendarObjectsByTimeRangeId: jest.fn()
				.mockReturnValueOnce([{ calendarObjectId: 1 }, { calendarObjectId: 2 }])
		}
		useFetchedTimeRangesStore.mockReturnValue(fetchedTimeRangesStore)

		const calendar = {
			id: 'calendar-id-123',
			color: '#ff00ff',
			readOnly: true
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

		const eventSourceFn = eventSource()
		const { events } = eventSourceFn(calendar)
		await events({ start, end, timeZone }, successCallback, failureCallback)

		expect(fetchedTimeRangesStore.getTimeRangeForCalendarCoveringRange).toHaveBeenCalledTimes(1)
		expect(fetchedTimeRangesStore.getTimeRangeForCalendarCoveringRange).toHaveBeenNthCalledWith(1, 'calendar-id-123', 1234, 5678)

		expect(calendarsStore.getEventsFromCalendarInTimeRange).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventsFromCalendarInTimeRange).toHaveBeenNthCalledWith(1, {
			calendar,
			from: start,
			to: end
		})

		expect(fetchedTimeRangesStore.getCalendarObjectsByTimeRangeId).toHaveBeenCalledTimes(1)
		expect(fetchedTimeRangesStore.getCalendarObjectsByTimeRangeId).toHaveBeenNthCalledWith(1, 42)

		expect(eventSourceFunction).toHaveBeenCalledTimes(1)
		expect(eventSourceFunction).toHaveBeenNthCalledWith(1, [{ calendarObjectId: 1 }, { calendarObjectId: 2 }], calendar, start, end, { calendarJsTimezone: true, tzid: 'America/New_York' })

		expect(successCallback).toHaveBeenCalledTimes(1)
		expect(successCallback).toHaveBeenNthCalledWith(1, [{ fcEventId: 1 },  { fcEventId: 2 }])

		expect(failureCallback).toHaveBeenCalledTimes(0)
	})

	it('should provide an eventSource function to provide events - existing timerange', async () => {
		const calendarsStore = {
			getEventsFromCalendarInTimeRange: jest.fn()
				.mockResolvedValueOnce(42),
		}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const fetchedTimeRangesStore = {
			getTimeRangeForCalendarCoveringRange: jest.fn()
				.mockReturnValueOnce({
					id: 42,
				}),
			getCalendarObjectsByTimeRangeId: jest.fn()
				.mockReturnValueOnce([{ calendarObjectId: 1 }, { calendarObjectId: 2 }])
		}
		useFetchedTimeRangesStore.mockReturnValue(fetchedTimeRangesStore)

		const calendar = {
			id: 'calendar-id-123',
			color: '#ff00ff',
			readOnly: true
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

		const eventSourceFn = eventSource()
		const { events } = eventSourceFn(calendar)
		await events({ start, end, timeZone }, successCallback, failureCallback)

		expect(fetchedTimeRangesStore.getTimeRangeForCalendarCoveringRange).toHaveBeenCalledTimes(1)
		expect(fetchedTimeRangesStore.getTimeRangeForCalendarCoveringRange).toHaveBeenNthCalledWith(1, 'calendar-id-123', 1234, 5678)

		expect(calendarsStore.getEventsFromCalendarInTimeRange).toHaveBeenCalledTimes(0)

		expect(fetchedTimeRangesStore.getCalendarObjectsByTimeRangeId).toHaveBeenCalledTimes(1)
		expect(fetchedTimeRangesStore.getCalendarObjectsByTimeRangeId).toHaveBeenNthCalledWith(1, 42)

		expect(eventSourceFunction).toHaveBeenCalledTimes(1)
		expect(eventSourceFunction).toHaveBeenNthCalledWith(1, [{ calendarObjectId: 1 }, { calendarObjectId: 2 }], calendar, start, end, { calendarJsTimezone: true, tzid: 'America/New_York' })

		expect(successCallback).toHaveBeenCalledTimes(1)
		expect(successCallback).toHaveBeenNthCalledWith(1, [{ fcEventId: 1 },  { fcEventId: 2 }])

		expect(failureCallback).toHaveBeenCalledTimes(0)
	})

	it('should provide an eventSource function to provide events - existing timerange - unknown timezone', async () => {
		const calendarsStore = {
			getEventsFromCalendarInTimeRange: jest.fn()
				.mockResolvedValueOnce(42),
		}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const fetchedTimeRangesStore = {
			getTimeRangeForCalendarCoveringRange: jest.fn()
				.mockReturnValueOnce({
					id: 42,
				}),
			getCalendarObjectsByTimeRangeId: jest.fn()
				.mockReturnValueOnce([{ calendarObjectId: 1 }, { calendarObjectId: 2 }])
		}
		useFetchedTimeRangesStore.mockReturnValue(fetchedTimeRangesStore)

		const calendar = {
			id: 'calendar-id-123',
			color: '#ff00ff',
			readOnly: true
		}

		const getTimezoneForId = jest.fn()
			.mockReturnValueOnce(null)
			.mockReturnValueOnce({ calendarJsTimezone: true, tzid: 'UTC' })
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

		const eventSourceFn = eventSource()
		const { events } = eventSourceFn(calendar)
		await events({ start, end, timeZone }, successCallback, failureCallback)

		expect(getTimezoneForId).toHaveBeenCalledTimes(2)
		expect(getTimezoneForId).toHaveBeenNthCalledWith(1, 'America/New_York')
		expect(getTimezoneForId).toHaveBeenNthCalledWith(2, 'UTC')

		expect(fetchedTimeRangesStore.getTimeRangeForCalendarCoveringRange).toHaveBeenCalledTimes(1)
		expect(fetchedTimeRangesStore.getTimeRangeForCalendarCoveringRange).toHaveBeenNthCalledWith(1, 'calendar-id-123', 1234, 5678)

		expect(calendarsStore.getEventsFromCalendarInTimeRange).toHaveBeenCalledTimes(0)

		expect(fetchedTimeRangesStore.getCalendarObjectsByTimeRangeId).toHaveBeenCalledTimes(1)
		expect(fetchedTimeRangesStore.getCalendarObjectsByTimeRangeId).toHaveBeenNthCalledWith(1, 42)

		expect(eventSourceFunction).toHaveBeenCalledTimes(1)
		expect(eventSourceFunction).toHaveBeenNthCalledWith(1, [{ calendarObjectId: 1 }, { calendarObjectId: 2 }], calendar, start, end, { calendarJsTimezone: true, tzid: 'UTC' })

		expect(successCallback).toHaveBeenCalledTimes(1)
		expect(successCallback).toHaveBeenNthCalledWith(1, [{ fcEventId: 1 },  { fcEventId: 2 }])

		expect(failureCallback).toHaveBeenCalledTimes(0)
	})

	it('should provide an eventSource function that catches errors while fetching', async () => {
		const calendarsStore = {
			getEventsFromCalendarInTimeRange: jest.fn()
				.mockRejectedValueOnce(new Error()),
		}
		useCalendarsStore.mockReturnValue(calendarsStore)
		const fetchedTimeRangesStore = {
			getTimeRangeForCalendarCoveringRange: jest.fn()
				.mockReturnValueOnce(false),
			getCalendarObjectsByTimeRangeId: jest.fn()
				.mockReturnValueOnce([{ calendarObjectId: 1 }, { calendarObjectId: 2 }])
		}
		useFetchedTimeRangesStore.mockReturnValue(fetchedTimeRangesStore)

		const calendar = {
			id: 'calendar-id-123',
			color: '#ff00ff',
			readOnly: true
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

		const eventSourceFn = eventSource()
		const { events } = eventSourceFn(calendar)
		await events({ start, end, timeZone }, successCallback, failureCallback)

		expect(fetchedTimeRangesStore.getTimeRangeForCalendarCoveringRange).toHaveBeenCalledTimes(1)
		expect(fetchedTimeRangesStore.getTimeRangeForCalendarCoveringRange).toHaveBeenNthCalledWith(1, 'calendar-id-123', 1234, 5678)

		expect(calendarsStore.getEventsFromCalendarInTimeRange).toHaveBeenCalledTimes(1)
		expect(calendarsStore.getEventsFromCalendarInTimeRange).toHaveBeenNthCalledWith(1, {
			calendar,
			from: start,
			to: end
		})

		expect(fetchedTimeRangesStore.getCalendarObjectsByTimeRangeId).toHaveBeenCalledTimes(0)

		expect(eventSourceFunction).toHaveBeenCalledTimes(0)
		expect(successCallback).toHaveBeenCalledTimes(0)

		expect(failureCallback).toHaveBeenCalledTimes(1)
	})

})
