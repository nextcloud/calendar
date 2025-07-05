import {
	ProposalParticipantStatus,
	ProposalParticipantRealm,
	ProposalDateVote,
} from '../../types/proposals/proposalEnums'
import type {
	ProposalInterface,
	ProposalParticipantInterface,
	ProposalDateInterface,
	ProposalResponseInterface,
	ProposalResponseDateInterface,
} from '../../types/proposals/proposalInterfaces'

export class ProposalParticipant implements ProposalParticipantInterface {

	public id: number | null = null
	public name: string | null = null
	public address: string = ''
	public status: ProposalParticipantStatus = ProposalParticipantStatus.Pending
	public realm: ProposalParticipantRealm = ProposalParticipantRealm.Internal

	public toJson(): Record<string, unknown> {
		return {
			'@type': 'MeetingProposalParticipant',
			id: this.id,
			name: this.name,
			address: this.address,
			status: this.status,
			realm: this.realm,
		}
	}

	public fromJson(data: Record<string, unknown>): void {
		this.id = typeof data.id === 'number' ? data.id : null
		this.name = typeof data.name === 'string' ? data.name : null
		this.address = typeof data.address === 'string' ? data.address : ''
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
	public votedYes: number = 0
	public votedNo: number = 0
	public votedMaybe: number = 0

	public toJson(): Record<string, unknown> {
		return {
			'@type': 'MeetingProposalDate',
			id: this.id,
			date: this.date ? this.date.toISOString() : null,
			// we omit the votes as they should not be changed by the client directly
		}
	}

	public fromJson(data: Record<string, unknown>): void {
		this.id = typeof data.id === 'number' ? data.id : null
		this.date = data.date ? new Date(data.date as string) : null
		this.votedYes = typeof data.votedYes === 'number' ? data.votedYes : 0
		this.votedNo = typeof data.votedNo === 'number' ? data.votedNo : 0
		this.votedMaybe = typeof data.votedMaybe === 'number' ? data.votedMaybe : 0
	}

}

export class Proposal implements ProposalInterface {

	public id: number | null = null
	public title: string | null = null
	public uuid: string | null = null
	public description: string | null = null
	public duration: number = 0
	public participants: ProposalParticipant[] = []
	public dates: ProposalDate[] = []

	public toJson(): Record<string, unknown> {
		return {
			'@type': 'MeetingProposal',
			id: this.id,
			title: this.title,
			uuid: this.uuid,
			description: this.description,
			duration: this.duration,
			dates: this.dates.map(d => d.toJson()),
			participants: this.participants.map(p => p.toJson()),
		}
	}

	public fromJson(data: Record<string, unknown>): void {
		this.id = typeof data.id === 'number' ? data.id : null
		this.title = typeof data.title === 'string' ? data.title : null
		this.uuid = typeof data.uuid === 'string' ? data.uuid : null
		this.description = typeof data.description === 'string' ? data.description : null
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
	}

}

export class ProposalResponseDate implements ProposalResponseDateInterface {

	public id: number = 0
	public date: Date = new Date()
	public vote: ProposalDateVote = ProposalDateVote.No

	public toJson(): Record<string, unknown> {
		return {
			'@type': 'MeetingProposalResponseVote',
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
