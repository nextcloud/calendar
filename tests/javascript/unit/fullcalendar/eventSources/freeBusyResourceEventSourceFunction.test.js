/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { eventSourceFunction } from '../../../../../src/fullcalendar/eventSources/eventSourceFunction.js'
import {
	hexToRGB,
	isLight,
	generateTextColorForHex,
	getHexForColorName,
} from '../../../../../src/utils/color.js'
import { translate } from '@nextcloud/l10n'
import {getAllObjectsInTimeRange} from "../../../../../src/utils/calendarObject.js";
import { createPinia, setActivePinia } from 'pinia'
jest.mock('@nextcloud/l10n')
jest.mock('../../../../../src/utils/color.js')
jest.mock("../../../../../src/utils/calendarObject.js")

describe('fullcalendar/freeBusyResourceEventSourceFunction test suite', () => {

	beforeEach(() => {
		translate.mockClear()
		getHexForColorName.mockClear()
		generateTextColorForHex.mockClear()
		getAllObjectsInTimeRange.mockClear()
		setActivePinia(createPinia())
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
			name: 'VEVENT',
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
			getFirstPropertyFirstValue: jest.fn().mockReturnValue(null),
			getPropertyIterator: jest.fn().mockReturnValue([]),
		}, {
			name: 'VEVENT',
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
			title: 'Untitled\nmultiline\nevent',
			getFirstPropertyFirstValue: jest.fn().mockReturnValue(null),
			getPropertyIterator: jest.fn().mockReturnValue([]),
		}, {
			name: 'VEVENT',
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
			getFirstPropertyFirstValue: jest.fn().mockReturnValue(null),
			getPropertyIterator: jest.fn().mockReturnValue([]),
		}]
		const eventComponentSet2 = [{
			name: 'VEVENT',
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
			getFirstPropertyFirstValue: jest.fn().mockReturnValue(null),
			getPropertyIterator: jest.fn().mockReturnValue([]),
		}]
		const eventComponentSet4 = [{
			name: 'VEVENT',
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
			getFirstPropertyFirstValue: jest.fn().mockReturnValue(null),
			getPropertyIterator: jest.fn().mockReturnValue([]),
		}]

		getAllObjectsInTimeRange
			.mockReturnValueOnce(eventComponentSet1)
			.mockReturnValueOnce(eventComponentSet2)
			.mockImplementationOnce(() => {
				throw new Error('Error while getting all objects in time-range')
			})
			.mockReturnValueOnce(eventComponentSet4)

		const calendarObjects = [{
			calendarObject: true,
			dav: {
				url: 'url1',
			},
			id: '1',
		}, {
			calendarObject: true,
			dav: {
				url: 'url2',
			},
			id: '2',
		}, {
			calendarObject: true,
			dav: {
				url: 'url3',
			},
			id: '3',
		}, {
			calendarObject: true,
			dav: {
				url: 'url4',
			},
			id: '4',
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
					davUrl: 'url1',
					objectType: 'VEVENT',
					percent: null,
					description: undefined,
					location: undefined,
				}
			},
			{
				id: '1###1-2',
				title: 'Untitled multiline event',
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
					davUrl: 'url1',
					objectType: 'VEVENT',
					percent: null,
					description: undefined,
					location: undefined,
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
					davUrl: 'url1',
					objectType: 'VEVENT',
					percent: null,
					description: undefined,
					location: undefined,
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
					davUrl: 'url2',
					objectType: 'VEVENT',
					percent: null,
					description: undefined,
					location: undefined,
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
					davUrl: 'url4',
					objectType: 'VEVENT',
					percent: null,
					description: undefined,
					location: undefined,
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

		expect(translate).toHaveBeenCalledTimes(4)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Untitled event')
		expect(translate).toHaveBeenNthCalledWith(2, 'calendar', 'Untitled event')
		expect(translate).toHaveBeenNthCalledWith(3, 'calendar', 'Untitled event')
		expect(translate).toHaveBeenNthCalledWith(4, 'calendar', 'Untitled event')

		expect(getAllObjectsInTimeRange).toHaveBeenCalledTimes(4)
		expect(getAllObjectsInTimeRange).toHaveBeenNthCalledWith(1, calendarObjects[0], start, end)
		expect(getAllObjectsInTimeRange).toHaveBeenNthCalledWith(2, calendarObjects[1], start, end)
		expect(getAllObjectsInTimeRange).toHaveBeenNthCalledWith(3, calendarObjects[2], start, end)
		expect(getAllObjectsInTimeRange).toHaveBeenNthCalledWith(4, calendarObjects[3], start, end)

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

	it('should provide fc-events for tasks', () => {
		translate
			.mockImplementation((app, str) => str)
		getHexForColorName
			.mockImplementation(() => '#ff0000')
		generateTextColorForHex
			.mockImplementation(() => '#eeeeee')
		isLight
			.mockImplementation(() => false)

		const event1Start = new Date(2020, 1, 1, 10, 0, 0, 0);
		const event1End = new Date(2020, 1, 1, 15, 0, 0, 0);
		const event2Start = new Date(2020, 1, 2, 10, 0, 0, 0);
		const event2End = new Date(2020, 1, 2, 15, 0, 0, 0);
		const event3Start = new Date(2020, 1, 3, 10, 0, 0, 0);
		const event3End = new Date(2020, 1, 3, 15, 0, 0, 0);
		const event4Start = new Date(2020, 5, 5, 0, 0, 0, 0);
		const event4End = new Date(2020, 5, 6, 0, 0, 0, 0);
		const event5Start = new Date(2020, 6, 10, 10, 0, 0, 0);
		const event5End = new Date(2020, 6, 10, 10, 0, 0, 0);

		const eventComponentSet = [{
			name: 'VTODO',
			id: '1',
			// To title on purpose
			isAllDay: jest.fn().mockReturnValue(false),
			getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 123 }),
			canModifyAllDay: jest.fn().mockReturnValue(false),
			startDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event1Start
				})
			},
			endDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event1End
				})
			},
			hasComponent: jest.fn().mockReturnValue(false),
			percent: null,
			getFirstPropertyFirstValue: jest.fn().mockReturnValue(null),
			getPropertyIterator: jest.fn().mockReturnValue([]),
		}, {
			name: 'VTODO',
			id: '2',
			// To title on purpose
			isAllDay: jest.fn().mockReturnValue(false),
			getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 123 }),
			canModifyAllDay: jest.fn().mockReturnValue(false),
			startDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event2Start
				})
			},
			endDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event2End
				})
			},
			hasComponent: jest.fn().mockReturnValue(false),
			percent: null,
			getFirstPropertyFirstValue: jest.fn().mockReturnValue(null),
			getPropertyIterator: jest.fn().mockReturnValue([]),
		}, {
			name: 'VTODO',
			id: '3',
			// To title on purpose
			isAllDay: jest.fn().mockReturnValue(false),
			getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 123 }),
			canModifyAllDay: jest.fn().mockReturnValue(false),
			startDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event3Start
				})
			},
			endDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event3End
				})
			},
			hasComponent: jest.fn().mockReturnValue(false),
			percent: 99,
			getFirstPropertyFirstValue: jest.fn().mockReturnValue(null),
			getPropertyIterator: jest.fn().mockReturnValue([]),
		}, {
			name: 'VTODO',
			id: '4',
			// To title on purpose
			isAllDay: jest.fn().mockReturnValue(false),
			getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 123 }),
			canModifyAllDay: jest.fn().mockReturnValue(false),
			startDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event4Start
				})
			},
			endDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event4End
				})
			},
			hasComponent: jest.fn().mockReturnValue(false),
			title: 'This task has a title',
			percent: null,
			getFirstPropertyFirstValue: jest.fn().mockReturnValue(null),
			getPropertyIterator: jest.fn().mockReturnValue([]),
		}, {
			name: 'VTODO',
			id: '5',
			// To title on purpose
			isAllDay: jest.fn().mockReturnValue(false),
			getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 123 }),
			canModifyAllDay: jest.fn().mockReturnValue(false),
			startDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event5Start
				})
			},
			endDate: {
				getInTimezone: jest.fn().mockReturnValue({
					jsDate: event5End
				})
			},
			hasComponent: jest.fn().mockReturnValue(false),
			title: 'This task has a title and percent',
			percent: 99,
			getFirstPropertyFirstValue: jest.fn().mockReturnValue(null),
			getPropertyIterator: jest.fn().mockReturnValue([]),
		}, {
			name: 'VTODO',
			id: '6',
			// To title on purpose
			isAllDay: jest.fn().mockReturnValue(false),
			getReferenceRecurrenceId: jest.fn().mockReturnValue({ unixTime: 123 }),
			canModifyAllDay: jest.fn().mockReturnValue(false),
			hasComponent: jest.fn().mockReturnValue(false),
			title: 'Task without Due',
			startDate: null,
			endDate: null,
			percent: null,
			getFirstPropertyFirstValue: jest.fn().mockReturnValue(null),
			getPropertyIterator: jest.fn().mockReturnValue([]),
		}]

		getAllObjectsInTimeRange
			.mockReturnValueOnce(eventComponentSet)

		const calendarObjects = [{
			calendarObject: true,
			dav: {
				url: 'url1',
			},
			id: '1',
		}]
		const start = new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0))
		const end = new Date(Date.UTC(2020, 0, 31, 59, 59, 59, 999))
		const timezone = { calendarJsTimezone: true, tzid: 'America/New_York' }
		const result = eventSourceFunction(calendarObjects, {
			order: 1337,
			displayName: 'Calendar displayname',
			id: 'Calendar id 456',
		}, start, end, timezone)

		expect(result).toEqual([{
			allDay: false,
			classNames: [
				'fc-event-nc-task',
			],
			end: event1End,
			extendedProps: {
				calendarId: 'Calendar id 456',
				calendarName: 'Calendar displayname',
				calendarOrder: 1337,
				canModifyAllDay: false,
				darkText: false,
				davUrl: 'url1',
				objectId: '1',
				objectType: 'VTODO',
				percent: null,
				recurrenceId: 123,
				description: undefined,
				location: undefined,
			},
			id: '1###1',
			start: event1End,
			title: 'Untitled task',
		}, {
			allDay: false,
			classNames: [
				'fc-event-nc-task',
			],
			end: event2End,
			extendedProps: {
				calendarId: 'Calendar id 456',
				calendarName: 'Calendar displayname',
				calendarOrder: 1337,
				canModifyAllDay: false,
				darkText: false,
				davUrl: 'url1',
				objectId: '1',
				objectType: 'VTODO',
				percent: null,
				recurrenceId: 123,
				description: undefined,
				location: undefined,
			},
			id: '1###2',
			start: event2End,
			title: 'Untitled task',
		}, {
			allDay: false,
			classNames: [
				'fc-event-nc-task',
			],
			end: event3End,
			extendedProps: {
				calendarId: 'Calendar id 456',
				calendarName: 'Calendar displayname',
				calendarOrder: 1337,
				canModifyAllDay: false,
				darkText: false,
				davUrl: 'url1',
				objectId: '1',
				objectType: 'VTODO',
				percent: 99,
				recurrenceId: 123,
				description: undefined,
				location: undefined,
			},
			id: '1###3',
			start: event3End,
			title: 'Untitled task (99%)',
		}, {
			allDay: false,
			classNames: [
				'fc-event-nc-task',
			],
			end: event4End,
			extendedProps: {
				calendarId: 'Calendar id 456',
				calendarName: 'Calendar displayname',
				calendarOrder: 1337,
				canModifyAllDay: false,
				darkText: false,
				davUrl: 'url1',
				objectId: '1',
				objectType: 'VTODO',
				percent: null,
				recurrenceId: 123,
				description: undefined,
				location: undefined,
			},
			id: '1###4',
			start: event4End,
			title: 'This task has a title',
		}, {
			allDay: false,
			classNames: [
				'fc-event-nc-task',
			],
			end: event5End,
			extendedProps: {
				calendarId: 'Calendar id 456',
				calendarName: 'Calendar displayname',
				calendarOrder: 1337,
				canModifyAllDay: false,
				darkText: false,
				davUrl: 'url1',
				objectId: '1',
				objectType: 'VTODO',
				percent: 99,
				recurrenceId: 123,
				description: undefined,
				location: undefined,
			},
			id: '1###5',
			start: event5End,
			title: 'This task has a title and percent (99%)',
		}])

		expect(eventComponentSet[0].startDate.getInTimezone).toHaveBeenCalledTimes(0)
		expect(eventComponentSet[0].endDate.getInTimezone).toHaveBeenCalledTimes(2)
		expect(eventComponentSet[0].endDate.getInTimezone).toHaveBeenNthCalledWith(1, timezone)
		expect(eventComponentSet[0].endDate.getInTimezone).toHaveBeenNthCalledWith(2, timezone)
		expect(eventComponentSet[1].startDate.getInTimezone).toHaveBeenCalledTimes(0)
		expect(eventComponentSet[1].endDate.getInTimezone).toHaveBeenCalledTimes(2)
		expect(eventComponentSet[1].endDate.getInTimezone).toHaveBeenNthCalledWith(1, timezone)
		expect(eventComponentSet[1].endDate.getInTimezone).toHaveBeenNthCalledWith(2, timezone)
		expect(eventComponentSet[2].startDate.getInTimezone).toHaveBeenCalledTimes(0)
		expect(eventComponentSet[2].endDate.getInTimezone).toHaveBeenCalledTimes(2)
		expect(eventComponentSet[2].endDate.getInTimezone).toHaveBeenNthCalledWith(1, timezone)
		expect(eventComponentSet[2].endDate.getInTimezone).toHaveBeenNthCalledWith(2, timezone)
		expect(eventComponentSet[3].startDate.getInTimezone).toHaveBeenCalledTimes(0)
		expect(eventComponentSet[3].endDate.getInTimezone).toHaveBeenCalledTimes(2)
		expect(eventComponentSet[3].endDate.getInTimezone).toHaveBeenNthCalledWith(1, timezone)
		expect(eventComponentSet[3].endDate.getInTimezone).toHaveBeenNthCalledWith(2, timezone)
		expect(eventComponentSet[4].startDate.getInTimezone).toHaveBeenCalledTimes(0)
		expect(eventComponentSet[4].endDate.getInTimezone).toHaveBeenCalledTimes(2)
		expect(eventComponentSet[4].endDate.getInTimezone).toHaveBeenNthCalledWith(1, timezone)
		expect(eventComponentSet[4].endDate.getInTimezone).toHaveBeenNthCalledWith(2, timezone)

		expect(translate).toHaveBeenCalledTimes(3)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Untitled task')
		expect(translate).toHaveBeenNthCalledWith(2, 'calendar', 'Untitled task')
		expect(translate).toHaveBeenNthCalledWith(3, 'calendar', 'Untitled task')

		expect(getAllObjectsInTimeRange).toHaveBeenCalledTimes(1)
		expect(getAllObjectsInTimeRange).toHaveBeenNthCalledWith(1, calendarObjects[0], start, end)

		expect(getHexForColorName).toHaveBeenCalledTimes(0)
		expect(generateTextColorForHex).toHaveBeenCalledTimes(0)
	})

})
