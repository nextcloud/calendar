/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {getDefaultAttendeeObject, mapAttendeePropertyToAttendeeObject, mapPrincipalObjectToAttendeeObject} from "../../../../src/models/attendee.js";
import { AttendeeProperty } from '@nextcloud/calendar-js'

describe('Test suite: Attendee model (models/attendee.js)', () => {

	it('should return a default attendee object', () => {
		expect(getDefaultAttendeeObject()).toEqual({
			attendeeProperty: null,
			commonName: null,
			member: null,
			calendarUserType: 'INDIVIDUAL',
			participationStatus: 'NEEDS-ACTION',
			role: 'REQ-PARTICIPANT',
			rsvp: false,
			uri: null,
		})
	})

	it('should fill up an object with default values', () => {
		expect(getDefaultAttendeeObject({
			participationStatus: 'ACCEPTED',
			otherProp: 'foo',
		})).toEqual({
			attendeeProperty: null,
			commonName: null,
			member: null,
			calendarUserType: 'INDIVIDUAL',
			participationStatus: 'ACCEPTED',
			role: 'REQ-PARTICIPANT',
			rsvp: false,
			uri: null,
			otherProp: 'foo',
		})
	})

	it('should properly load an attendee (1/7)', () => {
		const attendeeProperty = getAttendeePropertyFromAsset('attendees/attendee1')
		const attendeeModel = mapAttendeePropertyToAttendeeObject(attendeeProperty)

		expect(attendeeModel).toEqual({
			attendeeProperty,
			commonName: null,
			member: null,
			calendarUserType: 'INDIVIDUAL',
			participationStatus: 'NEEDS-ACTION',
			role: 'REQ-PARTICIPANT',
			rsvp: true,
			uri: 'mailto:jsmith@example.com',
		})
	})

	it('should properly load an attendee (2/7)', () => {
		const attendeeProperty = getAttendeePropertyFromAsset('attendees/attendee2')
		const attendeeModel = mapAttendeePropertyToAttendeeObject(attendeeProperty)

		expect(attendeeModel).toEqual({
			attendeeProperty,
			commonName: null,
			member: null,
			calendarUserType: 'GROUP',
			participationStatus: 'NEEDS-ACTION',
			role: 'REQ-PARTICIPANT',
			rsvp: false,
			uri: 'mailto:ietf-calsch@example.org',
		})
	})

	it('should properly load an attendee (3/7)', () => {
		const attendeeProperty = getAttendeePropertyFromAsset('attendees/attendee3')
		const attendeeModel = mapAttendeePropertyToAttendeeObject(attendeeProperty)

		expect(attendeeModel).toEqual({
			attendeeProperty,
			commonName: null,
			member: null,
			calendarUserType: 'INDIVIDUAL',
			participationStatus: 'DECLINED',
			role: 'REQ-PARTICIPANT',
			rsvp: false,
			uri: 'mailto:jsmith@example.com',
		})
	})

	it('should properly load an attendee (4/7)', () => {
		const attendeeProperty = getAttendeePropertyFromAsset('attendees/attendee4')
		const attendeeModel = mapAttendeePropertyToAttendeeObject(attendeeProperty)

		expect(attendeeModel).toEqual({
			attendeeProperty,
			commonName: null,
			member: null,
			calendarUserType: 'INDIVIDUAL',
			participationStatus: 'NEEDS-ACTION',
			role: 'CHAIR',
			rsvp: false,
			uri: 'mailto:mrbig@example.com',
		})
	})

	it('should properly load an attendee (5/7)', () => {
		const attendeeProperty = getAttendeePropertyFromAsset('attendees/attendee5')
		const attendeeModel = mapAttendeePropertyToAttendeeObject(attendeeProperty)

		expect(attendeeModel).toEqual({
			attendeeProperty,
			commonName: 'Henry Cabot',
			member: null,
			calendarUserType: 'INDIVIDUAL',
			participationStatus: 'TENTATIVE',
			role: 'REQ-PARTICIPANT',
			rsvp: false,
			uri: 'mailto:hcabot@example.com',
		})
	})

	it('should properly load an attendee (6/7)', () => {
		const attendeeProperty = getAttendeePropertyFromAsset('attendees/attendee6')
		const attendeeModel = mapAttendeePropertyToAttendeeObject(attendeeProperty)

		expect(attendeeModel).toEqual({
			attendeeProperty,
			commonName: 'The Big Cheese',
			member: null,
			calendarUserType: 'INDIVIDUAL',
			participationStatus: 'DELEGATED',
			role: 'NON-PARTICIPANT',
			rsvp: false,
			uri: 'mailto:iamboss@example.com',
		})
	})

	it('should properly load an attendee (7/7)', () => {
		const attendeeProperty = getAttendeePropertyFromAsset('attendees/attendee7')
		const attendeeModel = mapAttendeePropertyToAttendeeObject(attendeeProperty)

		expect(attendeeModel).toEqual({
			attendeeProperty,
			commonName: 'Jane Doe',
			member: null,
			calendarUserType: 'INDIVIDUAL',
			participationStatus: 'ACCEPTED',
			role: 'REQ-PARTICIPANT',
			rsvp: false,
			uri: 'mailto:jdoe@example.com',
		})
	})

	it('should map a principal object to an attendee object', () => {
		const principalModel = {
			id: 'L3JlbW90ZS5waHAvZGF2L3ByaW5jaXBhbHMvY2FsZW5kYXItcm9vbXMvcm9vbS0xMjMv',
			dav: {},
			calendarUserType: 'ROOM',
			principalScheme: 'principal:principals/calendar-rooms/room-123',
			emailAddress: 'room-123@example.com',
			displayname: 'ROOM 123',
			url: '/remote.php/dav/principals/calendar-rooms/room-123/',
			isUser: false,
			isGroup: false,
			isCircle: false,
			isCalendarResource: false,
			isCalendarRoom: true,
			principalId: 'room-123',
			userId: null,
		}

		const attendeeProperty = new AttendeeProperty('ATTENDEE')
		attendeeProperty.commonName = 'ROOM 123'
		attendeeProperty.email = 'room-123@example.com'
		attendeeProperty.userType = 'ROOM'

		const actual = mapPrincipalObjectToAttendeeObject(principalModel)
		expect(actual).toMatchObject({
			commonName: 'ROOM 123',
			member: null,
			calendarUserType: 'ROOM',
			participationStatus: 'NEEDS-ACTION',
			role: 'REQ-PARTICIPANT',
			rsvp: false,
			uri: 'mailto:room-123@example.com',
		})
		expect(actual.attendeeProperty.toString()).toBe(attendeeProperty.toString())
	})

	it('should map a principal object to an attendee object (organizer)', () => {
		const principalModel = {
			id: 'L3JlbW90ZS5waHAvZGF2L3ByaW5jaXBhbHMvY2FsZW5kYXItcmVzb3VyY2VzL3Byb2plY3Rvci0xMjMv',
			dav: {},
			calendarUserType: 'RESOURCE',
			principalScheme: 'principal:principals/calendar-resources/projector-123',
			emailAddress: 'projector-123@example.com',
			displayname: 'Projector 123',
			url: '/remote.php/dav/principals/calendar-resources/projector-123/',
			isUser: false,
			isGroup: false,
			isCircle: false,
			isCalendarResource: true,
			isCalendarRoom: false,
			principalId: 'projector-123',
			userId: null,
		}

		const attendeeProperty = new AttendeeProperty('ORGANIZER')
		attendeeProperty.commonName = 'Projector 123'
		attendeeProperty.email = 'projector-123@example.com'
		attendeeProperty.userType = 'RESOURCE'

		const actual = mapPrincipalObjectToAttendeeObject(principalModel, true)
		expect(actual).toMatchObject({
			commonName: 'Projector 123',
			member: null,
			calendarUserType: 'RESOURCE',
			participationStatus: 'NEEDS-ACTION',
			role: 'REQ-PARTICIPANT',
			rsvp: false,
			uri: 'mailto:projector-123@example.com',
		})
		expect(actual.attendeeProperty.toString()).toBe(attendeeProperty.toString())
	})
})
