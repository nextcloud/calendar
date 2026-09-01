/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export enum ProposalParticipantStatus {
	Pending = 'P',
	Responded = 'R',
}

export enum ProposalParticipantRealm {
	Internal = 'I',
	External = 'E',
}

export enum ProposalParticipantAttendance {
	Required = 'R',
	Optional = 'O',
}

export enum ProposalDateVote {
	Yes = 'Y',
	No = 'N',
	Maybe = 'M',
}
