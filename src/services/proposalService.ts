/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { ProposalInterface, ProposalDateInterface, ProposalResponseInterface } from '@/types/proposals/proposalInterfaces'

class ProposalService {

	async listProposals() {
		const response = await fetch('/ocs/v2.php/calendar/proposal/list', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'OCS-APIRequest': 'true',
			},
		})
		if (!response.ok) {
			throw new Error('Failed to list proposals')
		}
		return await response.json()
	}

	async fetchProposalByToken(token: string) {
		const response = await fetch('/ocs/v2.php/calendar/proposal/fetch', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'OCS-APIRequest': 'true',
			},
			body: JSON.stringify({ token }),
		})
		if (!response.ok) {
			throw new Error('Failed to fetch proposal')
		}
		return await response.json()
	}

	async createProposal(data: ProposalInterface) {
		const response = await fetch('/ocs/v2.php/calendar/proposal/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'OCS-APIRequest': 'true',
			},
			body: JSON.stringify({ proposal: data }),
		})
		if (!response.ok) {
			throw new Error('Failed to create proposal')
		}
		return await response.json()
	}

	async modifyProposal(data: ProposalInterface) {
		if (typeof data.id !== 'number') {
			throw new Error('Proposal id must be a number for update')
		}
		const response = await fetch('/ocs/v2.php/calendar/proposal/modify', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'OCS-APIRequest': 'true',
			},
			body: JSON.stringify({ proposal: data }),
		})
		if (!response.ok) {
			throw new Error('Failed to modify proposal')
		}
		return await response.json()
	}

	async destroyProposal(data: ProposalInterface) {
		if (typeof data.id !== 'number') {
			throw new Error('Proposal id must be a number for deletion')
		}
		const response = await fetch('/ocs/v2.php/calendar/proposal/destroy', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'OCS-APIRequest': 'true',
			},
			body: JSON.stringify({ id: data.id }),
		})
		if (!response.ok) {
			throw new Error('Failed to destroy proposal')
		}
	}

	async convertProposal(proposal: ProposalInterface, date: ProposalDateInterface) {
		const response = await fetch('/ocs/v2.php/calendar/proposal/convert', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'OCS-APIRequest': 'true',
			},
			body: JSON.stringify({ proposalId: proposal.id, dateId: date.id }),
		})
		if (!response.ok) {
			throw new Error('Failed to convert proposal')
		}
	}

	async storeResponse(data: ProposalResponseInterface) {
		const response = await fetch('/ocs/v2.php/calendar/proposal/response', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'OCS-APIRequest': 'true',
			},
			body: JSON.stringify({ response: data }),
		})
		if (!response.ok) {
			throw new Error('Failed to store proposal response')
		}
		return await response.json()
	}

}

export const proposalService = new ProposalService()
