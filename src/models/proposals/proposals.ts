/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {
	ProposalDateInterface,
	ProposalInterface,
	ProposalParticipantInterface,
	ProposalResponseDateInterface,
	ProposalResponseInterface,
	ProposalVoteInterface,
} from '@/types/proposals/proposalInterfaces'

import {
	ProposalDateVote,
	ProposalParticipantAttendance,
	ProposalParticipantRealm,
	ProposalParticipantStatus,
} from '@/types/proposals/proposalEnums'

export class ProposalParticipant implements ProposalParticipantInterface {
	public id: number | null = null
	public name: string | null = null
	public address: string = ''
	public attendance: ProposalParticipantAttendance = ProposalParticipantAttendance.Required
	public status: ProposalParticipantStatus = ProposalParticipantStatus.Pending
	public realm: ProposalParticipantRealm = ProposalParticipantRealm.Internal

	public toJson(): Record<string, unknown> {
		return {
			'@type': 'MeetingProposalParticipant',
			id: this.id,
			name: this.name,
			address: this.address,
			attendance: this.attendance,
			status: this.status,
			realm: this.realm,
		}
	}

	public fromJson(data: Record<string, unknown>): void {
		if (typeof data['@type'] === 'string' && data['@type'] !== 'MeetingProposalParticipant') {
			throw new Error('Invalid type for Proposal Participant')
		}

		this.id = typeof data.id === 'number' ? data.id : null
		this.name = typeof data.name === 'string' ? data.name : null
		this.address = typeof data.address === 'string' ? data.address : ''
		if (typeof data.attendance === 'string' && Object.values(ProposalParticipantAttendance).includes(data.attendance as ProposalParticipantAttendance)) {
			this.attendance = data.attendance as ProposalParticipantAttendance
		} else {
			this.attendance = ProposalParticipantAttendance.Required
		}
		if (typeof data.status === 'string' && Object.values(ProposalParticipantStatus).includes(data.status as ProposalParticipantStatus)) {
			this.status = data.status as ProposalParticipantStatus
		} else {
			this.status = ProposalParticipantStatus.Pending
		}
		if (typeof data.realm === 'string' && Object.values(ProposalParticipantRealm).includes(data.realm as ProposalParticipantRealm)) {
			this.realm = data.realm as ProposalParticipantRealm
		} else {
			this.realm = ProposalParticipantRealm.Internal
		}
	}
}

export class ProposalDate implements ProposalDateInterface {
	public id: number | null = null
	public date: Date | null = null

	public toJson(): Record<string, unknown> {
		return {
			'@type': 'MeetingProposalDate',
			id: this.id,
			date: this.date ? this.date.toISOString() : null,
		}
	}

	public fromJson(data: Record<string, unknown>): void {
		if (typeof data['@type'] === 'string' && data['@type'] !== 'MeetingProposalDate') {
			throw new Error('Invalid type for Proposal Date')
		}

		this.id = typeof data.id === 'number' ? data.id : null
		this.date = data.date ? new Date(data.date as string) : null
	}
}

export class ProposalVote implements ProposalVoteInterface {
	public id: number | null = null
	public date: number | null = null
	public participant: number | null = null
	public vote: ProposalDateVote = ProposalDateVote.Maybe

	public fromJson(data: Record<string, unknown>): void {
		if (typeof data['@type'] === 'string' && data['@type'] !== 'MeetingProposalVote') {
			throw new Error('Invalid type for Proposal Vote')
		}

		this.id = typeof data.id === 'number' ? data.id : null
		this.date = typeof data.date === 'number' ? data.date : null
		this.participant = typeof data.participant === 'number' ? data.participant : null
		if (typeof data.vote === 'string' && Object.values(ProposalDateVote).includes(data.vote as ProposalDateVote)) {
			this.vote = data.vote as ProposalDateVote
		} else {
			this.vote = ProposalDateVote.Maybe
		}
	}
}

export class Proposal implements ProposalInterface {
	public id: number | null = null
	public uid: string | null = null
	public uname: string | null = null
	public uuid: string | null = null
	public title: string | null = null
	public description: string | null = null
	public location: string | null = null
	public duration: number = 0
	public participants: ProposalParticipant[] = []
	public dates: ProposalDate[] = []
	public votes: ProposalVote[] = []

	public toJson(): Record<string, unknown> {
		return {
			'@type': 'MeetingProposal',
			id: this.id,
			uid: this.uid,
			uname: this.uname,
			uuid: this.uuid,
			title: this.title,
			description: this.description,
			location: this.location,
			duration: this.duration,
			dates: this.dates.map((d) => d.toJson()),
			participants: this.participants.map((p) => p.toJson()),
		}
	}

	public fromJson(data: Record<string, unknown>): void {
		if (typeof data['@type'] === 'string' && data['@type'] !== 'MeetingProposal') {
			throw new Error('Invalid type for Proposal')
		}

		this.id = typeof data.id === 'number' ? data.id : null
		this.uid = typeof data.uid === 'string' ? data.uid : null
		this.uname = typeof data.uname === 'string' ? data.uname : null
		this.uuid = typeof data.uuid === 'string' ? data.uuid : null
		this.title = typeof data.title === 'string' ? data.title : null
		this.description = typeof data.description === 'string' ? data.description : null
		this.location = typeof data.location === 'string' ? data.location : null
		this.duration = typeof data.duration === 'number' ? data.duration : 0
		this.dates = Array.isArray(data.dates)
			? data.dates.map((d: Record<string, unknown>) => {
					const date = new ProposalDate()
					date.fromJson(d)
					return date
				})
			: []
		this.participants = Array.isArray(data.participants)
			? data.participants.map((p: Record<string, unknown>) => {
					const participant = new ProposalParticipant()
					participant.fromJson(p)
					return participant
				})
			: []
		this.votes = Array.isArray(data.votes)
			? data.votes.map((v: Record<string, unknown>) => {
					const vote = new ProposalVote()
					vote.fromJson(v)
					return vote
				})
			: []
	}
}

export class ProposalResponseDate implements ProposalResponseDateInterface {
	public id: number = 0
	public date: Date = new Date()
	public vote: ProposalDateVote = ProposalDateVote.No

	public toJson(): Record<string, unknown> {
		return {
			'@type': 'MeetingProposalResponseDate',
			id: this.id,
			date: this.date.toISOString(),
			vote: this.vote,
		}
	}
}

export class ProposalResponse implements ProposalResponseInterface {
	public token: string = ''
	public dates: Record<number, ProposalResponseDate> = {}

	public toJson(): Record<string, unknown> {
		return {
			'@type': 'MeetingProposalResponse',
			token: this.token,
			dates: Object.fromEntries(Object.entries(this.dates).map(([id, date]) => [id, date.toJson()])),
		}
	}
}
