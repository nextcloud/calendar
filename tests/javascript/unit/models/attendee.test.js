/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {getDefaultAttendeeObject, mapAttendeePropertyToAttendeeObject} from "../../../../src/models/attendee.js";

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
})
