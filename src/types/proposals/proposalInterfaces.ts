/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {
	ProposalDateVote,
	ProposalParticipantAttendance,
	ProposalParticipantRealm,
	ProposalParticipantStatus,
} from './proposalEnums.ts'

export interface ProposalParticipantInterface {
	id: number | null
	name: string | null
	address: string
	attendance: ProposalParticipantAttendance
	status: ProposalParticipantStatus
	realm: ProposalParticipantRealm
	toJson(): Record<string, unknown>
	fromJson(data: Record<string, unknown>): void
}

export interface ProposalDateInterface {
	id: number | null
	date: Date | null
	toJson(): Record<string, unknown>
	fromJson(data: Record<string, unknown>): void
}

export interface ProposalVoteInterface {
	id: number | null
	date: number | null
	participant: number | null
	vote: ProposalDateVote
	fromJson(data: Record<string, unknown>): void
}

export interface ProposalInterface {
	id: number | null
	uid: string | null
	uname: string | null
	uuid: string | null
	title: string | null
	description: string | null
	location: string | null
	duration: number | null
	participants: ProposalParticipantInterface[]
	dates: ProposalDateInterface[]
	votes: ProposalVoteInterface[]
	toJson(): Record<string, unknown>
	fromJson(data: Record<string, unknown>): void
}

export interface ProposalResponseDateInterface {
	id: number
	date: Date
	vote: ProposalDateVote
	toJson(): Record<string, unknown>
}

export interface ProposalResponseInterface {
	token: string
	dates: Record<number, ProposalResponseDateInterface>
	toJson(): Record<string, unknown>
}
