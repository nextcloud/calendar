/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Creates a complete contacts-object based on given props
 *
 * @param {object} props Contacts-props already provided
 * @return {object}
 */
const getDefaultContactsObject = (props = {}) => Object.assign({}, {
	// The name of the contact
	name: null,
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

export {
	getDefaultContactsObject,
}
