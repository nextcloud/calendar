/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import {
	getDefaultCalendarObjectObject,
	mapCalendarJsToCalendarObject,
	mapCDavObjectToCalendarObject
} from "../../../../src/models/calendarObject.js";
import {CalendarComponent, FreeBusyComponent, getParserManager} from "@nextcloud/calendar-js";

describe('Test suite: Calendar object model (models/calendarObject.js)', () => {

	it('should return a default calendarObject object', () => {
		expect(getDefaultCalendarObjectObject()).toEqual({
			calendarId: null,
			dav: null,
			calendarComponent: null,
			uid: null,
			uri: null,
			objectType: null,
			isEvent: false,
			isJournal: false,
			isTodo: false,
			existsOnServer: false,
			id: null,
		})
	})

	it('should fill up an object with default values', () => {
		expect(getDefaultCalendarObjectObject({
			calendarId: 'foo',
			otherProp: 'bar',
		})).toEqual({
			calendarId: 'foo',
			dav: null,
			calendarComponent: null,
			uid: null,
			uri: null,
			objectType: null,
			isEvent: false,
			isJournal: false,
			isTodo: false,
			existsOnServer: false,
			otherProp: 'bar',
			id: null,
		})
	})

	it('should map a c-dav calendar-object to calendar object - throw error for empty string', () => {
		const dav = {
			url: 'cdav-url',
			data: '',
		}

		expect(() => mapCDavObjectToCalendarObject(dav, 'calendar-id-123'))
			.toThrowError(/^Empty calendar object$/);
	})

	it('should map a c-dav calendar-object to calendar object - throw error for empty calendar', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars/vcalendar-empty'),
		}

		expect(() => mapCDavObjectToCalendarObject(dav, 'calendar-id-123'))
			.toThrowError(/^Empty calendar object$/);
	})

	it('should map a c-dav calendar-object to calendar object - throw error for no vobjects', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars/vcalendar-without-vobjects'),
		}

		expect(() => mapCDavObjectToCalendarObject(dav, 'calendar-id-123'))
			.toThrowError(/^Empty calendar object$/);
	})

	it('should map c-dav calendar object to calendar object - vevent', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars/vcalendar-event-timed'),
		}

		expect(mapCDavObjectToCalendarObject(dav, 'calendar-id-123')).toEqual({
			id: 'Y2Rhdi11cmw=',
			calendarComponent: expect.any(CalendarComponent),
			calendarId: 'calendar-id-123',
			dav,
			existsOnServer: true,
			isEvent: true,
			isJournal: false,
			isTodo: false,
			objectType: 'VEVENT',
			uid: '0AD16F58-01B3-463B-A215-FD09FC729A02',
			uri: 'cdav-url',
		})
	})

	it('should map c-dav calendar object to calendar object - vjournal', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars/vcalendar-journal'),
		}

		expect(mapCDavObjectToCalendarObject(dav, 'calendar-id-123')).toEqual({
			id: 'Y2Rhdi11cmw=',
			calendarComponent: expect.any(CalendarComponent),
			calendarId: 'calendar-id-123',
			dav,
			existsOnServer: true,
			isEvent: false,
			isJournal: true,
			isTodo: false,
			objectType: 'VJOURNAL',
			uid: '19970901T130000Z-123405@example.com',
			uri: 'cdav-url',
		})
	})

	it('should map c-dav calendar object to calendar object - vtodo', () => {
		const dav = {
			url: 'cdav-url',
			data: loadICS('vcalendars/vcalendar-todo'),
		}

		expect(mapCDavObjectToCalendarObject(dav, 'calendar-id-123')).toEqual({
			id: 'Y2Rhdi11cmw=',
			calendarComponent: expect.any(CalendarComponent),
			calendarId: 'calendar-id-123',
			dav,
			existsOnServer: true,
			isEvent: false,
			isJournal: false,
			isTodo: true,
			objectType: 'VTODO',
			uid: '20070313T123432Z-456553@example.com',
			uri: 'cdav-url',
		})
	})

	it('should map a calendar-js calendar-object to calendar object - empty', () => {
		const calendarComponent = CalendarComponent.fromEmpty()

		expect(() => mapCalendarJsToCalendarObject(calendarComponent))
			.toThrowError(/^Calendar object without vobjects$/);
	})

	it('should map a calendar-js calendar-object to calendar object - throw error for no vobjects', () => {
		const calendarComponent = CalendarComponent.fromEmpty()
		calendarComponent.addComponent(new FreeBusyComponent('VFREEBUSY'))

		expect(() => mapCalendarJsToCalendarObject(calendarComponent))
			.toThrowError(/^Calendar object without vobjects$/);
	})

	it('should map a calendar-js calendar-object to calendar object - vevent', () => {
		const ics = loadICS('vcalendars/vcalendar-event-timed')
		const parser = getParserManager().getParserForFileType('text/calendar')
		parser.parse(ics)

		const calendarComponent = parser.getAllItems()[0]
		expect(mapCalendarJsToCalendarObject(calendarComponent)).toEqual({
			id: null,
			calendarComponent: expect.any(CalendarComponent),
			calendarId: null,
			dav: null,
			existsOnServer: false,
			isEvent: true,
			isJournal: false,
			isTodo: false,
			objectType: 'VEVENT',
			uid: '0AD16F58-01B3-463B-A215-FD09FC729A02',
			uri: null,
		})
	})

	it('should map a calendar-js calendar-object to calendar object - vjournal', () => {
		const ics = loadICS('vcalendars/vcalendar-journal')
		const parser = getParserManager().getParserForFileType('text/calendar')
		parser.parse(ics)

		const calendarComponent = parser.getAllItems()[0]
		expect(mapCalendarJsToCalendarObject(calendarComponent, 'calendar-id-123')).toEqual({
			id: null,
			calendarComponent: expect.any(CalendarComponent),
			calendarId: 'calendar-id-123',
			dav: null,
			existsOnServer: false,
			isEvent: false,
			isJournal: true,
			isTodo: false,
			objectType: 'VJOURNAL',
			uid: '19970901T130000Z-123405@example.com',
			uri: null,
		})
	})

	it('should map a calendar-js calendar-object to calendar object - vtodo', () => {
		const ics = loadICS('vcalendars/vcalendar-todo')
		const parser = getParserManager().getParserForFileType('text/calendar')
		parser.parse(ics)

		const calendarComponent = parser.getAllItems()[0]
		expect(mapCalendarJsToCalendarObject(calendarComponent)).toEqual({
			id: null,
			calendarComponent: expect.any(CalendarComponent),
			calendarId: null,
			dav: null,
			existsOnServer: false,
			isEvent: false,
			isJournal: false,
			isTodo: true,
			objectType: 'VTODO',
			uid: '20070313T123432Z-456553@example.com',
			uri: null,
		})
	})

})
