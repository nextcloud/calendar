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
import {
	getDefaultCalendarObject,
	mapDavCollectionToCalendar,
	mapDavShareeToSharee
} from '../../../../src/models/calendar.js'

describe('models/calendar test suite', () => {

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
			url: '',
			readOnly: false,
			order: 0,
			isSharedWithMe: false,
			canBeShared: false,
			canBePublished: false,
			dav: false,
			calendarObjects: [],
			fetchedTimeRanges: []
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
			url: '',
			readOnly: false,
			order: 0,
			isSharedWithMe: false,
			canBeShared: false,
			canBePublished: false,
			dav: false,
			calendarObjects: [],
			fetchedTimeRanges: []
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
			url: '/foo/bar'
		})
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
			enabled: false
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
			url: '/foo/bar'
		})
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
			url: '/foo/bar'
		})
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
			isSharedWithMe: true,
			url: '/foo/bar'
		})
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
			url: '/foo/bar'
		})
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
			url: '/foo/bar'
		})
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
			url: '/foo/bar'
		})
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
			url: '/foo/bar'
		})
	})

	it('should properly parse sharees of a calendar', () => {
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
			shares: [{
				'displayName': 'Marcus Beehler',
				'id': 'cHJpbmNpcGFsOnByaW5jaXBhbHMvdXNlcnMvdXNlcjQ=',
				'isCircle': false,
				'isGroup': false,
				'uri': 'principal:principals/users/user4',
				'writeable': false,
			}, {
				'displayName': 'My personal circle',
				'id': 'cHJpbmNpcGFsOnByaW5jaXBhbHMvY2lyY2xlcy9jNDc5YzE0YmQ4MjQxNQ==',
				'isCircle': true,
				'isGroup': false,
				'uri': 'principal:principals/circles/c479c14bd82415',
				'writeable': false,
			}, {
				'displayName': 'Whitney Anders',
				'id': 'cHJpbmNpcGFsOnByaW5jaXBhbHMvdXNlcnMvdXNlcjM=',
				'isCircle': false,
				'isGroup': false,
				'uri': 'principal:principals/users/user3',
				'writeable': true,
			}, {
				'displayName': 'admin',
				'id': 'cHJpbmNpcGFsOnByaW5jaXBhbHMvZ3JvdXBzL2FkbWlu',
				'isCircle': false,
				'isGroup': true,
				'uri': 'principal:principals/groups/admin',
				'writeable': false,
			}],
			supportsEvents: true,
			supportsJournals: false,
			supportsTasks: false,
			isSharedWithMe: false,
			url: '/foo/bar'
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
			url: '/foo/bar'
		})
	})

	it('should properly parse individual sharees', () => {
		expect(mapDavShareeToSharee({
			'href': 'principal:principals/circles/c479c14bd82415',
			'common-name': 'My personal circle',
			'invite-accepted': true,
			'access': [
				'{http://owncloud.org/ns}read'
			]
		})).toEqual({
			'displayName': 'My personal circle',
			'id': 'cHJpbmNpcGFsOnByaW5jaXBhbHMvY2lyY2xlcy9jNDc5YzE0YmQ4MjQxNQ==',
			'isCircle': true,
			'isGroup': false,
			'uri': 'principal:principals/circles/c479c14bd82415',
			'writeable': false
		})
	})

})
