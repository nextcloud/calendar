/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { ProposalParticipantStatus, ProposalParticipantRealm, ProposalDateVote } from './proposalEnums'

export interface ProposalInterface {
  id: number | null
  title: string | null
  description: string | null
  duration: number | null
  participants: ProposalParticipantInterface[]
  dates: ProposalDateInterface[]
  toJson(): any
  fromJson(data: any): void
}

export interface ProposalParticipantInterface {
  id: number | null
  name: string | null
  address: string
  status: ProposalParticipantStatus
  realm: ProposalParticipantRealm
  toJson(): any
  fromJson(data: any): void
}

export interface ProposalDateInterface {
  id: number | null
  date: Date | null
  votedYes: number
  votedNo: number
  votedMaybe: number
  toJson(): any
  fromJson(data: any): void
}

export interface ProposalResponseInterface {
  token: string
  dates: Record<number, ProposalResponseDateInterface>
  toJson(): any
}

export interface ProposalResponseDateInterface {
  id: number
  date: Date
  vote: ProposalDateVote
  toJson(): any
}