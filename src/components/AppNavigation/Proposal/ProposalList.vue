<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div
		class="proposal-list__-list">
		<NcAppNavigationCaption class="proposal-list__caption"
			:name="t('calendar', 'Meeting proposals')">
			<template #actions>
				<NcActionButton @click="onProposalCreate">
					<template #icon>
						<CreateIcon :size="20" decorative />
					</template>
					{{ t('calendar', 'Create new') }}
				</NcActionButton>
			</template>
		</NcAppNavigationCaption>

		<template v-if="userHasEmailAddress">
			<template v-for="proposal in storedProposals" class="proposal-list__item">
				<NcAppNavigationItem :name="proposal.title" @click="onProposalView(proposal)">
					<template v-if="proposalParticipantsTotal(proposal) === proposalParticipantsResponded(proposal)" #icon>
						<CompleteIcon :size="20" decorative />
					</template>
					<template v-else #icon>
						<PendingIcon :size="20" decorative />
					</template>
					<template #counter>
						<NcCounterBubble>
							{{ proposalParticipantsResponded(proposal) + '/' + proposalParticipantsTotal(proposal) }}
						</NcCounterBubble>
					</template>
					<template #actions>
						<NcActionButton :close-after-click="true"
							@click="onProposalView(proposal)">
							<template #icon>
								<ViewIcon :size="20" />
							</template>
							{{ t('calendar', 'View') }}
						</NcActionButton>
						<NcActionButton :close-after-click="true"
							@click="onProposalModify(proposal)">
							<template #icon>
								<ModifyIcon :size="20" />
							</template>
							{{ t('calendar', 'Edit') }}
						</NcActionButton>
						<NcActionButton :close-after-click="true"
							@click="onProposalDelete(proposal)">
							<template #icon>
								<DestroyIcon :size="20" />
							</template>
							{{ t('calendar', 'Delete') }}
						</NcActionButton>
					</template>
				</NcAppNavigationItem>
			</template>
		</template>
		<template v-if="!userHasEmailAddress">
			<NcAppNavigationItem
				:name="t('calendar', 'A configured email address is required to use meeting proposals')"
				@click="window.open(generateUrl('settings/user'), '_blank').focus()">
				<template #icon>
					<WarningIcon :size="20" />
				</template>
			</NcAppNavigationItem>
		</template>
	</div>
</template>

<script lang="ts">
// types, object and stores
import useProposalStore from '@/store/proposalStore'
import usePrincipalStore from '@/store/principals'
import { t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'
import { showError, showSuccess } from '@nextcloud/dialogs'
import { Proposal, ProposalParticipant, ProposalDate } from '@/models/proposals/proposals'
import { ProposalParticipantRealm, ProposalParticipantStatus } from '@/types/proposals/proposalEnums'
// components
import NcAppNavigationCaption from '@nextcloud/vue/components/NcAppNavigationCaption'
import NcAppNavigationItem from '@nextcloud/vue/components/NcAppNavigationItem'
import NcActionButton from '@nextcloud/vue/components/NcActionButton'
import NcCounterBubble from '@nextcloud/vue/components/NcCounterBubble'
// icons
import WarningIcon from 'vue-material-design-icons/AlertCircleOutline'
import PendingIcon from 'vue-material-design-icons/ProgressClock'
import CompleteIcon from 'vue-material-design-icons/CheckCircleOutline'
import ViewIcon from 'vue-material-design-icons/CalendarMultiselect'
import CreateIcon from 'vue-material-design-icons/Plus'
import ModifyIcon from 'vue-material-design-icons/Pencil'
import DestroyIcon from 'vue-material-design-icons/TrashCanOutline'

export default {
	name: 'ProposalList',
	
	data() {
		const principalStore = usePrincipalStore()
		const proposalStore = useProposalStore()
		return {
			principalStore,
			proposalStore,
			storedProposals: [] as Array<Proposal>,
		}
	},

	mounted() {
		this.fetchProposals()
	},

	components: {
		NcAppNavigationCaption,
		NcAppNavigationItem,
		NcActionButton,
		NcCounterBubble,
		WarningIcon,
		PendingIcon,
		CompleteIcon,
		ViewIcon,
		CreateIcon,
		ModifyIcon,
		DestroyIcon,
	},
	
	computed: {
		userHasEmailAddress() {
			return this.principalStore?.getCurrentUserPrincipal?.emailAddress?.length > 0
		},
	},
	
	methods: {
		t,

		onProposalView(proposal: Proposal) {
			this.proposalStore.showModal('view', proposal)
		},

		onProposalCreate() {
			this.proposalStore.showModal('create')
		},

		onProposalModify(proposal: Proposal) {
			this.proposalStore.showModal('modify', proposal)
		},

		async onProposalDestroy(proposal: Proposal) {
			if (confirm(t('calendar', 'Are you sure you want to delete this proposal?'))) {
				try {
					await this.proposalStore.destroyProposal(proposal)
					this.fetchProposals()
					showSuccess(t('calendar', 'Proposal deleted successfully'))
					console.log('Proposal deleted successfully:', proposal)
				} catch (error) {
					showError(t('calendar', 'Failed to delete proposal'))
					console.error('Failed to delete proposal:', error)
				}
			}
		},

		async fetchProposals() {
			try {
				this.storedProposals = await this.proposalStore.listProposals()
			} catch (error) {
				showError(t('calendar', 'Failed to retrieve proposals'))
				console.error('Failed to retrieve proposals:', error)
			}
		},

		proposalParticipantsTotal(proposal: Proposal): number {
			return proposal.participants.length
		},

		proposalParticipantsResponded(proposal: Proposal): number {
			return proposal.participants.filter(p => p.status === ProposalParticipantStatus.Responded).length
		},
	},
}
</script>
