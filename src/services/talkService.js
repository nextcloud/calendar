/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Team Popcorn <teampopcornberlin@gmail.com>
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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import HTTPClient from '@nextcloud/axios'
import { translate as t } from '@nextcloud/l10n'
import { generateUrl, generateOcsUrl } from '@nextcloud/router'

export function isTalkEnabled() {

}

/**
 * Creates a new public talk room
 *
 * @param {String?} eventTitle Title of the event
 * @returns {Promise<String>}
 */
export async function createTalkRoom(eventTitle = null) {
	let response
	try {
		response = await HTTPClient.post(generateOcsUrl('apps/spreed/api/v1', 2) + `room`, {
			roomType: 3,
			roomName: eventTitle || t('calendar', 'Chat room for event'),
		})

		const conversation = response.data.ocs.data
		const token = conversation.token

		return generateURLForToken(token)
	} catch (error) {
		console.debug(error)
	}
}

/**
 * Checks whether the description already contains a talk link
 *
 * @param {String?} description Description of event
 * @returns {boolean}
 */
export function doesDescriptionContainTalkLink(description) {
	if (!description) {
		return false
	}

	// TODO: there is most definitely a more reliable way,
	// but this works for now
	const fakeUrl = generateURLForToken()
	return description.includes(fakeUrl)
}

/**
 * Generates an absolute URL to the talk room based on the token
 *
 * @param {String} token The token to the call room
 * @returns {string}
 */
function generateURLForToken(token = '') {
	return window.location.protocol + '//' + window.location.host + generateUrl('/call/' + token)
}
