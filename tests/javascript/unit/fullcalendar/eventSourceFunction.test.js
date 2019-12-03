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
import { translate } from '@nextcloud/l10n'
jest.mock('@nextcloud/l10n')

describe('fullcalendar/eventSourceFunction test suite', () => {

	beforeEach(() => {
		translate.mockClear()
	})

	it('should provide fc-events', () => {
		translate
			.mockImplementation((app, str) => str)

		const eventComponentSet1 = [{
			id: '1-1',
			// To title on purpose
			isAllDay: jest.fn().mockReturnValue(false),
			getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 123 }),
			canModifyAllDay: jest.fn().mockReturnValue(false),
			startDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: 'js-date-1-1-start'
				})
			},
			endDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: 'js-date-1-1-end'
				})
			},
		}, {
			id: '1-2',
			status: 'CANCELLED',
			isAllDay: jest.fn().mockReturnValue(false),
			getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 456 }),
			canModifyAllDay: jest.fn().mockReturnValue(false),
			startDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: 'js-date-1-2-start'
				})
			},
			endDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: 'js-date-1-2-end'
				})
			},
		}, {
			id: '1-3',
			status: 'TENTATIVE',
			isAllDay: jest.fn().mockReturnValue(false),
			getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 789 }),
			canModifyAllDay: jest.fn().mockReturnValue(false),
			startDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: 'js-date-1-3-start'
				})
			},
			endDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: 'js-date-1-3-end'
				})
			},
		}]
		const eventComponentSet2 = [{
			id: '2-1',
			status: 'CONFIRMED',
			isAllDay: jest.fn().mockReturnValue(true),
			getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 101 }),
			canModifyAllDay: jest.fn().mockReturnValue(true),
			startDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: 'js-date-2-1-start'
				})
			},
			endDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: 'js-date-2-1-end'
				})
			},
		}]
		const eventComponentSet4 = [{
			id: '3-1',
			status: 'CONFIRMED',
			isAllDay: jest.fn().mockReturnValue(false),
			getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 303 }),
			canModifyAllDay: jest.fn().mockReturnValue(true),
			startDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: 'js-date-3-1-start'
				})
			},
			endDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: 'js-date-3-1-end'
				})
			},
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
				})
		}, {
			calendarObject: true,
			id: '4',
			getAllObjectsInTimeRange: jest.fn()
				.mockReturnValueOnce(eventComponentSet4),
		}]
		const start = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2019, 0, 31, 59, 59, 59, 999))
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
				start: 'js-date-1-1-start',
				end: 'js-date-1-1-end',
				classNames: [],
				extendedProps: {
					objectId: '1',
					recurrenceId: 123,
					canModifyAllDay: false,
					calendarId: 'Calendar id 456',
					calendarName: 'Calendar displayname',
					calendarOrder: 1337,
				}
			},
			{
				id: '1###1-2',
				title: 'Untitled event',
				allDay: false,
				start: 'js-date-1-2-start',
				end: 'js-date-1-2-end',
				classNames: [ 'fc-event-nc-cancelled' ],
				extendedProps: {
					objectId: '1',
					recurrenceId: 456,
					canModifyAllDay: false,
					calendarId: 'Calendar id 456',
					calendarName: 'Calendar displayname',
					calendarOrder: 1337,
				}
			},
			{
				id: '1###1-3',
				title: 'Untitled event',
				allDay: false,
				start: 'js-date-1-3-start',
				end: 'js-date-1-3-end',
				classNames: [ 'fc-event-nc-tentative' ],
				extendedProps: {
					objectId: '1',
					recurrenceId: 789,
					canModifyAllDay: false,
					calendarId: 'Calendar id 456',
					calendarName: 'Calendar displayname',
					calendarOrder: 1337,
				}
			},
			{
				id: '2###2-1',
				title: 'Untitled event',
				allDay: true,
				start: 'js-date-2-1-start',
				end: 'js-date-2-1-end',
				classNames: [],
				extendedProps: {
					objectId: '2',
					recurrenceId: 101,
					canModifyAllDay: true,
					calendarId: 'Calendar id 456',
					calendarName: 'Calendar displayname',
					calendarOrder: 1337,
				}
			},
			{
				id: '4###3-1',
				title: 'Untitled event',
				allDay: false,
				start: 'js-date-3-1-start',
				end: 'js-date-3-1-end',
				classNames: [],
				extendedProps: {
					objectId: '4',
					recurrenceId: 303,
					canModifyAllDay: true,
					calendarId: 'Calendar id 456',
					calendarName: 'Calendar displayname',
					calendarOrder: 1337,
				}
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
	})

})
