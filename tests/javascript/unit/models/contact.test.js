/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {getDefaultContactsObject} from "../../../../src/models/contact.js";

describe('Test suite: Contact model (models/contact.js)', () => {

	it('should return a default contacts object', () => {
		expect(getDefaultContactsObject()).toEqual({
			name: null,
			calendarUserType: 'INDIVIDUAL',
			isUser: false,
			userId: null,
			hasPhoto: false,
			photoUrl: null,
			hasIcon: false,
			iconClass: null,
			emails: [],
			language: null,
			timezoneId: null,
		})
	})

	it('should fill up an object with default values', () => {
		expect(getDefaultContactsObject({
			name: 'Contact name',
			otherProp: 'foo',
		})).toEqual({
			name: 'Contact name',
			calendarUserType: 'INDIVIDUAL',
			isUser: false,
			userId: null,
			hasPhoto: false,
			photoUrl: null,
			hasIcon: false,
			iconClass: null,
			emails: [],
			language: null,
			timezoneId: null,
			otherProp: 'foo',
		})
	})

})
