/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {getDefaultPrincipalObject, mapDavToPrincipal} from "../../../../src/models/principal.js";

describe('Test suite: Principal model (models/principal.js)', () => {

	it('should return a default principal object', () => {
		expect(getDefaultPrincipalObject()).toEqual({
			id: null,
			calendarUserType: 'INDIVIDUAL',
			emailAddress: null,
			displayname: null,
			principalScheme: null,
			userId: null,
			url: null,
			dav: null,
			isCircle: false,
			isUser: false,
			isGroup: false,
			isCalendarResource: false,
			isCalendarRoom: false,
			principalId: null,
			scheduleDefaultCalendarUrl: null,
		})
	})

	it('should fill up an object with default values', () => {
		expect(getDefaultPrincipalObject({
			principalId: 'bar',
			otherProp: 'foo',
		})).toEqual({
			id: null,
			calendarUserType: 'INDIVIDUAL',
			emailAddress: null,
			displayname: null,
			principalScheme: null,
			userId: null,
			url: null,
			dav: null,
			isCircle: false,
			isUser: false,
			isGroup: false,
			isCalendarResource: false,
			isCalendarRoom: false,
			principalId: 'bar',
			otherProp: 'foo',
			scheduleDefaultCalendarUrl: null,
		})
	})

	it('should properly map a user-principal to principal-object', () => {
		const dav = {
			addressBookHomes: undefined,
			calendarHomes: ['/remote.php/dav/calendars/jane.doe'],
			calendarUserAddressSet: [],
			calendarUserType: 'INDIVIDUAL',
			displayname: 'Jane Doe',
			email: 'jane.doe@example.com',
			principalScheme: 'principal:principals/users/jane.doe',
			principalUrl: '/remote.php/dav/principals/users/jane.doe/',
			scheduleInbox: null,
			scheduleOutbox: null,
			url: '/remote.php/dav/principals/users/jane.doe/',
			userId: 'legacy-jane-doe-uid'
		}

		expect(mapDavToPrincipal(dav)).toEqual({
			id: 'L3JlbW90ZS5waHAvZGF2L3ByaW5jaXBhbHMvdXNlcnMvamFuZS5kb2Uv',
			dav,
			calendarUserType: 'INDIVIDUAL',
			principalScheme: 'principal:principals/users/jane.doe',
			emailAddress: 'jane.doe@example.com',
			displayname: 'Jane Doe',
			url: '/remote.php/dav/principals/users/jane.doe/',
			isUser: true,
			isGroup: false,
			isCircle: false,
			isCalendarResource: false,
			isCalendarRoom: false,
			principalId: 'jane.doe',
			userId: 'legacy-jane-doe-uid',
		})
	})

	it('should properly map a group-principal to principal-object', () => {
		const dav = {
			addressBookHomes: undefined,
			calendarHomes: [],
			calendarUserAddressSet: [],
			calendarUserType: 'GROUP',
			displayname: 'Jane Doe',
			email: null,
			principalScheme: 'principal:principals/groups/jane.doe',
			principalUrl: '/remote.php/dav/principals/groups/jane.doe/',
			scheduleInbox: null,
			scheduleOutbox: null,
			url: '/remote.php/dav/principals/groups/jane.doe/',
			userId: null,
		}

		expect(mapDavToPrincipal(dav)).toEqual({
			id: 'L3JlbW90ZS5waHAvZGF2L3ByaW5jaXBhbHMvZ3JvdXBzL2phbmUuZG9lLw==',
			dav,
			calendarUserType: 'GROUP',
			principalScheme: 'principal:principals/groups/jane.doe',
			emailAddress: null,
			displayname: 'Jane Doe',
			url: '/remote.php/dav/principals/groups/jane.doe/',
			isUser: false,
			isGroup: true,
			isCircle: false,
			isCalendarResource: false,
			isCalendarRoom: false,
			principalId: 'jane.doe',
			userId: null,
		})
	})

	it('should properly map a circle-principal to principal-object', () => {
		const dav = {
			addressBookHomes: undefined,
			calendarHomes: [],
			calendarUserAddressSet: [],
			calendarUserType: 'GROUP',
			displayname: 'Jane Doe',
			email: null,
			principalScheme: 'principal:principals/circles/CGAH82BAS285H',
			principalUrl: '/remote.php/dav/principals/circles/CGAH82BAS285H/',
			scheduleInbox: null,
			scheduleOutbox: null,
			url: '/remote.php/dav/principals/circles/CGAH82BAS285H/',
			userId: null,
		}

		expect(mapDavToPrincipal(dav)).toEqual({
			id: 'L3JlbW90ZS5waHAvZGF2L3ByaW5jaXBhbHMvY2lyY2xlcy9DR0FIODJCQVMyODVILw==',
			dav,
			calendarUserType: 'GROUP',
			principalScheme: 'principal:principals/circles/CGAH82BAS285H',
			emailAddress: null,
			displayname: 'Jane Doe',
			url: '/remote.php/dav/principals/circles/CGAH82BAS285H/',
			isUser: false,
			isGroup: false,
			isCircle: true,
			isCalendarResource: false,
			isCalendarRoom: false,
			principalId: 'CGAH82BAS285H',
			userId: null,
		})
	})

	it('should properly map a calendar-resource-principal to principal-object', () => {
		const dav = {
			addressBookHomes: undefined,
			calendarHomes: [],
			calendarUserAddressSet: [],
			calendarUserType: 'RESOURCE',
			displayname: 'Projector 123',
			email: 'projector-123@example.com',
			principalScheme: 'principal:principals/calendar-resources/projector-123',
			principalUrl: '/remote.php/dav/principals/calendar-resources/projector-123/',
			scheduleInbox: null,
			scheduleOutbox: null,
			url: '/remote.php/dav/principals/calendar-resources/projector-123/',
			userId: null,
		}

		expect(mapDavToPrincipal(dav)).toEqual({
			id: 'L3JlbW90ZS5waHAvZGF2L3ByaW5jaXBhbHMvY2FsZW5kYXItcmVzb3VyY2VzL3Byb2plY3Rvci0xMjMv',
			dav,
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
		})
	})

	it('should properly map a calendar-room-principal to principal-object', () => {
		const dav = {
			addressBookHomes: undefined,
			calendarHomes: [],
			calendarUserAddressSet: [],
			calendarUserType: 'ROOM',
			displayname: 'ROOM 123',
			email: 'room-123@example.com',
			principalScheme: 'principal:principals/calendar-rooms/room-123',
			principalUrl: '/remote.php/dav/principals/calendar-rooms/room-123/',
			scheduleInbox: null,
			scheduleOutbox: null,
			url: '/remote.php/dav/principals/calendar-rooms/room-123/',
			userId: null,
		}

		expect(mapDavToPrincipal(dav)).toEqual({
			id: 'L3JlbW90ZS5waHAvZGF2L3ByaW5jaXBhbHMvY2FsZW5kYXItcm9vbXMvcm9vbS0xMjMv',
			dav,
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
		})
	})

	it('should properly map a principal from an unknown backend to principal-object', () => {
		const dav = {
			addressBookHomes: undefined,
			calendarHomes: ['/remote.php/dav/calendars/jane.doe'],
			calendarUserAddressSet: [],
			calendarUserType: 'OTHER',
			displayname: 'Jane Doe',
			email: 'jane.doe@example.com',
			principalScheme: 'principal:principals/users-other/jane.doe',
			principalUrl: '/remote.php/dav/principals/users-other/jane.doe/',
			scheduleInbox: null,
			scheduleOutbox: null,
			url: '/remote.php/dav/principals/users-other/jane.doe/',
			userId: null,
		}

		expect(mapDavToPrincipal(dav)).toEqual({
			id: 'L3JlbW90ZS5waHAvZGF2L3ByaW5jaXBhbHMvdXNlcnMtb3RoZXIvamFuZS5kb2Uv',
			dav,
			calendarUserType: 'OTHER',
			principalScheme: 'principal:principals/users-other/jane.doe',
			emailAddress: 'jane.doe@example.com',
			displayname: 'Jane Doe',
			url: '/remote.php/dav/principals/users-other/jane.doe/',
			isUser: false,
			isGroup: false,
			isCircle: false,
			isCalendarResource: false,
			isCalendarRoom: false,
			principalId: null,
			userId: null,
		})
	})
})
