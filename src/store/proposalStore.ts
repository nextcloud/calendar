/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { ProposalDateInterface, ProposalInterface, ProposalResponseInterface } from '@/types/proposals/proposalInterfaces'

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Proposal } from '@/models/proposals/proposals'
import { proposalService } from '@/services/proposalService'
import { createRoomFromProposal, generateRoomUrl } from '@/services/talkService'
import useSettingsStore from '@/store/settings'

export default defineStore('proposal', () => {
	const modalVisible = ref(false)
	const modalMode = ref<'view' | 'create' | 'modify'>('view')
	const modalProposal = ref<ProposalInterface | null>(null)

	/**
	 * Show the proposal modal dialog.
	 *
	 * @param mode - Modal mode to open: 'view', 'create', or 'modify'.
	 * @param proposal - Proposal to display or edit; required for 'view' and 'modify' modes.
	 */
	function showModal(mode: 'view' | 'create' | 'modify', proposal: ProposalInterface | null = null) {
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
	 * Hide the proposal modal and reset modal state.
	 */
	function hideModal() {
		modalVisible.value = false
		modalMode.value = 'view'
		modalProposal.value = null
	}

	/**
	 * Retrieve all proposals accessible to the current user.
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
	 * Fetch a proposal by its public share token.
	 *
	 * @param token - The public access token identifying the proposal.
	 */
	async function fetchProposalByToken(token: string): Promise<Proposal> {
		const response = await proposalService.fetchProposalByToken(token)
		const proposal = new Proposal()
		proposal.fromJson(response)
		return proposal
	}

	/**
	 * Create or update a proposal depending on whether it has an id.
	 *
	 * @param proposal - The proposal data to persist.
	 */
	async function storeProposal(proposal: ProposalInterface): Promise<Proposal> {
		if (proposal.id === null) {
			return proposalService.createProposal(proposal)
		} else {
			return proposalService.modifyProposal(proposal)
		}
	}

	/**
	 * Permanently delete a proposal.
	 *
	 * @param proposal - The proposal to remove.
	 */
	async function destroyProposal(proposal: ProposalInterface): Promise<void> {
		await proposalService.destroyProposal(proposal)
	}

	/**
	 * Convert a proposal to a meeting
	 *
	 * @param proposal - The proposal to convert.
	 * @param date - The proposed date to convert to a meeting.
	 * @param timezone - The timezone to use for the meeting.
	 */
	async function convertProposal(proposal: ProposalInterface, date: ProposalDateInterface, timezone: string | null = null): Promise<void> {
		const settingsStore = useSettingsStore()
		const options = {
			timezone,
			attendancePreset: true,
			talkRoomUri: null as string | null,
		}

		if (settingsStore.talkEnabled && proposal.location === 'Talk conversation') {
			const talkRoom = await createRoomFromProposal(proposal)
			options.talkRoomUri = generateRoomUrl(talkRoom)
		}

		await proposalService.convertProposal(proposal, date, options)
	}

	/**
	 * Store a participant's response (votes/availability) for a proposal.
	 *
	 * @param response - The response payload to store for the proposal.
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
		convertProposal,
		storeResponse,
	}
})
