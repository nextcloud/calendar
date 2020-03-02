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
import { eventSourceFunction } from '../../../../src/fullcalendar/eventSourceFunction.js'
import {
	hexToRGB,
	isLight,
	generateTextColorForHex,
	getHexForColorName,
} from '../../../../src/utils/color.js'
import { translate } from '@nextcloud/l10n'
jest.mock('@nextcloud/l10n')
jest.mock('../../../../src/utils/color.js')

describe('fullcalendar/eventSourceFunction test suite', () => {

	beforeEach(() => {
		translate.mockClear()
		getHexForColorName.mockClear()
		generateTextColorForHex.mockClear()
	})

	it('should provide fc-events', () => {
		translate
			.mockImplementation((app, str) => str)
		getHexForColorName
			.mockImplementation(() => '#ff0000')
		generateTextColorForHex
			.mockImplementation(() => '#eeeeee')
		isLight
			.mockImplementation(() => false)

		const event11Start = new Date(2020, 1, 1, 10, 0, 0, 0);
		const event11End = new Date(2020, 1, 1, 15, 0, 0, 0);
		const event12Start = new Date(2020, 1, 2, 10, 0, 0, 0);
		const event12End = new Date(2020, 1, 2, 15, 0, 0, 0);
		const event13Start = new Date(2020, 1, 3, 10, 0, 0, 0);
		const event13End = new Date(2020, 1, 3, 15, 0, 0, 0);
		const event21Start = new Date(2020, 5, 5, 0, 0, 0, 0);
		const event21End = new Date(2020, 5, 6, 0, 0, 0, 0);
		const event31Start = new Date(2020, 6, 10, 10, 0, 0, 0);
		const event31End = new Date(2020, 6, 10, 10, 0, 0, 0);

		const eventComponentSet1 = [{
			id: '1-1',
			// To title on purpose
			isAllDay: jest.fn().mockReturnValue(false),
			getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 123 }),
			canModifyAllDay: jest.fn().mockReturnValue(false),
			startDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event11Start
				})
			},
			endDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event11End
				})
			},
			hasComponent: jest.fn().mockReturnValue(false),
		}, {
			id: '1-2',
			status: 'CANCELLED',
			isAllDay: jest.fn().mockReturnValue(false),
			getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 456 }),
			canModifyAllDay: jest.fn().mockReturnValue(false),
			startDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event12Start
				})
			},
			endDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event12End
				})
			},
			hasComponent: jest.fn().mockReturnValue(false),
		}, {
			id: '1-3',
			status: 'TENTATIVE',
			isAllDay: jest.fn().mockReturnValue(false),
			getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 789 }),
			canModifyAllDay: jest.fn().mockReturnValue(false),
			startDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event13Start
				})
			},
			endDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event13End
				})
			},
			hasComponent: jest.fn().mockReturnValue(true),
		}]
		const eventComponentSet2 = [{
			id: '2-1',
			status: 'CONFIRMED',
			isAllDay: jest.fn().mockReturnValue(true),
			getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 101 }),
			canModifyAllDay: jest.fn().mockReturnValue(true),
			startDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event21Start
				})
			},
			endDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event21End
				})
			},
			hasComponent: jest.fn().mockReturnValue(false),
		}]
		const eventComponentSet4 = [{
			id: '3-1',
			status: 'CONFIRMED',
			isAllDay: jest.fn().mockReturnValue(false),
			getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 303 }),
			canModifyAllDay: jest.fn().mockReturnValue(true),
			startDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event31Start
				})
			},
			endDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event31End
				})
			},
			hasComponent: jest.fn().mockReturnValue(false),
			color: 'red',
		}]

		const calendarObjects = [{
			calendarObject: true,
			id: '1',
			getAllObjectsInTimeRange: jest.fn()
				.mockReturnValueOnce(eventComponentSet1),
		}, {
			calendarObject: true,
			id: '2',
			getAllObjectsInTimeRange: jest.fn()
				.mockReturnValueOnce(eventComponentSet2),
		}, {
			calendarObject: true,
			id: '3',
			getAllObjectsInTimeRange: jest.fn()
				.mockImplementationOnce(() => {
					throw new Error('Error while getting all objects in time-range')
				}),
		}, {
			calendarObject: true,
			id: '4',
			getAllObjectsInTimeRange: jest.fn()
				.mockReturnValueOnce(eventComponentSet4),
		}]
		const start = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2020, 0, 31, 59, 59, 59, 999))
		const timezone = { calendarJsTimezone: true, tzid: 'America/New_York' }
		const result = eventSourceFunction(calendarObjects, {
			order: 1337,
			displayName: 'Calendar displayname',
			id: 'Calendar id 456',
		}, start, end, timezone)

		expect(result).toEqual([
			{
				id: '1###1-1',
				title: 'Untitled event',
				allDay: false,
				start: event11Start,
				end: event11End,
				classNames: [],
				extendedProps: {
					objectId: '1',
					recurrenceId: 123,
					canModifyAllDay: false,
					calendarId: 'Calendar id 456',
					calendarName: 'Calendar displayname',
					calendarOrder: 1337,
					darkText: false,
				}
			},
			{
				id: '1###1-2',
				title: 'Untitled event',
				allDay: false,
				start: event12Start,
				end: event12End,
				classNames: [ 'fc-event-nc-cancelled' ],
				extendedProps: {
					objectId: '1',
					recurrenceId: 456,
					canModifyAllDay: false,
					calendarId: 'Calendar id 456',
					calendarName: 'Calendar displayname',
					calendarOrder: 1337,
					darkText: false,
				}
			},
			{
				id: '1###1-3',
				title: 'Untitled event',
				allDay: false,
				start: event13Start,
				end: event13End,
				classNames: [ 'fc-event-nc-tentative', 'fc-event-nc-alarms' ],
				extendedProps: {
					objectId: '1',
					recurrenceId: 789,
					canModifyAllDay: false,
					calendarId: 'Calendar id 456',
					calendarName: 'Calendar displayname',
					calendarOrder: 1337,
					darkText: false,
				}
			},
			{
				id: '2###2-1',
				title: 'Untitled event',
				allDay: true,
				start: event21Start,
				end: event21End,
				classNames: [],
				extendedProps: {
					objectId: '2',
					recurrenceId: 101,
					canModifyAllDay: true,
					calendarId: 'Calendar id 456',
					calendarName: 'Calendar displayname',
					calendarOrder: 1337,
					darkText: false,
				}
			},
			{
				id: '4###3-1',
				title: 'Untitled event',
				allDay: false,
				start: event31Start,
				end: event31End,
				classNames: [],
				extendedProps: {
					objectId: '4',
					recurrenceId: 303,
					canModifyAllDay: true,
					calendarId: 'Calendar id 456',
					calendarName: 'Calendar displayname',
					calendarOrder: 1337,
					darkText: false,
				},
				backgroundColor: '#ff0000',
				borderColor: '#ff0000',
				textColor: '#eeeeee',
			}
		])

		expect(eventComponentSet1[0].startDate.getInTimezone).toHaveBeenCalledTimes(1)
		expect(eventComponentSet1[0].startDate.getInTimezone).toHaveBeenNthCalledWith(1, timezone)
		expect(eventComponentSet1[0].endDate.getInTimezone).toHaveBeenCalledTimes(1)
		expect(eventComponentSet1[0].endDate.getInTimezone).toHaveBeenNthCalledWith(1, timezone)

		expect(eventComponentSet1[1].startDate.getInTimezone).toHaveBeenCalledTimes(1)
		expect(eventComponentSet1[1].startDate.getInTimezone).toHaveBeenNthCalledWith(1, timezone)
		expect(eventComponentSet1[1].endDate.getInTimezone).toHaveBeenCalledTimes(1)
		expect(eventComponentSet1[1].endDate.getInTimezone).toHaveBeenNthCalledWith(1, timezone)

		expect(eventComponentSet1[2].startDate.getInTimezone).toHaveBeenCalledTimes(1)
		expect(eventComponentSet1[2].startDate.getInTimezone).toHaveBeenNthCalledWith(1, timezone)
		expect(eventComponentSet1[2].endDate.getInTimezone).toHaveBeenCalledTimes(1)
		expect(eventComponentSet1[2].endDate.getInTimezone).toHaveBeenNthCalledWith(1, timezone)

		expect(eventComponentSet2[0].startDate.getInTimezone).toHaveBeenCalledTimes(1)
		expect(eventComponentSet2[0].startDate.getInTimezone).toHaveBeenNthCalledWith(1, timezone)
		expect(eventComponentSet2[0].endDate.getInTimezone).toHaveBeenCalledTimes(1)
		expect(eventComponentSet2[0].endDate.getInTimezone).toHaveBeenNthCalledWith(1, timezone)

		expect(eventComponentSet4[0].startDate.getInTimezone).toHaveBeenCalledTimes(1)
		expect(eventComponentSet4[0].startDate.getInTimezone).toHaveBeenNthCalledWith(1, timezone)
		expect(eventComponentSet4[0].endDate.getInTimezone).toHaveBeenCalledTimes(1)
		expect(eventComponentSet4[0].endDate.getInTimezone).toHaveBeenNthCalledWith(1, timezone)

		expect(translate).toHaveBeenCalledTimes(5)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Untitled event')
		expect(translate).toHaveBeenNthCalledWith(2, 'calendar', 'Untitled event')
		expect(translate).toHaveBeenNthCalledWith(3, 'calendar', 'Untitled event')
		expect(translate).toHaveBeenNthCalledWith(4, 'calendar', 'Untitled event')
		expect(translate).toHaveBeenNthCalledWith(5, 'calendar', 'Untitled event')

		expect(getHexForColorName).toHaveBeenCalledTimes(1)
		expect(getHexForColorName).toHaveBeenNthCalledWith(1, 'red')

		expect(generateTextColorForHex).toHaveBeenCalledTimes(1)
		expect(generateTextColorForHex).toHaveBeenNthCalledWith(1, '#ff0000')

		// Make sure the following dates have not been touched
		expect(event11Start.getFullYear()).toEqual(2020)
		expect(event11Start.getMonth()).toEqual(1)
		expect(event11Start.getDate()).toEqual(1)
		expect(event11Start.getHours()).toEqual(10)
		expect(event11Start.getMinutes()).toEqual(0)
		expect(event11Start.getSeconds()).toEqual(0)

		expect(event11End.getFullYear()).toEqual(2020)
		expect(event11End.getMonth()).toEqual(1)
		expect(event11End.getDate()).toEqual(1)
		expect(event11End.getHours()).toEqual(15)
		expect(event11End.getMinutes()).toEqual(0)
		expect(event11End.getSeconds()).toEqual(0)

		expect(event12Start.getFullYear()).toEqual(2020)
		expect(event12Start.getMonth()).toEqual(1)
		expect(event12Start.getDate()).toEqual(2)
		expect(event12Start.getHours()).toEqual(10)
		expect(event12Start.getMinutes()).toEqual(0)
		expect(event12Start.getSeconds()).toEqual(0)

		expect(event12End.getFullYear()).toEqual(2020)
		expect(event12End.getMonth()).toEqual(1)
		expect(event12End.getDate()).toEqual(2)
		expect(event12End.getHours()).toEqual(15)
		expect(event12End.getMinutes()).toEqual(0)
		expect(event12End.getSeconds()).toEqual(0)

		expect(event13Start.getFullYear()).toEqual(2020)
		expect(event13Start.getMonth()).toEqual(1)
		expect(event13Start.getDate()).toEqual(3)
		expect(event13Start.getHours()).toEqual(10)
		expect(event13Start.getMinutes()).toEqual(0)
		expect(event13Start.getSeconds()).toEqual(0)

		expect(event13End.getFullYear()).toEqual(2020)
		expect(event13End.getMonth()).toEqual(1)
		expect(event13End.getDate()).toEqual(3)
		expect(event13End.getHours()).toEqual(15)
		expect(event13End.getMinutes()).toEqual(0)
		expect(event13End.getSeconds()).toEqual(0)

		expect(event21Start.getFullYear()).toEqual(2020)
		expect(event21Start.getMonth()).toEqual(5)
		expect(event21Start.getDate()).toEqual(5)
		expect(event21Start.getHours()).toEqual(0)
		expect(event21Start.getMinutes()).toEqual(0)
		expect(event21Start.getSeconds()).toEqual(0)

		expect(event21End.getFullYear()).toEqual(2020)
		expect(event21End.getMonth()).toEqual(5)
		expect(event21End.getDate()).toEqual(6)
		expect(event21End.getHours()).toEqual(0)
		expect(event21End.getMinutes()).toEqual(0)
		expect(event21End.getSeconds()).toEqual(0)

		// Make sure the DTEND of the following has been modified by 1 second
		expect(event31Start.getFullYear()).toEqual(2020)
		expect(event31Start.getMonth()).toEqual(6)
		expect(event31Start.getDate()).toEqual(10)
		expect(event31Start.getHours()).toEqual(10)
		expect(event31Start.getMinutes()).toEqual(0)
		expect(event31Start.getSeconds()).toEqual(0)

		expect(event31End.getFullYear()).toEqual(2020)
		expect(event31End.getMonth()).toEqual(6)
		expect(event31End.getDate()).toEqual(10)
		expect(event31End.getHours()).toEqual(10)
		expect(event31End.getMinutes()).toEqual(0)
		expect(event31End.getSeconds()).toEqual(1)
	})

})
