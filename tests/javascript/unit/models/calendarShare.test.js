/**
 * @copyright Copyright (c) 2020 Georg Ehrke
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
	getDefaultCalendarShareObject,
	mapDavShareeToCalendarShareObject
} from "../../../../src/models/calendarShare.js";

describe('Test suite: Calendar share model (models/calendarShare.js)', () => {

	it('should return a default calendar share object', () => {
		expect(getDefaultCalendarShareObject()).toEqual({
			id: null,
			displayName: null,
			writeable: false,
			isUser: false,
			isGroup: false,
			isCircle: false,
			uri: null,
		})
	})

	it('should fill up an object with default values', () => {
		expect(getDefaultCalendarShareObject({
			id: 'id123',
			otherProp: 'foo',
		})).toEqual({
			id: 'id123',
			displayName: null,
			writeable: false,
			isUser: false,
			isGroup: false,
			isCircle: false,
			uri: null,
			otherProp: 'foo',
		})
	})

	it('should map a dav sharee to a calendar share object - user', () => {
		const davSharee = {
			'href': 'principal:principals/users/user4',
			'common-name': 'Marcus Beehler',
			'invite-accepted': true,
			'access': [
				'{http://owncloud.org/ns}read'
			]
		}

		expect(mapDavShareeToCalendarShareObject(davSharee)).toEqual({
			id: 'cHJpbmNpcGFsOnByaW5jaXBhbHMvdXNlcnMvdXNlcjQ=',
			displayName: 'Marcus Beehler',
			writeable: false,
			isUser: true,
			isGroup: false,
			isCircle: false,
			uri: 'principal:principals/users/user4',
		})
	})

	it('should map a dav sharee to a calendar share object - user without displayname', () => {
		const davSharee = {
			'href': 'principal:principals/users/user4',
			'common-name': '',
			'invite-accepted': true,
			'access': [
				'{http://owncloud.org/ns}read'
			]
		}

		expect(mapDavShareeToCalendarShareObject(davSharee)).toEqual({
			id: 'cHJpbmNpcGFsOnByaW5jaXBhbHMvdXNlcnMvdXNlcjQ=',
			displayName: 'user4',
			writeable: false,
			isUser: true,
			isGroup: false,
			isCircle: false,
			uri: 'principal:principals/users/user4',
		})
	})

	it('should map a dav sharee to a calendar share object - group', () => {
		const davSharee = {
			'href': 'principal:principals/groups/admin',
			'common-name': '',
			'invite-accepted': true,
			'access': [
				'{http://owncloud.org/ns}read'
			]
		}

		expect(mapDavShareeToCalendarShareObject(davSharee)).toEqual({
			id: 'cHJpbmNpcGFsOnByaW5jaXBhbHMvZ3JvdXBzL2FkbWlu',
			displayName: 'admin',
			writeable: false,
			isUser: false,
			isGroup: true,
			isCircle: false,
			uri: 'principal:principals/groups/admin',
		})
	})

	it('should map a dav sharee to a calendar share object - circle', () => {
		const davSharee = {
			'href': 'principal:principals/circles/c479c14bd82415',
			'common-name': 'My personal circle',
			'invite-accepted': true,
			'access': [
				'{http://owncloud.org/ns}read-write'
			]
		}

		expect(mapDavShareeToCalendarShareObject(davSharee)).toEqual({
			id: 'cHJpbmNpcGFsOnByaW5jaXBhbHMvY2lyY2xlcy9jNDc5YzE0YmQ4MjQxNQ==',
			displayName: 'My personal circle',
			writeable: true,
			isUser: false,
			isGroup: false,
			isCircle: true,
			uri: 'principal:principals/circles/c479c14bd82415',
		})
	})

	it('should map a dav sharee to a calendar share object - circle without displayname', () => {
		// This should never be the case. This test should just make sure it doesn't crash and always
		// provides a displayname
		const davSharee = {
			'href': 'principal:principals/circles/c479c14bd82415',
			'common-name': '',
			'invite-accepted': true,
			'access': [
				'{http://owncloud.org/ns}read-write'
			]
		}

		expect(mapDavShareeToCalendarShareObject(davSharee)).toEqual({
			id: 'cHJpbmNpcGFsOnByaW5jaXBhbHMvY2lyY2xlcy9jNDc5YzE0YmQ4MjQxNQ==',
			displayName: 'principal:principals/circles/c479c14bd82415',
			writeable: true,
			isUser: false,
			isGroup: false,
			isCircle: true,
			uri: 'principal:principals/circles/c479c14bd82415',
		})
	})

	it('should properly handle sharee URIs with non-ascii characters', () => {
		const davSharee = {
			'href': 'principal:principals/groups/מַזָּל טוֹב',
			'common-name': '',
			'invite-accepted': true,
			'access': [
				'{http://owncloud.org/ns}read'
			]
		}

		expect(mapDavShareeToCalendarShareObject(davSharee)).toEqual({
			id: 'cHJpbmNpcGFsOnByaW5jaXBhbHMvZ3JvdXBzLyVENyU5RSVENiVCNyVENyU5NiVENiVCOCVENiVCQyVENyU5QyUyMCVENyU5OCVENyU5NSVENiVCOSVENyU5MQ==',
			displayName: 'מַזָּל טוֹב',
			writeable: false,
			isUser: false,
			isGroup: true,
			isCircle: false,
			uri: 'principal:principals/groups/מַזָּל טוֹב',
		})
	})

})
