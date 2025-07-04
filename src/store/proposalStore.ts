/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { proposalService } from '../services/proposalService'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Proposal } from '../models/proposals/proposals'
import type { ProposalInterface, ProposalResponseInterface } from '../types/proposals/proposalInterfaces'

export default defineStore('proposal', () => {
	const modalVisible = ref(false)

	/**
	 *
	 */
	function showModal() {
		modalVisible.value = true
	}

	/**
	 *
	 */
	function hideModal() {
		modalVisible.value = false
	}

	/**
	 *
	 */
	async function listProposals(): Promise<Proposal[]> {
		const response = await proposalService.listProposals()
		const proposals = response.map((json: any) => {
			const proposal = new Proposal()
			proposal.fromJson(json)
			return proposal
		})
		return proposals
	}

	/**
	 *
	 * @param token
	 */
	async function fetchProposalByToken(token: string): Promise<Proposal> {
		const response = await proposalService.fetchProposalByToken(token)
		const proposal = new Proposal()
		proposal.fromJson(response)
		return proposal
	}

	/**
	 *
	 * @param proposal
	 */
	async function storeProposal(proposal: ProposalInterface): Promise<Proposal> {
		if (proposal.id === null) {
			return proposalService.createProposal(proposal)
		} else {
			return proposalService.modifyProposal(proposal)
		}
	}

	/**
	 *
	 * @param proposal
	 */
	async function destroyProposal(proposal: ProposalInterface): Promise<void> {
		await proposalService.destroyProposal(proposal)
	}

	/**
	 *
	 * @param response
	 */
	async function storeResponse(response: ProposalResponseInterface): Promise<void> {
		return proposalService.storeResponse(response)
	}

	return {
		modalVisible,
		showModal,
		hideModal,
		listProposals,
		fetchProposalByToken,
		storeProposal,
		destroyProposal,
		storeResponse,
	}
})
