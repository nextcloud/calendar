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

export class Proposal implements ProposalInterface {

	public id: number | null = null
	public title: string | null = null
	public description: string | null = null
	public duration: number = 0
	public participants: ProposalParticipant[] = []
	public dates: ProposalDate[] = []

	constructor() {}

	public toJson(): any {
		return {
			'@type': 'MeetingProposal',
			id: this.id,
			title: this.title,
			description: this.description,
			duration: this.duration,
			dates: this.dates.map(d => d.toJson()),
			participants: this.participants.map(p => p.toJson()),
		}
	}

	public fromJson(data: any): void {
		this.id = data.id ?? null
		this.title = data.title ?? null
		this.description = data.description ?? null
		this.duration = data.duration ?? 0
		this.dates = (data.dates || []).map((d: any) => {
			const date = new ProposalDate()
			date.fromJson(d)
			return date
		})
		this.participants = (data.participants || []).map((p: any) => {
			const participant = new ProposalParticipant()
			participant.fromJson(p)
			return participant
		})
	}

}

export class ProposalParticipant implements ProposalParticipantInterface {

	public id: number | null = null
	public name: string | null = null
	public address: string = ''
	public status: ProposalParticipantStatus = ProposalParticipantStatus.Pending
	public realm: ProposalParticipantRealm = ProposalParticipantRealm.Internal

	constructor() {}

	public toJson(): any {
		return {
			'@type': 'MeetingProposalParticipant',
			id: this.id,
			name: this.name,
			address: this.address,
			status: this.status,
			realm: this.realm,
		}
	}

	public fromJson(data: any): void {
		this.id = data.id ?? null
		this.name = data.name ?? null
		this.address = data.address ?? ''
		this.status = data.status ?? ProposalParticipantStatus.Pending
		this.realm = data.realm ?? ProposalParticipantRealm.Internal
	}

}

export class ProposalDate implements ProposalDateInterface {

	public id: number | null = null
	public date: Date | null = null
	public votedYes: number = 0
	public votedNo: number = 0
	public votedMaybe: number = 0

	constructor() {}

	public toJson(): any {
		return {
			'@type': 'MeetingProposalDate',
			id: this.id,
			date: this.date ? this.date.toISOString() : null,
			// we omit the votes as they should not be changed by the client directly
		}
	}

	public fromJson(data: any): void {
		this.id = data.id ?? null
		this.date = data.date ? new Date(data.date) : null
		this.votedYes = data.votedYes ?? 0
		this.votedNo = data.votedNo ?? 0
		this.votedMaybe = data.votedMaybe ?? 0
	}

}

export class ProposalResponse implements ProposalResponseInterface {

	public token: string = ''
	public dates: Record<number, ProposalResponseDate> = {}

	constructor() {}

	public toJson(): any {
		return {
			'@type': 'MeetingProposalResponse',
			token: this.token,
			dates: Object.fromEntries(Object.entries(this.dates).map(([id, date]) => [id, date.toJson()])),
		}
	}

}

export class ProposalResponseDate implements ProposalResponseDateInterface {

	public id: number = 0
	public date: Date = new Date()
	public vote: ProposalDateVote = ProposalDateVote.No

	constructor() {}

	public toJson(): any {
		return {
			'@type': 'MeetingProposalResponseDate',
			id: this.id,
			date: this.date.toISOString(),
			vote: this.vote,
		}
	}

}
