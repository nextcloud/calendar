/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { translate as t } from '@nextcloud/l10n'
import { generateOcsUrl, generateUrl, getBaseUrl } from '@nextcloud/router'
import { loadState } from '@nextcloud/initial-state'
import md5 from 'md5'

import type { ProposalInterface, ProposalParticipantInterface } from '@/types/proposals/proposalInterfaces'
import { ProposalParticipantRealm } from '@/types/proposals/proposalEnums'
import { autocomplete } from './autocompleteService'
import type { AutocompleteEntry } from '@/types/autocomplete'
import type { TalkRoom } from '@/types/talk'
import type { OcsEnvelope } from '@/types/ocs'

type TalkRoomCreateRequest = {
  roomType: number
  roomName: string
  objectType: string
  objectId: string
  password?: string
  readOnly?: number
  listable?: number
  messageExpiration?: number
  lobbyState?: number
  lobbyTimer?: number | null
  sipEnabled?: number
  permissions?: number
  recordingConsent?: number
  mentionPermissions?: number
  description?: string
  emoji?: string | null
  avatarColor?: string | null
  participants?: {
    users?: string[]
    federated_users?: string[]
    groups?: string[]
    emails?: string[]
    phones?: string[]
    teams?: string[]
  }
}

type TalkRoomCreateResponse = OcsEnvelope<TalkRoom>

/**
 * Generates an absolute URL to the talk room based on the token
 *
 * @param token The Talk conversation token to build the URL for
 */
export function generateURLForToken(token: string): string {
	return generateUrl('/call/' + token, {}, { baseURL: getBaseUrl() })
}

/**
 * Create a Talk room from a proposal and return the created room details
 *
 * @param proposal The source proposal to derive room name, description, and participants from
 */
export async function createTalkRoomFromProposal(proposal: ProposalInterface): Promise<TalkRoom> {
	// resolve participants to user IDs or emails
	const participantPromises = (proposal.participants || [])
		.filter((participant): participant is ProposalParticipantInterface => !!participant?.address)
		.map((participant) => {
			return new Promise<{ userId?: string; email?: string }>((resolve) => {
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

	payload.participants = {}
	if (users.length) payload.participants.users = users
	if (emails.length) payload.participants.emails = emails

	try {
		const response = await transceivePost<TalkRoomCreateRequest, TalkRoomCreateResponse>('room', payload)
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
 * Generic function to POST data to the Talk OCS API and return the typed response
 *
 * @param path API path segment to append after the version (for example: "room")
 * @param data The request payload body to send as JSON
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
	createTalkRoomFromProposal,
}
