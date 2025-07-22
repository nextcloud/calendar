/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { proposalService } from '@/services/proposalService'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Proposal } from '@/models/proposals/proposals'
import type { ProposalInterface, ProposalResponseInterface } from '@/types/proposals/proposalInterfaces'
import { co } from 'node_modules/@fullcalendar/core/internal-common'

export default defineStore('proposal', () => {
	const modalVisible = ref(false)
	const modalMode = ref<'view' | 'create' | 'modify'>('view')
	const modalProposal = ref<ProposalInterface | null>(null)
	/**
	 *
	 */
	function showModal(mode: 'view' | 'create' | 'modify', proposal: ProposalInterface|null = null) {
		if (mode === 'view' || mode === 'modify') {
			if (proposal) {
				modalProposal.value = proposal
				modalVisible.value = true
				modalMode.value = mode
			} else {
				throw new Error('Proposal is required for view or modify mode')
			}
		} else if (mode === 'create') {
			modalProposal.value = new Proposal()
			modalVisible.value = true
			modalMode.value = mode
		} else {
			throw new Error('Invalid view mode')
		}
	}

	/**
	 *
	 */
	function hideModal() {
		modalVisible.value = false
		modalMode.value = 'view'
		modalProposal.value = null
	}

	/**
	 *
	 */
	async function listProposals(): Promise<Proposal[]> {
		const response = await proposalService.listProposals()
		const proposals = response.map((json: Record<string, unknown>) => {
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
		modalMode,
		modalProposal,
		showModal,
		hideModal,
		listProposals,
		fetchProposalByToken,
		storeProposal,
		destroyProposal,
		storeResponse,
	}
})
