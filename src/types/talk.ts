// SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { OcsEnvelope, OcsErrorData } from '@/types/ocs'

export type TalkRoomListRequest = {
	noStatusUpdate?: boolean
	includeStatus?: boolean
	modifiedSince?: number
	includeLastMessage?: boolean
}

export type TalkRoomListResponse = OcsEnvelope<TalkRoom[] | OcsErrorData>

export type TalkRoomFetchResponse = OcsEnvelope<TalkRoom | OcsErrorData>

export type TalkRoomCreateRequest = {
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

export type TalkRoomCreateResponse = OcsEnvelope<TalkRoom | OcsErrorData>

export type TalkRoomParticipant = {
	actorId: string
	actorType: string
	attendeeId: number
	participantType: number
	displayName: string
	inCall: number
	lastPing: number
	sessionIds: string[]
}

export type TalkRoomFetchParticipantsResponse = OcsEnvelope<TalkRoomParticipant[] | OcsErrorData>

export type TalkRoomAddParticipantRequest = {
	newParticipant: string
	source: string
}

export type TalkRoomAddParticipantResponse = OcsEnvelope<{
	type: number
} | OcsErrorData>

export type TalkRoom = {
	actorId: string
	invitedActorId: string
	actorType: string
	attendeeId: number
	attendeePermissions: number
	attendeePin: string
	avatarVersion: string
	breakoutRoomMode: number
	breakoutRoomStatus: number
	callFlag: number
	callPermissions: number
	callRecording: number
	callStartTime: number
	canDeleteConversation: boolean
	canEnableSIP: boolean
	canLeaveConversation: boolean
	canStartCall: boolean
	defaultPermissions: number
	description: string
	displayName: string
	hasCall: boolean
	hasPassword: boolean
	id: number
	isCustomAvatar: boolean
	isFavorite: boolean
	lastActivity: number
	lastCommonReadMessage: number
	lastMessage: string
	lastPing: number
	lastReadMessage: number
	listable: number
	liveTranscriptionLanguageId: string
	lobbyState: number
	lobbyTimer: number
	mentionPermissions: number
	messageExpiration: number
	name: string
	notificationCalls: number
	notificationLevel: number
	objectId: string
	objectType: string
	participantFlags: number
	participantType: number
	permissions: number
	readOnly: number
	recordingConsent: number
	remoteServer: string
	remoteToken: string
	sessionId: string
	sipEnabled: number
	status: string
	statusClearAt: number
	statusIcon: string
	statusMessage: string
	token: string
	type: number
	unreadMention: boolean
	unreadMentionDirect: boolean
	unreadMessages: number
	isArchived: boolean
	isImportant: boolean
	isSensitive: boolean
	invalidParticipants?: {
		users?: string[]
		federated_users?: string[]
		groups?: string[]
		emails?: string[]
		phones?: string[]
		teams?: string[]
	}
}
