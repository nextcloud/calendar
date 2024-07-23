/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import {
	getDefaultCalendarObject,
	mapDavCollectionToCalendar,
} from '../../../../src/models/calendar.js'
import { mapDavShareeToCalendarShareObject } from "../../../../src/models/calendarShare.js";
jest.mock("../../../../src/models/calendarShare.js")

describe('Test suite: Calendar model (models/calendar.js)', () => {

	beforeEach(() => {
		mapDavShareeToCalendarShareObject.mockClear()
	})

	it('should provide an empty skeleton for calendar', () => {
		expect(getDefaultCalendarObject()).toEqual({
			id: '',
			displayName: '',
			color: '#0082C9',
			enabled: true,
			loading: false,
			supportsEvents: true,
			supportsJournals: false,
			supportsTasks: false,
			owner: '',
			shares: [],
			publishURL: null,
			timezone: null,
			url: '',
			readOnly: false,
			order: 0,
			isSharedWithMe: false,
			canBeShared: false,
			canBePublished: false,
			dav: false,
			calendarObjects: [],
			fetchedTimeRanges: [],
			transparency: 'opaque',
		})
	})

	it('should pad an incomplete object', () => {
		expect(getDefaultCalendarObject({
			id: '123',
			displayName: 'Foo',
			loading: true
		})).toEqual({
			id: '123',
			displayName: 'Foo',
			color: '#0082C9',
			enabled: true,
			loading: true,
			supportsEvents: true,
			supportsJournals: false,
			supportsTasks: false,
			owner: '',
			shares: [],
			publishURL: null,
			timezone: null,
			url: '',
			readOnly: false,
			order: 0,
			isSharedWithMe: false,
			canBeShared: false,
			canBePublished: false,
			dav: false,
			calendarObjects: [],
			fetchedTimeRanges: [],
			transparency: 'opaque',
		})
	})

	it('should map a cdav-js calendar object to a calendar model', () => {
		const cdavObject = {
			url: '/foo/bar',
			displayname: 'Displayname of calendar 123',
			color: '#FF00FF',
			components: ['VEVENT'],
			owner: '/remote.php/dav/principals/users/admin/',
			isWriteable: () => true,
			isShareable: () => true,
			isPublishable: () => true,
			order: undefined,
			publishURL: undefined,
			enabled: true,
			timezone: 'BEGIN:VCALENDAR...END:VCALENDAR',
			transparency: 'opaque',
		}

		expect(mapDavCollectionToCalendar(cdavObject, {
			url: '/remote.php/dav/principals/users/admin/'
		})).toEqual({
			canBePublished: true,
			canBeShared: true,
			color: '#FF00FF',
			dav: cdavObject,
			displayName: 'Displayname of calendar 123',
			enabled: true,
			id: 'L2Zvby9iYXI=',
			order: 0,
			owner: '/remote.php/dav/principals/users/admin/',
			publishURL: null,
			readOnly: false,
			shares: [],
			supportsEvents: true,
			supportsJournals: false,
			supportsTasks: false,
			isSharedWithMe: false,
			timezone: 'BEGIN:VCALENDAR...END:VCALENDAR',
			transparency: 'opaque',
			url: '/foo/bar',
			calendarObjects: [],
			fetchedTimeRanges: [],
			loading: false,
		})

		expect(mapDavShareeToCalendarShareObject).toHaveBeenCalledTimes(0)
	})

	it('should map a cdav-js calendar object to a calendar model - disabled calendar', () => {
		const cdavObject = {
			url: '/foo/bar',
			displayname: 'Displayname of calendar 123',
			color: '#FF00FF',
			components: ['VEVENT'],
			owner: '/remote.php/dav/principals/users/admin/',
			isWriteable: () => true,
			isShareable: () => true,
			isPublishable: () => true,
			order: undefined,
			publishURL: undefined,
			timezone: 'BEGIN:VCALENDAR...END:VCALENDAR',
			transparency: 'transparent',
			enabled: false,
		}

		expect(mapDavCollectionToCalendar(cdavObject, {
			url: '/remote.php/dav/principals/users/admin/'
		})).toEqual({
			canBePublished: true,
			canBeShared: true,
			color: '#FF00FF',
			dav: cdavObject,
			displayName: 'Displayname of calendar 123',
			enabled: false,
			id: 'L2Zvby9iYXI=',
			order: 0,
			owner: '/remote.php/dav/principals/users/admin/',
			publishURL: null,
			readOnly: false,
			shares: [],
			supportsEvents: true,
			supportsJournals: false,
			supportsTasks: false,
			isSharedWithMe: false,
			timezone: 'BEGIN:VCALENDAR...END:VCALENDAR',
			transparency: 'transparent',
			url: '/foo/bar',
			calendarObjects: [],
			fetchedTimeRanges: [],
			loading: false,
		})

		expect(mapDavShareeToCalendarShareObject).toHaveBeenCalledTimes(0)
	})

	it('should map a cdav-js calendar object to a calendar model - no enabled - own calendar', () => {
		const cdavObject = {
			url: '/foo/bar',
			displayname: 'Displayname of calendar 123',
			color: '#FF00FF',
			components: ['VEVENT'],
			owner: '/remote.php/dav/principals/users/admin/',
			isWriteable: () => true,
			isShareable: () => true,
			isPublishable: () => true,
			order: undefined,
			publishURL: undefined,
			enabled: undefined
		}

		expect(mapDavCollectionToCalendar(cdavObject, {
			url: '/remote.php/dav/principals/users/admin/'
		})).toEqual({
			canBePublished: true,
			canBeShared: true,
			color: '#FF00FF',
			dav: cdavObject,
			displayName: 'Displayname of calendar 123',
			enabled: true,
			id: 'L2Zvby9iYXI=',
			order: 0,
			owner: '/remote.php/dav/principals/users/admin/',
			publishURL: null,
			readOnly: false,
			shares: [],
			supportsEvents: true,
			supportsJournals: false,
			supportsTasks: false,
			isSharedWithMe: false,
			timezone: null,
			transparency: 'opaque',
			url: '/foo/bar',
			calendarObjects: [],
			fetchedTimeRanges: [],
			loading: false,
		})

		expect(mapDavShareeToCalendarShareObject).toHaveBeenCalledTimes(0)
	})

	it('should map a cdav-js calendar object to a calendar model - no enabled - shared with me', () => {
		const cdavObject = {
			url: '/foo/bar',
			displayname: 'Displayname of calendar 123',
			color: '#FF00FF',
			components: ['VEVENT'],
			owner: '/remote.php/dav/principals/users/admin/',
			isWriteable: () => true,
			isShareable: () => true,
			isPublishable: () => true,
			order: undefined,
			publishURL: undefined,
			enabled: undefined
		}

		expect(mapDavCollectionToCalendar(cdavObject, {
			url: '/remote.php/dav/principals/users/user123/'
		})).toEqual({
			canBePublished: true,
			canBeShared: true,
			color: '#FF00FF',
			dav: cdavObject,
			displayName: 'Displayname of calendar 123',
			enabled: true,
			id: 'L2Zvby9iYXI=',
			order: 0,
			owner: '/remote.php/dav/principals/users/admin/',
			publishURL: null,
			readOnly: false,
			shares: [],
			supportsEvents: true,
			supportsJournals: false,
			supportsTasks: false,
			isSharedWithMe: true,
			timezone: null,
			transparency: 'opaque',
			url: '/foo/bar',
			calendarObjects: [],
			fetchedTimeRanges: [],
			loading: false,
		})

		expect(mapDavShareeToCalendarShareObject).toHaveBeenCalledTimes(0)
	})

	it('should map a cdav-js calendar object to a calendar model - color without hash', () => {
		const cdavObject = {
			url: '/foo/bar',
			displayname: 'Displayname of calendar 123',
			color: 'FF00FF',
			components: ['VEVENT'],
			owner: '/remote.php/dav/principals/users/admin/',
			isWriteable: () => true,
			isShareable: () => true,
			isPublishable: () => true,
			order: undefined,
			publishURL: undefined,
			enabled: true
		}

		expect(mapDavCollectionToCalendar(cdavObject, {
			url: '/remote.php/dav/principals/users/admin/'
		})).toEqual({
			canBePublished: true,
			canBeShared: true,
			color: '#FF00FF',
			dav: cdavObject,
			displayName: 'Displayname of calendar 123',
			enabled: true,
			id: 'L2Zvby9iYXI=',
			order: 0,
			owner: '/remote.php/dav/principals/users/admin/',
			publishURL: null,
			readOnly: false,
			shares: [],
			supportsEvents: true,
			supportsJournals: false,
			supportsTasks: false,
			isSharedWithMe: false,
			timezone: null,
			transparency: 'opaque',
			url: '/foo/bar',
			calendarObjects: [],
			fetchedTimeRanges: [],
			loading: false,
		})

		expect(mapDavShareeToCalendarShareObject).toHaveBeenCalledTimes(0)
	})

	it('should map a cdav-js calendar object to a calendar model - rgba color', () => {
		const cdavObject = {
			url: '/foo/bar',
			displayname: 'Displayname of calendar 123',
			color: '#FF00FFFF',
			components: ['VEVENT'],
			owner: '/remote.php/dav/principals/users/admin/',
			isWriteable: () => true,
			isShareable: () => true,
			isPublishable: () => true,
			order: undefined,
			publishURL: undefined,
			enabled: true
		}

		expect(mapDavCollectionToCalendar(cdavObject, {
			url: '/remote.php/dav/principals/users/admin/'
		})).toEqual({
			canBePublished: true,
			canBeShared: true,
			color: '#FF00FF',
			dav: cdavObject,
			displayName: 'Displayname of calendar 123',
			enabled: true,
			id: 'L2Zvby9iYXI=',
			order: 0,
			owner: '/remote.php/dav/principals/users/admin/',
			publishURL: null,
			readOnly: false,
			shares: [],
			supportsEvents: true,
			supportsJournals: false,
			supportsTasks: false,
			isSharedWithMe: false,
			timezone: null,
			transparency: 'opaque',
			url: '/foo/bar',
			calendarObjects: [],
			fetchedTimeRanges: [],
			loading: false,
		})

		expect(mapDavShareeToCalendarShareObject).toHaveBeenCalledTimes(0)
	})

	it('should map a cdav-js calendar object to a calendar model - rgba color without hash', () => {
		const cdavObject = {
			url: '/foo/bar',
			displayname: 'Displayname of calendar 123',
			color: 'FF00FFFF',
			components: ['VEVENT'],
			owner: '/remote.php/dav/principals/users/admin/',
			isWriteable: () => true,
			isShareable: () => true,
			isPublishable: () => true,
			order: undefined,
			publishURL: undefined,
			enabled: true
		}

		expect(mapDavCollectionToCalendar(cdavObject, {
			url: '/remote.php/dav/principals/users/admin/'
		})).toEqual({
			canBePublished: true,
			canBeShared: true,
			color: '#FF00FF',
			dav: cdavObject,
			displayName: 'Displayname of calendar 123',
			enabled: true,
			id: 'L2Zvby9iYXI=',
			order: 0,
			owner: '/remote.php/dav/principals/users/admin/',
			publishURL: null,
			readOnly: false,
			shares: [],
			supportsEvents: true,
			supportsJournals: false,
			supportsTasks: false,
			isSharedWithMe: false,
			timezone: null,
			transparency: 'opaque',
			url: '/foo/bar',
			calendarObjects: [],
			fetchedTimeRanges: [],
			loading: false,
		})

		expect(mapDavShareeToCalendarShareObject).toHaveBeenCalledTimes(0)
	})

	it('should map a cdav-js calendar object to a calendar model - unknown color', () => {
		const cdavObject = {
			url: '/foo/bar',
			displayname: 'Displayname of calendar 123',
			color: 'no-parsable-color-123',
			components: ['VEVENT'],
			owner: '/remote.php/dav/principals/users/admin/',
			isWriteable: () => true,
			isShareable: () => true,
			isPublishable: () => true,
			order: undefined,
			publishURL: undefined,
			enabled: true
		}

		expect(mapDavCollectionToCalendar(cdavObject, {
			url: '/remote.php/dav/principals/users/admin/'
		})).toEqual({
			canBePublished: true,
			canBeShared: true,
			color: '#499AA2',
			dav: cdavObject,
			displayName: 'Displayname of calendar 123',
			enabled: true,
			id: 'L2Zvby9iYXI=',
			order: 0,
			owner: '/remote.php/dav/principals/users/admin/',
			publishURL: null,
			readOnly: false,
			shares: [],
			supportsEvents: true,
			supportsJournals: false,
			supportsTasks: false,
			isSharedWithMe: false,
			timezone: null,
			transparency: 'opaque',
			url: '/foo/bar',
			calendarObjects: [],
			fetchedTimeRanges: [],
			loading: false,
		})

		expect(mapDavShareeToCalendarShareObject).toHaveBeenCalledTimes(0)
	})

	it('should properly parse sharees of a calendar', () => {
		mapDavShareeToCalendarShareObject
			.mockReturnValueOnce({ id: 'share1' })
			.mockReturnValueOnce({ id: 'share2' })
			.mockReturnValueOnce({ id: 'share3' })
			.mockReturnValueOnce({ id: 'share4' })
			.mockReturnValueOnce({ id: 'share5' })
			.mockReturnValue(null)

		const cdavObject = {
			url: '/foo/bar',
			displayname: 'Displayname of calendar 123',
			color: '#FF00FF',
			components: ['VEVENT'],
			owner: '/remote.php/dav/principals/users/admin/',
			isWriteable: () => true,
			isShareable: () => true,
			isPublishable: () => true,
			order: undefined,
			publishURL: undefined,
			enabled: true,
			shares: [
				{
					'href': 'principal:principals/users/user4',
					'common-name': 'Marcus Beehler',
					'invite-accepted': true,
					'access': [
						'{http://owncloud.org/ns}read'
					]
				},
				{
					'href': 'principal:principals/users/admin',
					'common-name': 'admin',
					'invite-accepted': true,
					'access': [
						'{http://owncloud.org/ns}read-write'
					]
				},
				{
					'href': 'principal:principals/circles/c479c14bd82415',
					'common-name': 'My personal circle',
					'invite-accepted': true,
					'access': [
						'{http://owncloud.org/ns}read'
					]
				},
				{
					'href': 'principal:principals/users/user3',
					'common-name': 'Whitney Anders',
					'invite-accepted': true,
					'access': [
						'{http://owncloud.org/ns}read-write'
					]
				},
				{
					'href': 'principal:principals/groups/admin',
					'common-name': '',
					'invite-accepted': true,
					'access': [
						'{http://owncloud.org/ns}read'
					]
				}
			]
		}

		expect(mapDavCollectionToCalendar(cdavObject, {
			url: '/remote.php/dav/principals/users/admin/',
			principalScheme: 'principal:principals/users/admin'
		})).toEqual({
			canBePublished: true,
			canBeShared: true,
			color: '#FF00FF',
			dav: cdavObject,
			displayName: 'Displayname of calendar 123',
			enabled: true,
			id: 'L2Zvby9iYXI=',
			order: 0,
			owner: '/remote.php/dav/principals/users/admin/',
			publishURL: null,
			readOnly: false,
			shares: [
				{ id: 'share1' },
				{ id: 'share2' },
				{ id: 'share3' },
				{ id: 'share4' },
			],
			supportsEvents: true,
			supportsJournals: false,
			supportsTasks: false,
			isSharedWithMe: false,
			timezone: null,
			transparency: 'opaque',
			url: '/foo/bar',
			calendarObjects: [],
			fetchedTimeRanges: [],
			loading: false,
		})

		expect(mapDavShareeToCalendarShareObject).toHaveBeenCalledTimes(4)
		expect(mapDavShareeToCalendarShareObject).toHaveBeenNthCalledWith(1, {
			'href': 'principal:principals/users/user4',
			'common-name': 'Marcus Beehler',
			'invite-accepted': true,
			'access': [
				'{http://owncloud.org/ns}read'
			]
		})
		expect(mapDavShareeToCalendarShareObject).toHaveBeenNthCalledWith(2, {
			'href': 'principal:principals/circles/c479c14bd82415',
			'common-name': 'My personal circle',
			'invite-accepted': true,
			'access': [
				'{http://owncloud.org/ns}read'
			]
		})
		expect(mapDavShareeToCalendarShareObject).toHaveBeenNthCalledWith(3, {
			'href': 'principal:principals/users/user3',
			'common-name': 'Whitney Anders',
			'invite-accepted': true,
			'access': [
				'{http://owncloud.org/ns}read-write'
			]
		})
		expect(mapDavShareeToCalendarShareObject).toHaveBeenNthCalledWith(4, {
			'href': 'principal:principals/groups/admin',
			'common-name': '',
			'invite-accepted': true,
			'access': [
				'{http://owncloud.org/ns}read'
			]
		})
	})

	it('should skip parsing shares when accessed by public user', () => {
		const cdavObject = {
			url: '/foo/bar',
			displayname: 'Displayname of calendar 123',
			color: '#FF00FF',
			components: ['VEVENT'],
			owner: '/remote.php/dav/principals/users/admin/',
			isWriteable: () => true,
			isShareable: () => true,
			isPublishable: () => true,
			order: undefined,
			publishURL: undefined,
			enabled: true,
			shares: [
				{
					'href': 'principal:principals/users/user4',
					'common-name': 'Marcus Beehler',
					'invite-accepted': true,
					'access': [
						'{http://owncloud.org/ns}read'
					]
				},
				{
					'href': 'principal:principals/users/admin',
					'common-name': 'admin',
					'invite-accepted': true,
					'access': [
						'{http://owncloud.org/ns}read-write'
					]
				},
				{
					'href': 'principal:principals/circles/c479c14bd82415',
					'common-name': 'My personal circle',
					'invite-accepted': true,
					'access': [
						'{http://owncloud.org/ns}read'
					]
				},
				{
					'href': 'principal:principals/users/user3',
					'common-name': 'Whitney Anders',
					'invite-accepted': true,
					'access': [
						'{http://owncloud.org/ns}read-write'
					]
				},
				{
					'href': 'principal:principals/groups/admin',
					'common-name': '',
					'invite-accepted': true,
					'access': [
						'{http://owncloud.org/ns}read'
					]
				}
			]
		}

		expect(mapDavCollectionToCalendar(cdavObject)).toEqual({
			canBePublished: true,
			canBeShared: true,
			color: '#FF00FF',
			dav: cdavObject,
			displayName: 'Displayname of calendar 123',
			enabled: true,
			id: 'L2Zvby9iYXI=',
			order: 0,
			owner: '/remote.php/dav/principals/users/admin/',
			publishURL: null,
			readOnly: false,
			shares: [],
			supportsEvents: true,
			supportsJournals: false,
			supportsTasks: false,
			isSharedWithMe: true,
			timezone: null,
			transparency: 'opaque',
			url: '/foo/bar',
			calendarObjects: [],
			fetchedTimeRanges: [],
			loading: false,
		})

		expect(mapDavShareeToCalendarShareObject).toHaveBeenCalledTimes(0)
	})

	it('should handle undefined displayname properly', () => {
		const cdavObject = {
			url: '/remote.php/dav/calendars/admin/personal/',
			displayname: undefined,
			color: '#FF00FF',
			components: ['VEVENT'],
			owner: '/remote.php/dav/principals/users/admin/',
			isWriteable: () => true,
			isShareable: () => true,
			isPublishable: () => true,
			order: undefined,
			publishURL: undefined,
			timezone: 'BEGIN:VCALENDAR...END:VCALENDAR',
			enabled: false
		}

		expect(mapDavCollectionToCalendar(cdavObject, {
			url: '/remote.php/dav/principals/users/admin/'
		})).toEqual({
			canBePublished: true,
			canBeShared: true,
			color: '#FF00FF',
			dav: cdavObject,
			displayName: 'personal',
			enabled: false,
			id: 'L3JlbW90ZS5waHAvZGF2L2NhbGVuZGFycy9hZG1pbi9wZXJzb25hbC8=',
			order: 0,
			owner: '/remote.php/dav/principals/users/admin/',
			publishURL: null,
			readOnly: false,
			shares: [],
			supportsEvents: true,
			supportsJournals: false,
			supportsTasks: false,
			isSharedWithMe: false,
			timezone: 'BEGIN:VCALENDAR...END:VCALENDAR',
			transparency: 'opaque',
			url: '/remote.php/dav/calendars/admin/personal/',
			calendarObjects: [],
			fetchedTimeRanges: [],
			loading: false,
		})
	})

})
