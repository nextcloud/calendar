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
