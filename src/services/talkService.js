/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Team Popcorn <teampopcornberlin@gmail.com>
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license AGPL-3.0-or-later
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
import { loadState } from '@nextcloud/initial-state'
import { getCurrentUser } from '@nextcloud/auth'
import logger from '../utils/logger.js'
import { removeMailtoPrefix } from '../utils/attendee.js'

/**
 * Creates a new public talk room
 *
 * @param {?string} eventTitle Title of the event
 * @param {?string} eventDescription Description of the event
 * @param {?string[]} attendees Attendees of the event
 *
 * @return {Promise<string>}
 */
export async function createTalkRoom(eventTitle = null, eventDescription = null, attendees = []) {
	const apiVersion = loadState('calendar', 'talk_api_version')
	try {
		const response = await HTTPClient.post(generateOcsUrl('apps/spreed/api/' + apiVersion + '/', 2) + 'room', {
			roomType: 3,
			roomName: eventTitle || t('calendar', 'Chat room for event'),
		})

		const conversation = response.data.ocs.data
		const token = conversation.token
		if (eventDescription) {
			await HTTPClient.put(generateOcsUrl('apps/spreed/api/' + apiVersion + '/', 2) + 'room/' + token + '/description', {
				description: eventDescription,
			})
		}

		return generateURLForToken(token)
	} catch (error) {
		console.debug(error)
		throw error
	}
}

/**
 *
 * @param eventComponent
 */
export async function updateTalkParticipants(eventComponent) {
	const apiVersion = loadState('calendar', 'talk_api_version')
	const url = eventComponent.getConferenceList()[0]?.uri ?? eventComponent.location
	if (!url || !url.startsWith(window.location.protocol + '//' + window.location.host)) {
		logger.debug('Event\'s conference/location is from another host', url)
		return
	}
	const token = url.match(/\/call\/([a-z0-9]*)$/)[1]
	if (!token) {
		logger.debug('URL ' + url + ' contains no call token')
		return
	}
	try {
		const participantsResponse = await HTTPClient.get(generateOcsUrl('apps/spreed/api/' + apiVersion + '/', 2) + 'room/' + token + '/participants')
		// Ignore if the actor isn't owner of the conversation
		if (!participantsResponse.data.ocs.data.some(participant => participant.actorId === getCurrentUser().uid && participant.participantType <= 2)) {
			logger.debug('Current user is not a moderator or owner', { currentUser: getCurrentUser().uid, conversation: participantsResponse.data.ocs.data })
			return
		}

		for (const attendee of eventComponent.getAttendeeIterator()) {
			logger.debug('Processing attendee', { attendee })
			if (['GROUP', 'RESOURCE', 'ROOM'].includes(attendee.userType)) {
				continue
			}

			let participantId = removeMailtoPrefix(attendee.email)
			let attendeeSource = 'emails'
			try {
				// Map attendee email to Nextcloud user uid
				const searchResult = await HTTPClient.get(generateOcsUrl('core/autocomplete/', 2) + 'get?search=' + encodeURIComponent(participantId) + '&itemType=&itemId=%20&shareTypes[]=0&limit=2')
				// Only map if there is exactly one result. Use email if there are none or more results.
				if (searchResult.data.ocs.data.length === 1) {
					participantId = searchResult.data.ocs.data[0].id
					attendeeSource = 'users'
				} else {
					logger.debug('Attendee ' + participantId + ' is not a Nextcloud user')
				}
			} catch (error) {
				logger.info('Could not find user data for attendee ' + participantId, { error })
			}

			if (attendeeSource === 'users' && participantId === getCurrentUser().uid) {
				logger.debug('Skipping organizer')
				continue
			}
			await HTTPClient.post(generateOcsUrl('apps/spreed/api/' + apiVersion + '/', 2) + 'room/' + token + '/participants', {
				newParticipant: participantId,
				source: attendeeSource,
			})
		}
	} catch (error) {
		logger.warn('Could not update Talk room attendees', { error })
	}
}

/**
 * Checks whether the value contains a talk link
 *
 * @param {?string} text Haystack
 * @return {boolean}
 */
export function doesContainTalkLink(text) {
	if (!text) {
		return false
	}

	// TODO: there is most definitely a more reliable way,
	// but this works for now
	const fakeUrl = generateURLForToken()
	return text.includes(fakeUrl)
}

/**
 * Generates an absolute URL to the talk room based on the token
 *
 * @param {string} token The token to the call room
 * @return {string}
 */
function generateURLForToken(token = '') {
	return window.location.protocol + '//' + window.location.host + generateUrl('/call/' + token)
}
