/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { AxiosResponse } from '@nextcloud/axios'
import type { OcsEnvelope, OcsErrorData } from '@/types/ocs'
import type { ProposalDateInterface, ProposalInterface, ProposalResponseInterface } from '@/types/proposals/proposalInterfaces'

import axios from '@nextcloud/axios'
import { generateOcsUrl } from '@nextcloud/router'

class ProposalService {
	private async transceivePost<T>(path: string, payload?: object): Promise<T> {
		let response: AxiosResponse<T | OcsEnvelope<OcsErrorData>>
		try {
			response = await axios.post(generateOcsUrl(`/calendar/proposal/${path}`), payload, {
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				withCredentials: true,
			})
			return response.data as T
		} catch (error) {
			let message = 'Unknown error'
			if (error.response.headers['content-type'] && error.response.headers['content-type'].includes('application/json')) {
				const ocsError = error.response.data as OcsEnvelope<OcsErrorData>
				message = ocsError.ocs?.meta?.message ? ocsError.ocs.meta.message : `${error.response.status} ${error.response.statusText}`
				console.error('Proposal service transmission error', ocsError)
			} else {
				message = `${error.response.status} ${error.response.statusText}`
				console.error('Proposal service transmission error', error)
			}
			throw new Error(`Unexpected error from proposal service: ${message}`)
		}
	}

	async listProposals() {
		try {
			return await this.transceivePost<ProposalInterface[]>('list')
		} catch (error) {
			console.error('Failed to list proposals:', error)
			throw new Error('Failed to list proposals', { cause: error as Error })
		}
	}

	async fetchProposalByToken(token: string) {
		try {
			return await this.transceivePost<ProposalInterface>('fetch', { token })
		} catch (error) {
			console.error('Failed to fetch proposal:', error)
			throw new Error('Failed to fetch proposal', { cause: error as Error })
		}
	}

	async createProposal(data: ProposalInterface) {
		try {
			return await this.transceivePost<ProposalInterface>('create', { proposal: data })
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
			return await this.transceivePost<ProposalInterface>('modify', { proposal: data })
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
			await this.transceivePost<void>('destroy', { id: data.id })
		} catch (error) {
			console.error('Failed to destroy proposal:', error)
			throw new Error('Failed to destroy proposal', { cause: error as Error })
		}
	}

	async convertProposal(proposal: ProposalInterface, date: ProposalDateInterface, options: Record<string, unknown>) {
		try {
			await this.transceivePost<void>('convert', { proposalId: proposal.id, dateId: date.id, options })
		} catch (error) {
			console.error('Failed to convert proposal:', error)
			throw new Error('Failed to convert proposal', { cause: error as Error })
		}
	}

	async storeResponse(data: ProposalResponseInterface) {
		try {
			return await this.transceivePost<void>('response', { response: data })
		} catch (error) {
			console.error('Failed to store proposal response:', error)
			throw new Error('Failed to store proposal response', { cause: error as Error })
		}
	}
}

export const proposalService = new ProposalService()
