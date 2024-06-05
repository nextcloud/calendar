/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
	getDefaultSchedulingObject,
	mapCalendarJsToSchedulingObject,
	mapCDavObjectToSchedulingObject
} from "../../../../src/models/schedulingObject.js";
import {CalendarComponent, getParserManager} from "@nextcloud/calendar-js";

describe('Test suite: Scheduling Object model (models/schedulingObject.js)', () => {

	it('should return a default scheduling object object', () => {
		expect(getDefaultSchedulingObject()).toEqual({
			id: null,
			dav: null,
			calendarComponent: null,
			uid: null,
			recurrenceId: null,
			uri: null,
			method: null,
			isPublish: false,
			isRequest: false,
			isReply: false,
			isAdd: false,
			isCancel: false,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: false,
			existsOnServer: false,
		})
	})

	it('should fill up an object with default values', () => {
		expect(getDefaultSchedulingObject({
			uid: '123',
			otherProp: 'foo',
		})).toEqual({
			id: null,
			dav: null,
			calendarComponent: null,
			uid: '123',
			recurrenceId: null,
			uri: null,
			method: null,
			isPublish: false,
			isRequest: false,
			isReply: false,
			isAdd: false,
			isCancel: false,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: false,
			existsOnServer: false,
			otherProp: 'foo',
		})
	})

	it('should map a calendar-js calendar-object to scheduling object - throw error for empty string', () => {
		const dav = {
			url: 'cdav-url',
			data: '',
		}

		expect(() => mapCDavObjectToSchedulingObject(dav))
			.toThrowError(/^Empty scheduling object$/);
	})

	it('should map a calendar-js calendar-object to scheduling object - empty', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars/vcalendar-empty'),
		}

		expect(() => mapCDavObjectToSchedulingObject(dav))
			.toThrowError(/^Empty scheduling object$/);
	})

	it('should map a calendar-js calendar-object to scheduling object - no method', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars/vcalendar-event-timed'),
		}

		expect(() => mapCDavObjectToSchedulingObject(dav))
			.toThrowError(/^Scheduling-object does not have method$/);
	})

	it('should map a calendar-js calendar-object to scheduling object - no vobjects nor freebusy', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars/vcalendar-without-vobjects'),
		}

		expect(() => mapCDavObjectToSchedulingObject(dav))
			.toThrowError(/^Empty scheduling object$/);
	})

	it('should map a calendar-js calendar-object to scheduling object - add', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars-scheduling/add'),
		}

		expect(mapCDavObjectToSchedulingObject(dav)).toEqual({
			id: 'Y2Rhdi11cmw=',
			dav,
			calendarComponent: expect.any(CalendarComponent),
			uid: '123456789@example.com',
			recurrenceId: null,
			uri: 'cdav-url',
			method: 'ADD',
			isPublish: false,
			isRequest: false,
			isReply: false,
			isAdd: true,
			isCancel: false,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: false,
			existsOnServer: true,
		})
	})

	it('should map a calendar-js calendar-object to scheduling object - cancel', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars-scheduling/cancel'),
		}

		expect(mapCDavObjectToSchedulingObject(dav)).toEqual({
			id: 'Y2Rhdi11cmw=',
			dav,
			calendarComponent: expect.any(CalendarComponent),
			uid: 'guid-1@example.com',
			recurrenceId: null,
			uri: 'cdav-url',
			method: 'CANCEL',
			isPublish: false,
			isRequest: false,
			isReply: false,
			isAdd: false,
			isCancel: true,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: false,
			existsOnServer: true,
		})
	})

	it('should map a calendar-js calendar-object to scheduling object - counter', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars-scheduling/counter'),
		}

		expect(mapCDavObjectToSchedulingObject(dav)).toEqual({
			id: 'Y2Rhdi11cmw=',
			dav,
			calendarComponent: expect.any(CalendarComponent),
			uid: 'guid-1@example.com',
			recurrenceId: expect.any(Date),
			uri: 'cdav-url',
			method: 'COUNTER',
			isPublish: false,
			isRequest: false,
			isReply: false,
			isAdd: false,
			isCancel: false,
			isRefresh: false,
			isCounter: true,
			isDeclineCounter: false,
			existsOnServer: true,
		})
	})

	it('should map a calendar-js calendar-object to scheduling object - declinecounter', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars-scheduling/declinecounter'),
		}

		expect(mapCDavObjectToSchedulingObject(dav)).toEqual({
			id: 'Y2Rhdi11cmw=',
			dav,
			calendarComponent: expect.any(CalendarComponent),
			uid: 'calsrv.example.com-873970198738777@example.com',
			recurrenceId: null,
			uri: 'cdav-url',
			method: 'DECLINECOUNTER',
			isPublish: false,
			isRequest: false,
			isReply: false,
			isAdd: false,
			isCancel: false,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: true,
			existsOnServer: true,
		})
	})

	it('should map a calendar-js calendar-object to scheduling object - freebusy-reply', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars-scheduling/freebusy-reply'),
		}

		expect(mapCDavObjectToSchedulingObject(dav)).toEqual({
			id: 'Y2Rhdi11cmw=',
			dav,
			calendarComponent: expect.any(CalendarComponent),
			uid: 'calsrv.example.com-873970198738777@example.com',
			recurrenceId: null,
			uri: 'cdav-url',
			method: 'REPLY',
			isPublish: false,
			isRequest: false,
			isReply: true,
			isAdd: false,
			isCancel: false,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: false,
			existsOnServer: true,
		})
	})

	it('should map a calendar-js calendar-object to scheduling object - freebusy-request', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars-scheduling/freebusy-request'),
		}

		expect(mapCDavObjectToSchedulingObject(dav)).toEqual({
			id: 'Y2Rhdi11cmw=',
			dav,
			calendarComponent: expect.any(CalendarComponent),
			uid: 'calsrv.example.com-873970198738777@example.com',
			recurrenceId: null,
			uri: 'cdav-url',
			method: 'REQUEST',
			isPublish: false,
			isRequest: true,
			isReply: false,
			isAdd: false,
			isCancel: false,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: false,
			existsOnServer: true,
		})
	})

	it('should map a calendar-js calendar-object to scheduling object - publish', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars-scheduling/publish'),
		}

		expect(mapCDavObjectToSchedulingObject(dav)).toEqual({
			id: 'Y2Rhdi11cmw=',
			dav,
			calendarComponent: expect.any(CalendarComponent),
			uid: null,
			recurrenceId: null,
			uri: 'cdav-url',
			method: 'PUBLISH',
			isPublish: true,
			isRequest: false,
			isReply: false,
			isAdd: false,
			isCancel: false,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: false,
			existsOnServer: true,
		})
	})

	it('should map a calendar-js calendar-object to scheduling object - refresh', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars-scheduling/refresh'),
		}

		expect(mapCDavObjectToSchedulingObject(dav)).toEqual({
			id: 'Y2Rhdi11cmw=',
			dav,
			calendarComponent: expect.any(CalendarComponent),
			uid: 'guid-1-12345@example.com',
			recurrenceId: null,
			uri: 'cdav-url',
			method: 'REFRESH',
			isPublish: false,
			isRequest: false,
			isReply: false,
			isAdd: false,
			isCancel: false,
			isRefresh: true,
			isCounter: false,
			isDeclineCounter: false,
			existsOnServer: true,
		})
	})

	it('should map a calendar-js calendar-object to scheduling object - reply', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars-scheduling/reply'),
		}

		expect(mapCDavObjectToSchedulingObject(dav)).toEqual({
			id: 'Y2Rhdi11cmw=',
			dav,
			calendarComponent: expect.any(CalendarComponent),
			uid: 'calsrv.example.com-873970198738777@example.com',
			recurrenceId: null,
			uri: 'cdav-url',
			method: 'REPLY',
			isPublish: false,
			isRequest: false,
			isReply: true,
			isAdd: false,
			isCancel: false,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: false,
			existsOnServer: true,
		})
	})

	it('should map a calendar-js calendar-object to scheduling object - request', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars-scheduling/request'),
		}

		expect(mapCDavObjectToSchedulingObject(dav)).toEqual({
			id: 'Y2Rhdi11cmw=',
			dav,
			calendarComponent: expect.any(CalendarComponent),
			uid: '123456789@example.com',
			recurrenceId: expect.any(Date),
			uri: 'cdav-url',
			method: 'REQUEST',
			isPublish: false,
			isRequest: true,
			isReply: false,
			isAdd: false,
			isCancel: false,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: false,
			existsOnServer: true,
		})
	})

	it('should map a calendar-js calendar-object to scheduling-object - no method', () => {
		const ics = loadICS('vcalendars/vcalendar-event-timed')
		const parser = getParserManager().getParserForFileType('text/calendar', {
			preserveMethod: true,
			processFreeBusy: true,
		})
		parser.parse(ics)

		const calendarComponent = parser.getAllItems()[0]
		expect(() => mapCalendarJsToSchedulingObject(calendarComponent))
			.toThrowError(/^Scheduling-object does not have method$/);
	})

	it('should map a calendar-js calendar-object to scheduling-object - add', () => {
		const ics = loadICS('vcalendars-scheduling/add')
		const parser = getParserManager().getParserForFileType('text/calendar', {
			preserveMethod: true,
			processFreeBusy: true,
		})
		parser.parse(ics)

		const calendarComponent = parser.getAllItems()[0]
		expect(mapCalendarJsToSchedulingObject(calendarComponent)).toEqual({
			id: null,
			dav: null,
			calendarComponent,
			uri: null,
			existsOnServer: false,
			method: 'ADD',
			isPublish: false,
			isRequest: false,
			isReply: false,
			isAdd: true,
			isCancel: false,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: false,
			uid: '123456789@example.com',
			recurrenceId: null,
		})
	})

	it('should map a calendar-js calendar-object to scheduling-object - cancel', () => {
		const ics = loadICS('vcalendars-scheduling/cancel')
		const parser = getParserManager().getParserForFileType('text/calendar', {
			preserveMethod: true,
			processFreeBusy: true,
		})
		parser.parse(ics)

		const calendarComponent = parser.getAllItems()[0]
		expect(mapCalendarJsToSchedulingObject(calendarComponent)).toEqual({
			id: null,
			dav: null,
			calendarComponent,
			uri: null,
			existsOnServer: false,
			method: 'CANCEL',
			isPublish: false,
			isRequest: false,
			isReply: false,
			isAdd: false,
			isCancel: true,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: false,
			uid: 'guid-1@example.com',
			recurrenceId: null,
		})
	})

	it('should map a calendar-js calendar-object to scheduling-object - counter', () => {
		const ics = loadICS('vcalendars-scheduling/counter')
		const parser = getParserManager().getParserForFileType('text/calendar', {
			preserveMethod: true,
			processFreeBusy: true,
		})
		parser.parse(ics)

		const calendarComponent = parser.getAllItems()[0]
		expect(mapCalendarJsToSchedulingObject(calendarComponent)).toEqual({
			id: null,
			dav: null,
			calendarComponent,
			uri: null,
			existsOnServer: false,
			method: 'COUNTER',
			isPublish: false,
			isRequest: false,
			isReply: false,
			isAdd: false,
			isCancel: false,
			isRefresh: false,
			isCounter: true,
			isDeclineCounter: false,
			uid: 'guid-1@example.com',
			recurrenceId: expect.any(Date),
		})
	})

	it('should map a calendar-js calendar-object to scheduling-object - declinecounter', () => {
		const ics = loadICS('vcalendars-scheduling/declinecounter')
		const parser = getParserManager().getParserForFileType('text/calendar', {
			preserveMethod: true,
			processFreeBusy: true,
		})
		parser.parse(ics)

		const calendarComponent = parser.getAllItems()[0]
		expect(mapCalendarJsToSchedulingObject(calendarComponent)).toEqual({
			id: null,
			dav: null,
			calendarComponent,
			uri: null,
			existsOnServer: false,
			method: 'DECLINECOUNTER',
			isPublish: false,
			isRequest: false,
			isReply: false,
			isAdd: false,
			isCancel: false,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: true,
			uid: 'calsrv.example.com-873970198738777@example.com',
			recurrenceId: null,
		})
	})

	it('should map a calendar-js calendar-object to scheduling-object - freebusy-reply', () => {
		const ics = loadICS('vcalendars-scheduling/freebusy-reply')
		const parser = getParserManager().getParserForFileType('text/calendar', {
			preserveMethod: true,
			processFreeBusy: true,
		})
		parser.parse(ics)

		const calendarComponent = parser.getAllItems()[0]
		expect(mapCalendarJsToSchedulingObject(calendarComponent)).toEqual({
			id: null,
			dav: null,
			calendarComponent,
			uri: null,
			existsOnServer: false,
			method: 'REPLY',
			isPublish: false,
			isRequest: false,
			isReply: true,
			isAdd: false,
			isCancel: false,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: false,
			uid: 'calsrv.example.com-873970198738777@example.com',
			recurrenceId: null,
		})
	})

	it('should map a calendar-js calendar-object to scheduling-object - freebusy-request', () => {
		const ics = loadICS('vcalendars-scheduling/freebusy-request')
		const parser = getParserManager().getParserForFileType('text/calendar', {
			preserveMethod: true,
			processFreeBusy: true,
		})
		parser.parse(ics)

		const calendarComponent = parser.getAllItems()[0]
		expect(mapCalendarJsToSchedulingObject(calendarComponent)).toEqual({
			id: null,
			dav: null,
			calendarComponent,
			uri: null,
			existsOnServer: false,
			method: 'REQUEST',
			isPublish: false,
			isRequest: true,
			isReply: false,
			isAdd: false,
			isCancel: false,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: false,
			uid: 'calsrv.example.com-873970198738777@example.com',
			recurrenceId: null,
		})
	})

	it('should map a calendar-js calendar-object to scheduling-object - publish', () => {
		const ics = loadICS('vcalendars-scheduling/publish')
		const parser = getParserManager().getParserForFileType('text/calendar', {
			preserveMethod: true,
			processFreeBusy: true,
		})
		parser.parse(ics)

		const calendarComponent = parser.getAllItems()[0]
		expect(mapCalendarJsToSchedulingObject(calendarComponent)).toEqual({
			id: null,
			dav: null,
			calendarComponent,
			uri: null,
			existsOnServer: false,
			method: 'PUBLISH',
			isPublish: true,
			isRequest: false,
			isReply: false,
			isAdd: false,
			isCancel: false,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: false,
			uid: null,
			recurrenceId: null,
		})
	})

	it('should map a calendar-js calendar-object to scheduling-object - refresh', () => {
		const ics = loadICS('vcalendars-scheduling/refresh')
		const parser = getParserManager().getParserForFileType('text/calendar', {
			preserveMethod: true,
			processFreeBusy: true,
		})
		parser.parse(ics)

		const calendarComponent = parser.getAllItems()[0]
		expect(mapCalendarJsToSchedulingObject(calendarComponent)).toEqual({
			id: null,
			dav: null,
			calendarComponent,
			uri: null,
			existsOnServer: false,
			method: 'REFRESH',
			isPublish: false,
			isRequest: false,
			isReply: false,
			isAdd: false,
			isCancel: false,
			isRefresh: true,
			isCounter: false,
			isDeclineCounter: false,
			uid: 'guid-1-12345@example.com',
			recurrenceId: null,
		})
	})

	it('should map a calendar-js calendar-object to scheduling-object - reply', () => {
		const ics = loadICS('vcalendars-scheduling/reply')
		const parser = getParserManager().getParserForFileType('text/calendar', {
			preserveMethod: true,
			processFreeBusy: true,
		})
		parser.parse(ics)

		const calendarComponent = parser.getAllItems()[0]
		expect(mapCalendarJsToSchedulingObject(calendarComponent)).toEqual({
			id: null,
			dav: null,
			calendarComponent,
			uri: null,
			existsOnServer: false,
			method: 'REPLY',
			isPublish: false,
			isRequest: false,
			isReply: true,
			isAdd: false,
			isCancel: false,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: false,
			uid: 'calsrv.example.com-873970198738777@example.com',
			recurrenceId: null,
		})
	})

	it('should map a calendar-js calendar-object to scheduling-object - request', () => {
		const ics = loadICS('vcalendars-scheduling/request')
		const parser = getParserManager().getParserForFileType('text/calendar', {
			preserveMethod: true,
			processFreeBusy: true,
		})
		parser.parse(ics)

		const calendarComponent = parser.getAllItems()[0]
		expect(mapCalendarJsToSchedulingObject(calendarComponent)).toEqual({
			id: null,
			dav: null,
			calendarComponent,
			uri: null,
			existsOnServer: false,
			method: 'REQUEST',
			isPublish: false,
			isRequest: true,
			isReply: false,
			isAdd: false,
			isCancel: false,
			isRefresh: false,
			isCounter: false,
			isDeclineCounter: false,
			uid: '123456789@example.com',
			recurrenceId: expect.any(Date),
		})
	})
})
