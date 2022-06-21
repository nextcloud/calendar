/**
 * @copyright Copyright (c) 2022 Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @author Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @license AGPL-3.0-or-later
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

import { eventSourceFunction } from '../../../../../src/fullcalendar/eventSources/eventSourceFunction.js'
import {
	generateTextColorForHex,
	getHexForColorName, hexToRGB,
	isLight,
} from '../../../../../src/utils/color.js'
import { getAllObjectsInTimeRange } from '../../../../../src/utils/calendarObject.js'

jest.mock('../../../../../src/utils/color.js')
jest.mock('../../../../../src/utils/calendarObject.js')

describe('fullcalendar/eventSourceFunction test suite', () => {
	beforeEach(() => {
		generateTextColorForHex.mockClear()
		getAllObjectsInTimeRange.mockClear()
		getHexForColorName.mockClear()
		hexToRGB.mockClear()
		isLight.mockClear()
	})

	it('should prefer the event color', () => {
		const calendar = {
			id: 'calendar-id-123',
			color: '#ff00ff',
			readOnly: false,
		}

		const start = new Date()
		start.setHours(start.getHours() - 24)
		const end = new Date()
		end.setHours(end.getHours() + 24)
		const timezone = { calendarJsTimezone: true, tzid: 'America/New_York' }

		const calendarObjects = [
			{
				calendarObject: true,
				dav: {
					url: 'url1',
				},
				id: '1',
			},
		]

		const eventComponents = [
			{
				name: 'VEVENT',
				id: '1-1',
				status: 'CONFIRMED',
				isAllDay: jest.fn().mockReturnValue(false),
				getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 123 }),
				canModifyAllDay: jest.fn().mockReturnValue(true),
				startDate: {
					getInTimezone: jest.fn().mockReturnValue({
						jsDate: new Date(start),
					}),
				},
				endDate: {
					getInTimezone: jest.fn().mockReturnValue({
						jsDate: new Date(end),
					}),
				},
				hasComponent: jest.fn().mockReturnValue(false),
				hasProperty: jest.fn().mockReturnValue(false),
				color: 'red',
			},
		]

		getAllObjectsInTimeRange
			.mockReturnValueOnce(eventComponents)
		hexToRGB
			.mockReturnValueOnce({ red: 255, green: 0, blue: 255 })
		isLight
			.mockReturnValueOnce(false)
		getHexForColorName
			.mockReturnValueOnce('#ff0000')
		generateTextColorForHex
			.mockReturnValueOnce('#eeeeee')

		expect(eventSourceFunction(calendarObjects, calendar, new Date(start), new Date(end), timezone)).toEqual([
			{
				id: '1###1-1',
				title: 'Untitled event',
				allDay: false,
				start,
				end,
				classNames: [],
				extendedProps: {
					objectId: '1',
					recurrenceId: 123,
					canModifyAllDay: true,
					calendarId: 'calendar-id-123',
					davUrl: 'url1',
					objectType: 'VEVENT',
					percent: null,
					hasAlarms: false,
					hasAttendees: false,
					darkText: false,
				},
				backgroundColor: '#ff0000',
				borderColor: '#ff0000',
				textColor: '#eeeeee',
			},
		])

		expect(hexToRGB).toHaveBeenCalledTimes(1)
		expect(hexToRGB).toHaveBeenNthCalledWith(1, '#ff00ff')
		expect(isLight).toHaveBeenCalledTimes(1)
		expect(isLight).toHaveBeenNthCalledWith(1, { red: 255, green: 0, blue: 255 })
		expect(getAllObjectsInTimeRange).toHaveBeenCalledTimes(1)
		expect(getAllObjectsInTimeRange).toHaveBeenNthCalledWith(1, calendarObjects[0], start, end)
		expect(getHexForColorName).toHaveBeenCalledTimes(1)
		expect(getHexForColorName).toHaveBeenNthCalledWith(1, 'red')
		expect(generateTextColorForHex).toHaveBeenCalledTimes(1)
		expect(generateTextColorForHex).toHaveBeenNthCalledWith(1, '#ff0000')
	})

	it('should fallback to the calendar color', () => {
		const calendar = {
			id: 'calendar-id-123',
			color: '#ff00ff',
			readOnly: false,
		}

		const start = new Date()
		start.setHours(start.getHours() - 24)
		const end = new Date()
		end.setHours(end.getHours() + 24)
		const timezone = { calendarJsTimezone: true, tzid: 'America/New_York' }

		const calendarObjects = [
			{
				calendarObject: true,
				dav: {
					url: 'url1',
				},
				id: '1',
			},
		]

		const eventComponents = [
			{
				name: 'VEVENT',
				id: '1-1',
				status: 'CONFIRMED',
				isAllDay: jest.fn().mockReturnValue(false),
				getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 123 }),
				canModifyAllDay: jest.fn().mockReturnValue(true),
				startDate: {
					getInTimezone: jest.fn().mockReturnValue({
						jsDate: new Date(start),
					}),
				},
				endDate: {
					getInTimezone: jest.fn().mockReturnValue({
						jsDate: new Date(end),
					}),
				},
				hasComponent: jest.fn().mockReturnValue(false),
				hasProperty: jest.fn().mockReturnValue(false),
			},
		]

		getAllObjectsInTimeRange
			.mockReturnValueOnce(eventComponents)
		hexToRGB
			.mockReturnValueOnce({ red: 255, green: 0, blue: 255 })
		isLight
			.mockReturnValueOnce(false)
		getHexForColorName
			.mockReturnValueOnce(null)
		generateTextColorForHex
			.mockReturnValueOnce('#eeeeee')

		expect(eventSourceFunction(calendarObjects, calendar, new Date(start), new Date(end), timezone)).toEqual([
			{
				id: '1###1-1',
				title: 'Untitled event',
				allDay: false,
				start,
				end,
				classNames: [],
				extendedProps: {
					objectId: '1',
					recurrenceId: 123,
					canModifyAllDay: true,
					calendarId: 'calendar-id-123',
					davUrl: 'url1',
					objectType: 'VEVENT',
					percent: null,
					hasAlarms: false,
					hasAttendees: false,
					darkText: false,
				},
				backgroundColor: '#ff00ff',
				borderColor: '#ff00ff',
				textColor: '#eeeeee',
			},
		])

		expect(hexToRGB).toHaveBeenCalledTimes(1)
		expect(hexToRGB).toHaveBeenNthCalledWith(1, '#ff00ff')
		expect(isLight).toHaveBeenCalledTimes(1)
		expect(isLight).toHaveBeenNthCalledWith(1, { red: 255, green: 0, blue: 255 })
		expect(getAllObjectsInTimeRange).toHaveBeenCalledTimes(1)
		expect(getAllObjectsInTimeRange).toHaveBeenNthCalledWith(1, calendarObjects[0], start, end)
		expect(getHexForColorName).toHaveBeenCalledTimes(1)
		expect(getHexForColorName).toHaveBeenNthCalledWith(1, undefined)
		expect(generateTextColorForHex).toHaveBeenCalledTimes(1)
		expect(generateTextColorForHex).toHaveBeenNthCalledWith(1, '#ff00ff')
	})
})
