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
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/**
 * Creates a complete contacts-object based on given props
 *
 * @param {Object} props Contacts-props already provided
 * @returns {Object}
 */
export const getDefaultContactsObject = (props = {}) => Object.assign({}, {
	// The name of the contact
	name: '',
	// Calendar-user-type of the contact
	calendarUserType: 'INDIVIDUAL',
	// Whether or not this is a user
	isUser: false,
	// The user-id in case it's a user
	userId: null,
	// Whether or not this contact has a photo
	hasPhoto: false,
	// The url of the photo
	photoUrl: null,
	// Whether or not this contact has an icon
	// (mostly if the calendar-user-type is not INDIVIDUAL)
	hasIcon: false,
	// The name of the class associated with the icon
	iconClass: null,
	// List of email addresses
	emails: [],
	// Language of the user
	language: null,
	// Timezone of the user
	timezoneId: null,
}, props)
