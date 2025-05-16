/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import HTTPClient from '@nextcloud/axios'
import { translate as t } from '@nextcloud/l10n'
import { generateUrl, generateOcsUrl } from '@nextcloud/router'
import { loadState } from '@nextcloud/initial-state'
import { getCurrentUser } from '@nextcloud/auth'
import logger from '../utils/logger.js'
import { removeMailtoPrefix } from '../utils/attendee.js'
import md5 from 'md5'

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
	let response
	let token
	let conversation

	try {
		response = await HTTPClient.post(generateOcsUrl('apps/spreed/api/' + apiVersion + '/', 2) + 'room', {
			roomType: 3,
			roomName: eventTitle || t('calendar', 'Talk conversation for event'),
			objectType: 'event',
			objectId: md5(new Date()),
		})
		conversation = response.data.ocs.data
		token = conversation.token
	} catch (error) {
		console.debug(error)
		throw error
	}

	try {
		// Keep until Calendar supports 31+
		if (eventDescription) {
			await HTTPClient.put(generateOcsUrl('apps/spreed/api/' + apiVersion + '/', 2) + 'room/' + token + '/description', {
				description: eventDescription,
			})
		}
	} catch (error) {
		console.debug(error)
		if (error.response?.data?.ocs?.data?.error !== 'event') {
			throw error
		}
	}
	return generateURLForToken(token)
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
	const token = extractCallTokenFromUrl(url)
	if (!token) {
		logger.debug('URL ' + url + ' contains no call token')
		return
	}
	try {
		const { data: { ocs: { data: room } } } = await HTTPClient.get(generateOcsUrl('apps/spreed/api/' + apiVersion + '/', 2) + 'room/' + token)
		const participantsResponse = await HTTPClient.get(generateOcsUrl('apps/spreed/api/' + apiVersion + '/', 2) + 'room/' + token + '/participants')
		// Ignore if the actor isn't owner of the conversation
		if (!participantsResponse.data.ocs.data.some(participant => participant.actorId === getCurrentUser().uid && participant.participantType <= 2)) {
			logger.debug('Current user is not a moderator or owner', { currentUser: getCurrentUser().uid, conversation: participantsResponse.data.ocs.data })
			return
		}
		console.info('room', room)

		for (const attendee of eventComponent.getAttendeeIterator()) {
			logger.debug('Processing attendee', { attendee })
			if (['GROUP', 'RESOURCE', 'ROOM'].includes(attendee.userType)) {
				continue
			}

			const participantId = removeMailtoPrefix(attendee.email)
			try {
				// Map attendee email to Nextcloud user uid
				const searchResult = await HTTPClient.get(generateOcsUrl('core/autocomplete/', 2) + 'get?search=' + encodeURIComponent(attendee.commonName ?? participantId) + '&itemType=&itemId=%20&shareTypes[]=0&limit=2')
				// Only map if there is exactly one result
				if (searchResult.data.ocs.data.length === 1
					&& searchResult.data.ocs.data[0].id !== getCurrentUser().uid
					&& searchResult.data.ocs.data[0].shareWithDisplayNameUnique === participantId
				) {
					await HTTPClient.post(generateOcsUrl('apps/spreed/api/' + apiVersion + '/', 2) + 'room/' + token + '/participants', {
						newParticipant: searchResult.data.ocs.data[0].id,
						source: 'users',
					})
				} else if (searchResult.data.ocs.data[0]?.id === getCurrentUser().uid) {
					logger.debug('Skipping organizer ' + searchResult.data.ocs.data[0].id)
				} else if (room.type === 3) {
					await HTTPClient.post(generateOcsUrl('apps/spreed/api/' + apiVersion + '/', 2) + 'room/' + token + '/participants', {
						newParticipant: participantId,
						source: 'emails',
					})
				} else {
					logger.debug('Attendee ' + participantId + ' ignored as Talk participant')
				}
			} catch (error) {
				logger.info('Could not add attendee ' + participantId + ' as Talk participant', { error })
			}
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
export function generateURLForToken(token = '') {
	return window.location.protocol + '//' + window.location.host + generateUrl('/call/' + token)
}

/**
 * Extract a spreed call token from the given URL
 *
 * @param {string} callUrl URL of the spreed call
 * @return {string|undefined} Matched token or undefined if URL is invalid
 */
export function extractCallTokenFromUrl(callUrl) {
	return callUrl.match(/\/call\/([a-z0-9]*)(\/|#.*)?$/)?.[1] ?? undefined
}
