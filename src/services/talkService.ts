/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { AutocompleteEntry } from '@/types/autocomplete'
import type { CalendarAttendee } from '@/types/calendar'
import type { ProposalInterface, ProposalParticipantInterface } from '@/types/proposals/proposalInterfaces'
import type {
	TalkRoom,
	TalkRoomAddParticipantRequest,
	TalkRoomAddParticipantResponse,
	TalkRoomCreateRequest,
	TalkRoomCreateResponse,
	TalkRoomFetchParticipantsResponse,
	TalkRoomFetchResponse,
	TalkRoomListRequest,
	TalkRoomListResponse,
	TalkRoomParticipant,
} from '@/types/talk'

import { getCurrentUser } from '@nextcloud/auth'
import { loadState } from '@nextcloud/initial-state'
import { translate as t } from '@nextcloud/l10n'
import { generateOcsUrl, generateUrl, getBaseUrl } from '@nextcloud/router'
import md5 from 'md5'
import { autocomplete } from '@/services/autocompleteService'
import { ProposalParticipantRealm } from '@/types/proposals/proposalEnums'
import { removeMailtoPrefix } from '@/utils/attendee.js'
import logger from '@/utils/logger.js'

/**
 * Generates an absolute URL to the talk room/conversation based on the token or room object
 *
 * @param tokenOrRoom The Talk conversation token string or TalkRoom object
 *
 * @return The absolute URL to the Talk conversation
 */
export function generateRoomUrl(tokenOrRoom: string | TalkRoom): string {
	const token = typeof tokenOrRoom === 'string' ? tokenOrRoom : tokenOrRoom.token
	return generateUrl('/call/' + token, {}, { baseURL: getBaseUrl() })
}

/**
 * Checks whether the given string contains a Talk conversation URL
 *
 * @param value The text to search for Talk URL
 *
 * @return True if the text contains a Talk room/conversation URL, false otherwise
 */
export function containsRoomUrl(value: string | null | undefined): boolean {
	if (!value) {
		return false
	}
	return value.includes(generateRoomUrl(''))
}

/**
 * Extract a Talk room/conversation token from the given URL
 *
 * @param value URL of the Talk room/conversation
 *
 * @return The extracted token or undefined if URL is invalid
 */
export function extractRoomUrlToken(value: string): string | undefined {
	return value.match(/\/call\/([a-z0-9]*)(\/|#.*)?$/)?.[1] ?? undefined
}

/**
 * Retrieve list of Talk rooms/conversations for the current user
 *
 * @param params Optional query parameters to filter and customize the room list
 *
 * @return Promise that resolves to an array of Talk rooms
 *
 * @throws Error if the request fails or returns an invalid response
 */
export async function listRooms(params?: TalkRoomListRequest): Promise<TalkRoom[]> {
	try {
		const response = await transceiveGet<TalkRoomListRequest, TalkRoomListResponse>('room', params)
		// response sanity checks
		if (!response.ocs || !response.ocs.meta || !response.ocs.data || !response.ocs.meta.status) {
			throw new Error('Talk list error: malformed response')
		}
		if (response.ocs.meta.status !== 'ok') {
			throw new Error(`Talk list error: ${response.ocs.meta.message || 'unknown error'}`)
		}
		// Type guard to ensure data is TalkRoom[] and not OcsErrorData
		if (Array.isArray(response.ocs.data)) {
			return response.ocs.data
		}
		throw new Error('Talk list error: unexpected response format')
	} catch (error) {
		console.debug(error)
		throw error
	}
}

/**
 * Create a new Talk room with customizable parameters
 *
 * @param params Room parameters
 *
 * @return Promise that resolves to the created Talk room details
 *
 * @throws Error if the request fails or returns an invalid response
 */
export async function createRoom(params: TalkRoomCreateRequest): Promise<TalkRoom> {
	try {
		const response = await transceivePost<TalkRoomCreateRequest, TalkRoomCreateResponse>('room', params)
		// response sanity checks
		if (!response.ocs || !response.ocs.meta || !response.ocs.data || !response.ocs.meta.status) {
			throw new Error('Talk create error: malformed response')
		}
		if (response.ocs.meta.status !== 'ok') {
			throw new Error(`Talk create error: ${response.ocs.meta.message || 'unknown error'}`)
		}

		return Array.isArray(response.ocs.data) ? response.ocs.data[0] as TalkRoom : response.ocs.data as TalkRoom
	} catch (error) {
		console.debug(error)
		throw error
	}
}

/**
 * Create a Talk room from a proposal and return the created room details
 *
 * @param proposal The source proposal to derive room name, description, and participants from
 *
 * @return Promise that resolves to the created Talk room details
 */
export async function createRoomFromProposal(proposal: ProposalInterface): Promise<TalkRoom> {
	// resolve participants to user IDs or emails
	const participantPromises = (proposal.participants || [])
		.filter((participant): participant is ProposalParticipantInterface => !!participant?.address)
		.map((participant) => {
			return new Promise<{ userId?: string, email?: string }>((resolve) => {
				(async () => {
					// internal users are resolved to user IDs if possible
					// otherwise fallback to email
					// external users are added by email
					if (participant.realm === ProposalParticipantRealm.Internal) {
						try {
							const matches: AutocompleteEntry[] = await autocomplete({ search: participant.address, limit: 1, itemType: 'users' })
							if (matches[0] !== undefined && matches[0].shareWithDisplayNameUnique === participant.address) {
								resolve({ userId: matches[0].id })
								return
							}
							resolve({ email: participant.address })
						} catch {
							resolve({ email: participant.address })
						}
					} else {
						resolve({ email: participant.address })
					}
				})()
			})
		})
	// construct internal and external lists participants from resolved participants
	const users: string[] = []
	const emails: string[] = []
	const participantResults = await Promise.all(participantPromises)
	for (const result of participantResults) {
		if (result.userId) {
			users.push(result.userId)
		} else if (result.email) {
			emails.push(result.email)
		}
	}

	const payload: TalkRoomCreateRequest = {
		roomType: 3,
		roomName: proposal.title || t('calendar', 'Talk conversation for proposal'),
		objectType: 'event',
		objectId: proposal.uuid || md5(String(Date.now())),
		description: proposal.description ?? '',
	}

	if (users.length || emails.length) {
		payload.participants = {}
		if (users.length) {
			payload.participants.users = users
		}
		if (emails.length) {
			payload.participants.emails = emails
		}
	}

	return createRoom(payload)
}

/**
 * Updates Talk room/conversation participants based on calendar event attendees
 *
 * This function synchronizes the participants of a Talk room with the attendees
 * of a calendar event. It resolves attendee emails to Nextcloud user IDs where
 * possible, and adds them to the Talk room. Only works if the current user is
 * a moderator or owner of the conversation.
 *
 * @param eventComponent The calendar event component containing attendee information
 */
export async function updateRoomParticipantsFromEvent(eventComponent: object): Promise<void> {
	const roomUrl = eventComponent.getConferenceList()[0]?.uri ?? eventComponent.location

	// Validate room url is from this host
	if (!roomUrl || !roomUrl.startsWith(window.location.protocol + '//' + window.location.host)) {
		logger.debug('Event\'s conference/location is from another host', roomUrl)
		return
	}

	const currentUserId = getCurrentUser()?.uid
	if (!currentUserId) {
		logger.debug('No current user found')
		return
	}

	const token = extractRoomUrlToken(roomUrl)
	if (!token) {
		logger.debug('Room Url ' + roomUrl + ' does not contain a call token')
		return
	}

	try {
		// Fetch room details and participants
		const roomResponse = await transceiveGet<undefined, TalkRoomFetchResponse>(`room/${token}`, undefined)
		const participantsResponse = await transceiveGet<undefined, TalkRoomFetchParticipantsResponse>(`room/${token}/participants`, undefined)

		const room = roomResponse.ocs.data as TalkRoom
		const participants = participantsResponse.ocs.data as TalkRoomParticipant[]

		// Verify current user is owner or moderator (participantType <= 2)
		if (!participants.some((participant) => participant.actorId === currentUserId && participant.participantType <= 2)) {
			logger.debug('Current user is not a moderator or owner', { currentUser: currentUserId, room, participants })
			return
		}

		logger.debug('Updating room participants', { room })

		// Collect attendees that need to be added
		const attendeesToProcess: CalendarAttendee[] = []
		for (const attendee of eventComponent.getAttendeeIterator()) {
			// Skip non-user attendees (groups, resources, rooms)
			if (['GROUP', 'RESOURCE', 'ROOM'].includes(attendee.userType.toUpperCase())) {
				continue
			}
			attendeesToProcess.push(attendee)
		}

		// Resolve attendees to user IDs or emails in parallel
		const resolvePromises = attendeesToProcess.map((attendee) => {
			return new Promise<{ userId?: string, email?: string }>((resolve) => {
				(async () => {
					const participantEmail = removeMailtoPrefix(attendee.email)

					try {
						// Try to map attendee email to Nextcloud user uid using autocomplete service
						const matches: AutocompleteEntry[] = await autocomplete({
							search: attendee.commonName ?? participantEmail,
							limit: 2,
							itemType: 'users',
						})

						// Only map if there is exactly one result and it's not the organizer
						if (matches.length === 1
							&& matches[0].id !== currentUserId
							&& matches[0].shareWithDisplayNameUnique === participantEmail
						) {
							logger.debug('Resolved attendee to user', { email: participantEmail, userId: matches[0].id })
							resolve({ userId: matches[0].id })
							return
						} else if (matches[0]?.id === currentUserId) {
							logger.debug('Skipping organizer', { userId: matches[0].id })
							resolve({})
							return
						}

						// For public rooms, add as email guest
						if (room.type === 3) {
							logger.debug('Adding attendee as email guest', { email: participantEmail })
							resolve({ email: participantEmail })
						} else {
							logger.debug('Attendee ignored for non-public room', { email: participantEmail })
							resolve({})
						}
					} catch (error) {
						logger.info('Could not resolve attendee', { email: participantEmail, error })
						// For public rooms, fall back to email
						if (room.type === 3) {
							resolve({ email: participantEmail })
						} else {
							resolve({})
						}
					}
				})()
			})
		})

		// resolve all attendees to user IDs or emails
		const resolvedParticipants = await Promise.all(resolvePromises)

		// update room participants
		const updatePromises = resolvedParticipants
			.filter((result) => result.userId || result.email)
			.map(async (result) => {
				try {
					if (result.userId) {
						await transceivePost<TalkRoomAddParticipantRequest, TalkRoomAddParticipantResponse>(
							`room/${token}/participants`,
							{
								newParticipant: result.userId,
								source: 'users',
							},
						)
						logger.debug('Added user participant', { userId: result.userId })
					} else if (result.email) {
						await transceivePost<TalkRoomAddParticipantRequest, TalkRoomAddParticipantResponse>(
							`room/${token}/participants`,
							{
								newParticipant: result.email,
								source: 'emails',
							},
						)
						logger.debug('Added email participant', { email: result.email })
					}
				} catch (error) {
					logger.info('Could not add participant', {
						userId: result.userId,
						email: result.email,
						error,
					})
				}
			})

		await Promise.all(updatePromises)
		logger.debug('Finished updating room participants')
	} catch (error) {
		logger.warn('Could not update Talk room attendees', { error })
	}
}

/**
 * Generic function to GET data from the Talk OCS API and return the typed response
 *
 * @param path API path segment to append after the version (for example: "room")
 * @param params The request query parameters to append to the URL
 *
 * @return Promise that resolves to the typed response data
 *
 * @throws Error if the request fails
 */
async function transceiveGet<TRequest extends object | undefined, TResponse>(path: string, params?: TRequest): Promise<TResponse> {
	const apiVersion = loadState('calendar', 'talk_api_version')
	let url = generateOcsUrl('/apps/spreed/api/{apiVersion}/{path}', { apiVersion, path })

	// Add query parameters if provided
	if (params) {
		const queryParams = new URLSearchParams()
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				queryParams.append(key, String(value))
			}
		}
		const queryString = queryParams.toString()
		if (queryString) {
			url += '?' + queryString
		}
	}

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'OCS-APIREQUEST': 'true',
			Accept: 'application/json',
		},
		credentials: 'same-origin',
	})

	if (!response.ok) {
		const text = await response.text().catch(() => '')
		throw new Error(`Request failed: ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`)
	}

	return response.json() as Promise<TResponse>
}

/**
 * Generic function to POST data to the Talk OCS API and return the typed response
 *
 * @param path API path segment to append after the version (for example: "room")
 * @param data The request payload body to send as JSON
 *
 * @return Promise that resolves to the typed response data
 *
 * @throws Error if the request fails
 */
async function transceivePost<TRequest extends object, TResponse>(path: string, data: TRequest): Promise<TResponse> {
	const apiVersion = loadState('calendar', 'talk_api_version')
	const response = await fetch(
		generateOcsUrl('/apps/spreed/api/{apiVersion}/{path}', { apiVersion, path }),
		{
			method: 'POST',
			headers: {
				'OCS-APIREQUEST': 'true',
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			credentials: 'same-origin',
			body: JSON.stringify(data),
		},
	)

	if (!response.ok) {
		const text = await response.text().catch(() => '')
		throw new Error(`Request failed: ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`)
	}

	return response.json() as Promise<TResponse>
}

export default {
	listRooms,
	createRoom,
	createRoomFromProposal,
	updateRoomParticipantsFromEvent,
	generateRoomUrl,
	containsRoomUrl,
	extractRoomUrlToken,
}
