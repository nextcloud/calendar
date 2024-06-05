/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getDefaultEventObject, mapEventComponentToEventObject } from "../../../../src/models/event.js";
import { getDateFromDateTimeValue } from '../../../../src/utils/date.js'
import { getHexForColorName } from '../../../../src/utils/color.js'
import { mapAlarmComponentToAlarmObject } from '../../../../src/models/alarm.js'
import { mapAttendeePropertyToAttendeeObject } from '../../../../src/models/attendee.js'
import { getDefaultRecurrenceRuleObject, mapRecurrenceRuleValueToRecurrenceRuleObject } from '../../../../src/models/recurrenceRule.js'
import { DateTimeValue } from "@nextcloud/calendar-js";

jest.mock('../../../../src/utils/date.js')
jest.mock('../../../../src/utils/color.js')
jest.mock('../../../../src/models/alarm.js')
jest.mock('../../../../src/models/attendee.js')
jest.mock('../../../../src/models/recurrenceRule.js')

describe('Test suite: Event model (models/event.js)', () => {

	beforeEach(() => {
		getDateFromDateTimeValue.mockClear()
		getHexForColorName.mockClear()
		mapAlarmComponentToAlarmObject.mockClear()
		mapAttendeePropertyToAttendeeObject.mockClear()
		mapRecurrenceRuleValueToRecurrenceRuleObject.mockClear()
		getDefaultRecurrenceRuleObject.mockClear()
	})

	it('should return a default event object', () => {
		getDefaultRecurrenceRuleObject
			.mockReturnValueOnce({
				defaultRecurrenceObject: true
			})

		expect(getDefaultEventObject()).toEqual({
			eventComponent: null,
			title: null,
			startDate: null,
			startTimezoneId: null,
			endDate: null,
			endTimezoneId: null,
			isAllDay: false,
			canModifyAllDay: true,
			location: null,
			description: null,
			accessClass: null,
			status: null,
			timeTransparency: null,
			recurrenceRule: {
				defaultRecurrenceObject: true
			},
			hasMultipleRRules: false,
			isMasterItem: false,
			isRecurrenceException: false,
			forceThisAndAllFuture: false,
			canCreateRecurrenceException: false,
			attendees: [],
			organizer: null,
			alarms: [],
			customColor: null,
			categories: [],
			attachments: [],
		})

		expect(getDefaultRecurrenceRuleObject).toHaveBeenCalledTimes(1)
	})

	it('should fill up an object with default values', () => {
		getDefaultRecurrenceRuleObject
			.mockReturnValueOnce({
				defaultRecurrenceObject: true
			})

		expect(getDefaultEventObject({
			title: '123',
			otherProp: 'foo',
		})).toEqual({
			eventComponent: null,
			title: '123',
			startDate: null,
			startTimezoneId: null,
			endDate: null,
			endTimezoneId: null,
			isAllDay: false,
			canModifyAllDay: true,
			location: null,
			description: null,
			accessClass: null,
			status: null,
			timeTransparency: null,
			recurrenceRule: {
				defaultRecurrenceObject: true
			},
			hasMultipleRRules: false,
			isMasterItem: false,
			isRecurrenceException: false,
			forceThisAndAllFuture: false,
			canCreateRecurrenceException: false,
			attendees: [],
			organizer: null,
			alarms: [],
			customColor: null,
			categories: [],
			attachments: [],
			otherProp: 'foo',
		})

		expect(getDefaultRecurrenceRuleObject).toHaveBeenCalledTimes(1)
	})

	it('should map an event component to an event object (1/nnn)', () => {
		// Simple non-recurring event
		const recurrenceId = DateTimeValue.fromJSDate(new Date(Date.UTC(2016, 7, 16, 7, 0, 0)), true)
		const eventComponent = getEventComponentFromAsset('vcalendars/vcalendar-event-timed', recurrenceId)

		const mockDate1 = new Date()
		const mockDate2 = new Date()
		getDateFromDateTimeValue
			.mockReturnValueOnce(mockDate1)
			.mockReturnValueOnce(mockDate2)

		getDefaultRecurrenceRuleObject
			.mockReturnValueOnce({
				defaultRecurrenceObject: true
			})

		expect(mapEventComponentToEventObject(eventComponent)).toEqual({
			eventComponent,
			title: 'Test Europe Berlin',
			startDate: mockDate1,
			startTimezoneId: 'Europe/Berlin',
			endDate: mockDate2,
			endTimezoneId: 'Europe/Berlin',
			isAllDay: false,
			canModifyAllDay: true,
			location: null,
			description: null,
			accessClass: 'PUBLIC',
			status: null,
			timeTransparency: 'OPAQUE',
			recurrenceRule: {
				defaultRecurrenceObject: true
			},
			hasMultipleRRules: false,
			isMasterItem: true,
			isRecurrenceException: false,
			forceThisAndAllFuture: false,
			canCreateRecurrenceException: false,
			attendees: [],
			organizer: null,
			alarms: [],
			customColor: null,
			categories: [],
			attachments: [],
		})

		expect(getDateFromDateTimeValue).toHaveBeenCalledTimes(2)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(1, eventComponent.startDate)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(2, eventComponent.endDate)

		expect(getDefaultRecurrenceRuleObject).toHaveBeenCalledTimes(1)
	})

	it('should map an event component to an event object (2/nnn)', () => {
		// Simple non-recurring event with attendees and organizer
		const recurrenceId = DateTimeValue.fromJSDate(new Date(Date.UTC(2016, 7, 16, 7, 0, 0)), true)
		const eventComponent = getEventComponentFromAsset('vcalendars/vcalendar-event-attendees', recurrenceId)

		const mockDate1 = new Date()
		const mockDate2 = new Date()
		getDateFromDateTimeValue
			.mockReturnValueOnce(mockDate1)
			.mockReturnValueOnce(mockDate2)

		mapAttendeePropertyToAttendeeObject
			.mockReturnValueOnce('ATTENDEE1')
			.mockReturnValueOnce('ATTENDEE2')
			.mockReturnValueOnce('ATTENDEE3')
			.mockReturnValueOnce('ATTENDEE4')

		getDefaultRecurrenceRuleObject
			.mockReturnValueOnce({
				defaultRecurrenceObject: true
			})

		expect(mapEventComponentToEventObject(eventComponent)).toEqual({
			eventComponent,
			title: 'Test Europe Berlin',
			startDate: mockDate1,
			startTimezoneId: 'Europe/Berlin',
			endDate: mockDate2,
			endTimezoneId: 'Europe/Berlin',
			isAllDay: false,
			canModifyAllDay: true,
			location: null,
			description: null,
			accessClass: 'PUBLIC',
			status: null,
			timeTransparency: 'OPAQUE',
			recurrenceRule: {
				defaultRecurrenceObject: true
			},
			hasMultipleRRules: false,
			isMasterItem: true,
			isRecurrenceException: false,
			forceThisAndAllFuture: false,
			canCreateRecurrenceException: false,
			attendees: [
				'ATTENDEE1',
				'ATTENDEE2',
				'ATTENDEE3',
				'ATTENDEE4',
			],
			organizer: {
				attendeeProperty: eventComponent.getFirstProperty('ORGANIZER'),
				commonName: 'John Smith',
				uri: 'mailto:jsmith@example.com',
			},
			alarms: [],
			customColor: null,
			categories: [],
			attachments: []
		})

		expect(getDateFromDateTimeValue).toHaveBeenCalledTimes(2)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(1, eventComponent.startDate)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(2, eventComponent.endDate)

		const attendees = eventComponent.getAttendeeList()
		expect(mapAttendeePropertyToAttendeeObject).toHaveBeenCalledTimes(4)
		expect(mapAttendeePropertyToAttendeeObject).toHaveBeenNthCalledWith(1, attendees[0])
		expect(mapAttendeePropertyToAttendeeObject).toHaveBeenNthCalledWith(2, attendees[1])
		expect(mapAttendeePropertyToAttendeeObject).toHaveBeenNthCalledWith(3, attendees[2])
		expect(mapAttendeePropertyToAttendeeObject).toHaveBeenNthCalledWith(4, attendees[3])

		expect(getDefaultRecurrenceRuleObject).toHaveBeenCalledTimes(1)
	})

	it('should map an event component to an event object (3/nnn)', () => {
		// Simple non-recurring event with alarms
		const recurrenceId = DateTimeValue.fromJSDate(new Date(Date.UTC(2016, 7, 16, 7, 0, 0)), true)
		const eventComponent = getEventComponentFromAsset('vcalendars/vcalendar-event-alarms', recurrenceId)

		const mockDate1 = new Date()
		const mockDate2 = new Date()
		getDateFromDateTimeValue
			.mockReturnValueOnce(mockDate1)
			.mockReturnValueOnce(mockDate2)

		mapAlarmComponentToAlarmObject
			.mockReturnValueOnce('ALARM1')
			.mockReturnValueOnce('ALARM2')

		getDefaultRecurrenceRuleObject
			.mockReturnValueOnce({
				defaultRecurrenceObject: true
			})

		expect(mapEventComponentToEventObject(eventComponent)).toEqual({
			eventComponent,
			title: 'Test Europe Berlin',
			startDate: mockDate1,
			startTimezoneId: 'Europe/Berlin',
			endDate: mockDate2,
			endTimezoneId: 'Europe/Berlin',
			isAllDay: false,
			canModifyAllDay: true,
			location: null,
			description: null,
			accessClass: 'PUBLIC',
			status: null,
			timeTransparency: 'OPAQUE',
			recurrenceRule: {
				defaultRecurrenceObject: true
			},
			hasMultipleRRules: false,
			isMasterItem: true,
			isRecurrenceException: false,
			forceThisAndAllFuture: false,
			canCreateRecurrenceException: false,
			attendees: [],
			organizer: null,
			alarms: [
				'ALARM1',
				'ALARM2',
			],
			customColor: null,
			categories: [],
			attachments: [],
		})

		const alarms = eventComponent.getAlarmList()
		expect(mapAlarmComponentToAlarmObject).toHaveBeenCalledTimes(2)
		expect(mapAlarmComponentToAlarmObject).toHaveBeenNthCalledWith(1, alarms[0])
		expect(mapAlarmComponentToAlarmObject).toHaveBeenNthCalledWith(2, alarms[1])

		expect(getDefaultRecurrenceRuleObject).toHaveBeenCalledTimes(1)
	})

	it('should map an event component to an event object (4/nnn)', () => {
		// Simple non-recurring event with categories
		const recurrenceId = DateTimeValue.fromJSDate(new Date(Date.UTC(2016, 7, 16, 7, 0, 0)), true)
		const eventComponent = getEventComponentFromAsset('vcalendars/vcalendar-event-categories', recurrenceId)

		const mockDate1 = new Date()
		const mockDate2 = new Date()
		getDateFromDateTimeValue
			.mockReturnValueOnce(mockDate1)
			.mockReturnValueOnce(mockDate2)

		getDefaultRecurrenceRuleObject
			.mockReturnValueOnce({
				defaultRecurrenceObject: true
			})

		expect(mapEventComponentToEventObject(eventComponent)).toEqual({
			eventComponent,
			title: 'Test Europe Berlin',
			startDate: mockDate1,
			startTimezoneId: 'Europe/Berlin',
			endDate: mockDate2,
			endTimezoneId: 'Europe/Berlin',
			isAllDay: false,
			canModifyAllDay: true,
			location: null,
			description: null,
			accessClass: 'PUBLIC',
			status: null,
			timeTransparency: 'OPAQUE',
			recurrenceRule: {
				defaultRecurrenceObject: true
			},
			hasMultipleRRules: false,
			isMasterItem: true,
			isRecurrenceException: false,
			forceThisAndAllFuture: false,
			canCreateRecurrenceException: false,
			attendees: [],
			organizer: null,
			alarms: [],
			customColor: null,
			categories: ['BUSINESS', 'HUMAN RESOURCES'],
			attachments: [],
		})

		expect(getDateFromDateTimeValue).toHaveBeenCalledTimes(2)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(1, eventComponent.startDate)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(2, eventComponent.endDate)

		expect(getDefaultRecurrenceRuleObject).toHaveBeenCalledTimes(1)
	})

	it('should map an event component to an event object (5/nnn)', () => {
		// Simple non-recurring event with custom color
		const recurrenceId = DateTimeValue.fromJSDate(new Date(Date.UTC(2016, 7, 16, 7, 0, 0)), true)
		const eventComponent = getEventComponentFromAsset('vcalendars/vcalendar-event-custom-color', recurrenceId)

		const mockDate1 = new Date()
		const mockDate2 = new Date()
		getDateFromDateTimeValue
			.mockReturnValueOnce(mockDate1)
			.mockReturnValueOnce(mockDate2)

		getHexForColorName
			.mockReturnValueOnce('#eeffee')

		getDefaultRecurrenceRuleObject
			.mockReturnValueOnce({
				defaultRecurrenceObject: true
			})

		expect(mapEventComponentToEventObject(eventComponent)).toEqual({
			eventComponent,
			title: 'Test Europe Berlin',
			startDate: mockDate1,
			startTimezoneId: 'Europe/Berlin',
			endDate: mockDate2,
			endTimezoneId: 'Europe/Berlin',
			isAllDay: false,
			canModifyAllDay: true,
			location: null,
			description: null,
			accessClass: 'PUBLIC',
			status: null,
			timeTransparency: 'OPAQUE',
			recurrenceRule: {
				defaultRecurrenceObject: true
			},
			hasMultipleRRules: false,
			isMasterItem: true,
			isRecurrenceException: false,
			forceThisAndAllFuture: false,
			canCreateRecurrenceException: false,
			attendees: [],
			organizer: null,
			alarms: [],
			customColor: '#eeffee',
			categories: [],
			attachments: [],
		})

		expect(getDateFromDateTimeValue).toHaveBeenCalledTimes(2)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(1, eventComponent.startDate)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(2, eventComponent.endDate)

		expect(getHexForColorName).toHaveBeenCalledTimes(1)
		expect(getHexForColorName).toHaveBeenNthCalledWith(1, 'turquoise')

		expect(getDefaultRecurrenceRuleObject).toHaveBeenCalledTimes(1)
	})

	it('should map an event component to an event object (6/nnn)', () => {
		// Simple non-recurring event with custom color (unknown color)
		const recurrenceId = DateTimeValue.fromJSDate(new Date(Date.UTC(2016, 7, 16, 7, 0, 0)), true)
		const eventComponent = getEventComponentFromAsset('vcalendars/vcalendar-event-custom-color', recurrenceId)

		const mockDate1 = new Date()
		const mockDate2 = new Date()
		getDateFromDateTimeValue
			.mockReturnValueOnce(mockDate1)
			.mockReturnValueOnce(mockDate2)

		getHexForColorName
			.mockReturnValueOnce(null)

		getDefaultRecurrenceRuleObject
			.mockReturnValueOnce({
				defaultRecurrenceObject: true
			})

		expect(mapEventComponentToEventObject(eventComponent)).toEqual({
			eventComponent,
			title: 'Test Europe Berlin',
			startDate: mockDate1,
			startTimezoneId: 'Europe/Berlin',
			endDate: mockDate2,
			endTimezoneId: 'Europe/Berlin',
			isAllDay: false,
			canModifyAllDay: true,
			location: null,
			description: null,
			accessClass: 'PUBLIC',
			status: null,
			timeTransparency: 'OPAQUE',
			recurrenceRule: {
				defaultRecurrenceObject: true
			},
			hasMultipleRRules: false,
			isMasterItem: true,
			isRecurrenceException: false,
			forceThisAndAllFuture: false,
			canCreateRecurrenceException: false,
			attendees: [],
			organizer: null,
			alarms: [],
			customColor: null,
			categories: [],
			attachments: [],
		})

		expect(getDateFromDateTimeValue).toHaveBeenCalledTimes(2)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(1, eventComponent.startDate)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(2, eventComponent.endDate)

		expect(getHexForColorName).toHaveBeenCalledTimes(1)
		expect(getHexForColorName).toHaveBeenNthCalledWith(1, 'turquoise')

		expect(getDefaultRecurrenceRuleObject).toHaveBeenCalledTimes(1)
	})

	it('should map an event component to an event object (7/nnn)', () => {
		// Simple non-recurring event with floating time
		const recurrenceId = DateTimeValue.fromJSDate(new Date(Date.UTC(2016, 7, 16, 9, 0, 0)), true)
		const eventComponent = getEventComponentFromAsset('vcalendars/vcalendar-event-floating-time', recurrenceId)

		const mockDate1 = new Date()
		const mockDate2 = new Date()
		getDateFromDateTimeValue
			.mockReturnValueOnce(mockDate1)
			.mockReturnValueOnce(mockDate2)

		getDefaultRecurrenceRuleObject
			.mockReturnValueOnce({
				defaultRecurrenceObject: true
			})

		expect(mapEventComponentToEventObject(eventComponent)).toEqual({
			eventComponent,
			title: 'Test Europe Berlin',
			startDate: mockDate1,
			startTimezoneId: 'floating',
			endDate: mockDate2,
			endTimezoneId: 'floating',
			isAllDay: false,
			canModifyAllDay: true,
			location: null,
			description: null,
			accessClass: 'PUBLIC',
			status: null,
			timeTransparency: 'OPAQUE',
			recurrenceRule: {
				defaultRecurrenceObject: true
			},
			hasMultipleRRules: false,
			isMasterItem: true,
			isRecurrenceException: false,
			forceThisAndAllFuture: false,
			canCreateRecurrenceException: false,
			attendees: [],
			organizer: null,
			alarms: [],
			customColor: null,
			categories: [],
			attachments: [],
		})

		expect(getDateFromDateTimeValue).toHaveBeenCalledTimes(2)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(1, eventComponent.startDate)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(2, eventComponent.endDate)

		expect(getDefaultRecurrenceRuleObject).toHaveBeenCalledTimes(1)
	})

	it('should map an event component to an event object (8/nnn)', () => {
		// Simple non-recurring event with UTC
		const recurrenceId = DateTimeValue.fromJSDate(new Date(Date.UTC(2016, 7, 16, 9, 0, 0)), true)
		const eventComponent = getEventComponentFromAsset('vcalendars/vcalendar-event-utc-time', recurrenceId)

		const mockDate1 = new Date()
		const mockDate2 = new Date()
		getDateFromDateTimeValue
			.mockReturnValueOnce(mockDate1)
			.mockReturnValueOnce(mockDate2)

		getDefaultRecurrenceRuleObject
			.mockReturnValueOnce({
				defaultRecurrenceObject: true
			})

		expect(mapEventComponentToEventObject(eventComponent)).toEqual({
			eventComponent,
			title: 'Test Europe Berlin',
			startDate: mockDate1,
			startTimezoneId: 'UTC',
			endDate: mockDate2,
			endTimezoneId: 'UTC',
			isAllDay: false,
			canModifyAllDay: true,
			location: null,
			description: null,
			accessClass: 'PUBLIC',
			status: null,
			timeTransparency: 'OPAQUE',
			recurrenceRule: {
				defaultRecurrenceObject: true
			},
			hasMultipleRRules: false,
			isMasterItem: true,
			isRecurrenceException: false,
			forceThisAndAllFuture: false,
			canCreateRecurrenceException: false,
			attendees: [],
			organizer: null,
			alarms: [],
			customColor: null,
			categories: [],
			attachments: [],
		})

		expect(getDateFromDateTimeValue).toHaveBeenCalledTimes(2)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(1, eventComponent.startDate)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(2, eventComponent.endDate)

		expect(getDefaultRecurrenceRuleObject).toHaveBeenCalledTimes(1)
	})

	it('should map an event component to an event object (9/nnn)', () => {
		// Simple non-recurring event (allDay)
		const recurrenceId = DateTimeValue.fromJSDate(new Date(Date.UTC(2016, 9, 5, 0, 0, 0)), true)
		const eventComponent = getEventComponentFromAsset('vcalendars/vcalendar-event-allday', recurrenceId)

		const mockDate1 = new Date()
		const mockDate2 = new Date()
		getDateFromDateTimeValue
			.mockReturnValueOnce(mockDate1)
			.mockReturnValueOnce(mockDate2)

		getDefaultRecurrenceRuleObject
			.mockReturnValueOnce({
				defaultRecurrenceObject: true
			})

		expect(mapEventComponentToEventObject(eventComponent)).toEqual({
			eventComponent,
			title: 'allday event',
			startDate: mockDate1,
			startTimezoneId: 'floating',
			endDate: mockDate2,
			endTimezoneId: 'floating',
			isAllDay: true,
			canModifyAllDay: true,
			location: null,
			description: null,
			accessClass: 'PUBLIC',
			status: null,
			timeTransparency: 'TRANSPARENT',
			recurrenceRule: {
				defaultRecurrenceObject: true
			},
			hasMultipleRRules: false,
			isMasterItem: true,
			isRecurrenceException: false,
			forceThisAndAllFuture: false,
			canCreateRecurrenceException: false,
			attendees: [],
			organizer: null,
			alarms: [],
			customColor: null,
			categories: [],
			attachments: [],
		})

		expect(getDateFromDateTimeValue).toHaveBeenCalledTimes(2)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(1, eventComponent.startDate)
		// verify that DTEND was decremented by one day
		expect(getDateFromDateTimeValue.mock.calls[1][0].year).toEqual(2016)
		expect(getDateFromDateTimeValue.mock.calls[1][0].month).toEqual(10)
		expect(getDateFromDateTimeValue.mock.calls[1][0].day).toEqual(7)

		expect(getDefaultRecurrenceRuleObject).toHaveBeenCalledTimes(1)
	})

	it('should map an event component to an event object (10/nnn)', () => {
		// Recurring event (fork)
		const recurrenceId = DateTimeValue.fromJSDate(new Date(Date.UTC(2020, 2, 22, 14, 0, 0)), true)
		const eventComponent = getEventComponentFromAsset('vcalendars/vcalendar-event-recurring', recurrenceId)

		const mockDate1 = new Date()
		const mockDate2 = new Date()
		getDateFromDateTimeValue
			.mockReturnValueOnce(mockDate1)
			.mockReturnValueOnce(mockDate2)

		mapRecurrenceRuleValueToRecurrenceRuleObject
			.mockReturnValueOnce('RRULE1')

		getDefaultRecurrenceRuleObject
			.mockReturnValueOnce({
				defaultRecurrenceObject: true
			})

		expect(mapEventComponentToEventObject(eventComponent)).toEqual({
			eventComponent,
			title: 'TEST',
			startDate: mockDate1,
			startTimezoneId: 'Europe/Berlin',
			endDate: mockDate2,
			endTimezoneId: 'Europe/Berlin',
			isAllDay: false,
			canModifyAllDay: false,
			location: null,
			description: null,
			accessClass: 'PUBLIC',
			status: null,
			timeTransparency: 'OPAQUE',
			recurrenceRule: 'RRULE1',
			hasMultipleRRules: false,
			isMasterItem: false,
			isRecurrenceException: false,
			forceThisAndAllFuture: false,
			canCreateRecurrenceException: true,
			attendees: [],
			organizer: null,
			alarms: [],
			customColor: null,
			categories: [],
			attachments: [],
		})

		expect(getDateFromDateTimeValue).toHaveBeenCalledTimes(2)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(1, eventComponent.startDate)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(2, eventComponent.endDate)

		expect(mapRecurrenceRuleValueToRecurrenceRuleObject).toHaveBeenCalledTimes(1)
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject).toHaveBeenNthCalledWith(1, eventComponent.getFirstPropertyFirstValue('RRULE'), eventComponent.startDate)

		expect(getDefaultRecurrenceRuleObject).toHaveBeenCalledTimes(1)
	})

	it('should map an event component to an event object (11/nnn)', () => {
		// Recurring event (recurrence-exception)
		const recurrenceId = DateTimeValue.fromJSDate(new Date(Date.UTC(2020, 2, 15, 14, 0, 0)), true)
		const eventComponent = getEventComponentFromAsset('vcalendars/vcalendar-event-recurring', recurrenceId)

		const mockDate1 = new Date()
		const mockDate2 = new Date()
		getDateFromDateTimeValue
			.mockReturnValueOnce(mockDate1)
			.mockReturnValueOnce(mockDate2)

		getDefaultRecurrenceRuleObject
			.mockReturnValueOnce({
				defaultRecurrenceObject: true
			})

		expect(mapEventComponentToEventObject(eventComponent)).toEqual({
			eventComponent,
			title: 'TEST EX 2',
			startDate: mockDate1,
			startTimezoneId: 'Europe/Berlin',
			endDate: mockDate2,
			endTimezoneId: 'Europe/Berlin',
			isAllDay: false,
			canModifyAllDay: false,
			location: null,
			description: null,
			accessClass: 'PUBLIC',
			status: null,
			timeTransparency: 'OPAQUE',
			recurrenceRule: {
				defaultRecurrenceObject: true
			},
			hasMultipleRRules: false,
			isMasterItem: false,
			isRecurrenceException: true,
			forceThisAndAllFuture: false,
			canCreateRecurrenceException: false,
			attendees: [],
			organizer: null,
			alarms: [],
			customColor: null,
			categories: [],
			attachments: [],
		})

		expect(getDateFromDateTimeValue).toHaveBeenCalledTimes(2)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(1, eventComponent.startDate)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(2, eventComponent.endDate)

		expect(getDefaultRecurrenceRuleObject).toHaveBeenCalledTimes(1)
	})

	it('should map an event component to an event object (12/nnn)', () => {
		// Multiple Recurrence rules
		const recurrenceId = DateTimeValue.fromJSDate(new Date(Date.UTC(2016, 7, 16, 7, 0, 0)), true)
		const eventComponent = getEventComponentFromAsset('vcalendars/vcalendar-event-multiple-rrules', recurrenceId)

		const mockDate1 = new Date()
		const mockDate2 = new Date()
		getDateFromDateTimeValue
			.mockReturnValueOnce(mockDate1)
			.mockReturnValueOnce(mockDate2)

		mapRecurrenceRuleValueToRecurrenceRuleObject
			.mockReturnValueOnce('RRULE1')

		getDefaultRecurrenceRuleObject
			.mockReturnValueOnce({
				defaultRecurrenceObject: true
			})

		expect(mapEventComponentToEventObject(eventComponent)).toEqual({
			eventComponent,
			title: 'Test Europe Berlin',
			startDate: mockDate1,
			startTimezoneId: 'Europe/Berlin',
			endDate: mockDate2,
			endTimezoneId: 'Europe/Berlin',
			isAllDay: false,
			canModifyAllDay: false,
			location: null,
			description: null,
			accessClass: 'PUBLIC',
			status: null,
			timeTransparency: 'OPAQUE',
			recurrenceRule: 'RRULE1',
			hasMultipleRRules: true,
			isMasterItem: false,
			isRecurrenceException: false,
			forceThisAndAllFuture: false,
			canCreateRecurrenceException: true,
			attendees: [],
			organizer: null,
			alarms: [],
			customColor: null,
			categories: [],
			attachments: [],
		})

		expect(getDateFromDateTimeValue).toHaveBeenCalledTimes(2)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(1, eventComponent.startDate)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(2, eventComponent.endDate)

		expect(mapRecurrenceRuleValueToRecurrenceRuleObject).toHaveBeenCalledTimes(1)
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject).toHaveBeenNthCalledWith(1, eventComponent.getFirstPropertyFirstValue('RRULE'), eventComponent.startDate)

		expect(getDefaultRecurrenceRuleObject).toHaveBeenCalledTimes(1)
	})

	it('should map an event component to an event object (12/nnn)', () => {
		// recurring daily event
		const recurrenceId = DateTimeValue.fromJSDate(new Date(Date.UTC(2020, 3, 15, 0, 0, 0)), true)
		const eventComponent = getEventComponentFromAsset('vcalendars/vcalendar-event-recurring-allday', recurrenceId)

		const mockDate1 = new Date()
		const mockDate2 = new Date()
		getDateFromDateTimeValue
			.mockReturnValueOnce(mockDate1)
			.mockReturnValueOnce(mockDate2)

		mapRecurrenceRuleValueToRecurrenceRuleObject
			.mockReturnValueOnce('RRULE1')

		getDefaultRecurrenceRuleObject
			.mockReturnValueOnce({
				defaultRecurrenceObject: true
			})

		expect(mapEventComponentToEventObject(eventComponent)).toEqual({
			eventComponent,
			title: 'Weekly test',
			startDate: mockDate1,
			startTimezoneId: 'floating',
			endDate: mockDate2,
			endTimezoneId: 'floating',
			isAllDay: true,
			canModifyAllDay: false,
			location: null,
			description: null,
			accessClass: 'PUBLIC',
			status: null,
			timeTransparency: 'OPAQUE',
			recurrenceRule: 'RRULE1',
			hasMultipleRRules: false,
			isMasterItem: false,
			isRecurrenceException: false,
			forceThisAndAllFuture: false,
			canCreateRecurrenceException: true,
			attendees: [],
			organizer: null,
			alarms: [],
			customColor: null,
			categories: [],
			attachments: [],
		})

		expect(getDateFromDateTimeValue).toHaveBeenCalledTimes(2)
		expect(getDateFromDateTimeValue).toHaveBeenNthCalledWith(1, eventComponent.startDate)
		// verify that DTEND was decremented by one day
		expect(getDateFromDateTimeValue.mock.calls[1][0].year).toEqual(2020)
		expect(getDateFromDateTimeValue.mock.calls[1][0].month).toEqual(4)
		expect(getDateFromDateTimeValue.mock.calls[1][0].day).toEqual(15)

		expect(mapRecurrenceRuleValueToRecurrenceRuleObject).toHaveBeenCalledTimes(1)
		expect(mapRecurrenceRuleValueToRecurrenceRuleObject).toHaveBeenNthCalledWith(1, eventComponent.getFirstPropertyFirstValue('RRULE'), eventComponent.startDate)

		expect(getDefaultRecurrenceRuleObject).toHaveBeenCalledTimes(1)
	})
})
