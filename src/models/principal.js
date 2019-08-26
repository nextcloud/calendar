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
 * Creates a complete principal-object based on given props
 *
 * @param {Object} props Principal-props already provided
 * @returns {any}
 */
export const getDefaultPrincipalObject = (props) => Object.assign({}, {
	// Id of the principal
	id: '',
	// Calendar-user-type. This can be INDIVIDUAL, GROUP, RESOURCE or ROOM
	calendarUserType: '',
	// E-Mail address of principal used for scheduling
	emailAddress: '',
	// The principals display-name
	displayname: '',
	// The internal user-id in case it is of type INDIVIDUAL and a user
	userId: '',
	// url to the DAV-principal-resource
	url: '',
	// The cdav-library object
	dav: false,
}, props)

/**
 * converts a dav principal into a vuex object
 *
 * @param {Object} principal cdav-library Principal object
 * @returns {{emailAddress: *, displayname: *, dav: *, id: *, calendarUserType: *, userId: *, url: *}}
 */
export function mapDavToPrincipal(principal) {
	return {
		id: btoa(principal.url),
		calendarUserType: principal.calendarUserType,
		emailAddress: principal.email,
		displayname: principal.displayname,
		userId: principal.userId,
		url: principal.principalUrl,
		dav: principal
	}
}
