/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { OcsEnvelope, OcsErrorData } from '@/types/ocs'
import type { ProposalDateInterface, ProposalInterface, ProposalResponseInterface } from '@/types/proposals/proposalInterfaces'

import { generateOcsUrl } from '@nextcloud/router'

class ProposalService {
	private async transceivePost(path: string, payload?: object) {
		let response: Response
		try {
			response = await fetch(generateOcsUrl(`/calendar/proposal/${path}`), {
				method: 'POST',
				headers: {
					'OCS-APIREQUEST': 'true',
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				credentials: 'same-origin',
				body: payload ? JSON.stringify(payload) : undefined,
			})
		} catch (error) {
			throw new Error('Network error while contacting proposal service', { cause: error as Error })
		}

		if (response.ok) {
			return response.json()
		}

		const contents = await response.text()
		const contentType = response.headers.get('content-type') || ''
		let message = 'Unknown error'
		if (contentType.includes('application/json')) {
			const errorData: OcsEnvelope<OcsErrorData> = JSON.parse(contents)
			message = errorData.ocs?.meta?.message ? errorData.ocs.meta.message : `${response.status} ${response.statusText}`
		} else {
			message = contents?.trim().length ? contents : `${response.status} ${response.statusText}`
		}
		throw new Error(`Unexpected error from proposal service: ${message}`)
	}

	async listProposals() {
		try {
			return await this.transceivePost('list')
		} catch (error) {
			console.error('Failed to list proposals:', error)
			throw new Error('Failed to list proposals', { cause: error as Error })
		}
	}

	async fetchProposalByToken(token: string) {
		try {
			return await this.transceivePost('fetch', { token })
		} catch (error) {
			console.error('Failed to fetch proposal:', error)
			throw new Error('Failed to fetch proposal', { cause: error as Error })
		}
	}

	async createProposal(data: ProposalInterface) {
		try {
			return await this.transceivePost('create', { proposal: data })
		} catch (error) {
			console.error('Failed to create proposal:', error)
			throw new Error('Failed to create proposal', { cause: error as Error })
		}
	}

	async modifyProposal(data: ProposalInterface) {
		if (typeof data.id !== 'number') {
			throw new Error('Proposal id must be a number for update')
		}
		try {
			return await this.transceivePost('modify', { proposal: data })
		} catch (error) {
			console.error('Failed to modify proposal:', error)
			throw new Error('Failed to modify proposal', { cause: error as Error })
		}
	}

	async destroyProposal(data: ProposalInterface) {
		if (typeof data.id !== 'number') {
			throw new Error('Proposal id must be a number for deletion')
		}
		try {
			await this.transceivePost('destroy', { id: data.id })
		} catch (error) {
			console.error('Failed to destroy proposal:', error)
			throw new Error('Failed to destroy proposal', { cause: error as Error })
		}
	}

	async convertProposal(proposal: ProposalInterface, date: ProposalDateInterface, options: Record<string, unknown>) {
		try {
			await this.transceivePost('convert', { proposalId: proposal.id, dateId: date.id, options })
		} catch (error) {
			console.error('Failed to convert proposal:', error)
			throw new Error('Failed to convert proposal', { cause: error as Error })
		}
	}

	async storeResponse(data: ProposalResponseInterface) {
		try {
			return await this.transceivePost('response', { response: data })
		} catch (error) {
			console.error('Failed to store proposal response:', error)
			throw new Error('Failed to store proposal response', { cause: error as Error })
		}
	}
}

export const proposalService = new ProposalService()
