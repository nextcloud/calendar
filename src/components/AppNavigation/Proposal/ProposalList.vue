<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="proposal-list__-list">
		<NcAppNavigationCaption
			class="proposal-list__caption"
			:name="t('calendar', 'Meeting proposals')">
			<template #actions>
				<NcActionButton @click="onProposalCreate()">
					<template #icon>
						<CreateIcon :size="20" decorative />
					</template>
					{{ t('calendar', 'Create new') }}
				</NcActionButton>
			</template>
		</NcAppNavigationCaption>

		<template v-if="!userHasEmailAddress">
			<NcAppNavigationItem
				:name="t('calendar', 'A configured email address is required to use meeting proposals')"
				@click="window.open(generateUrl('settings/user'), '_blank').focus()">
				<template #icon>
					<WarningIcon :size="20" />
				</template>
			</NcAppNavigationItem>
		</template>

		<template v-if="userHasEmailAddress">
			<NcAppNavigationItem
				v-if="storedProposals.length === 0"
				:name="t('calendar', 'No active meeting proposals')"
				@click="onProposalCreate()">
				<template #icon>
					<VotingIcon :size="20" />
				</template>
			</NcAppNavigationItem>

			<NcAppNavigationItem
				v-for="proposal in storedProposals"
				:key="proposal.id"
				:name="proposal.title"
				class="proposal-list__item"
				@click="onProposalView(proposal)">
				<template v-if="proposalParticipantsTotal(proposal) === proposalParticipantsResponded(proposal)" #icon>
					<CompleteIcon :size="20" decorative class="proposal-list__icon--complete" />
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
					<NcActionButton
						:close-after-click="true"
						@click="onProposalView(proposal)">
						<template #icon>
							<ViewIcon :size="20" />
						</template>
						{{ t('calendar', 'View') }}
					</NcActionButton>
					<NcActionButton
						:close-after-click="true"
						@click="onProposalModify(proposal)">
						<template #icon>
							<ModifyIcon :size="20" />
						</template>
						{{ t('calendar', 'Edit') }}
					</NcActionButton>
					<NcActionButton
						:close-after-click="true"
						@click="onProposalDestroy(proposal)">
						<template #icon>
							<DestroyIcon :size="20" />
						</template>
						{{ t('calendar', 'Delete') }}
					</NcActionButton>
				</template>
			</NcAppNavigationItem>
		</template>
	</div>
</template>

<script lang="ts">
import type { Proposal } from '@/models/proposals/proposals'

import { showError, showSuccess } from '@nextcloud/dialogs'
import { t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'
// icons
import WarningIcon from 'vue-material-design-icons/AlertCircleOutline'
import ViewIcon from 'vue-material-design-icons/CalendarMultiselect'
import CompleteIcon from 'vue-material-design-icons/CheckCircleOutline'
import ModifyIcon from 'vue-material-design-icons/Pencil'
import CreateIcon from 'vue-material-design-icons/Plus'
import VotingIcon from 'vue-material-design-icons/Poll'
import PendingIcon from 'vue-material-design-icons/ProgressClock'
import DestroyIcon from 'vue-material-design-icons/TrashCanOutline'
import NcActionButton from '@nextcloud/vue/components/NcActionButton'
// components
import NcAppNavigationCaption from '@nextcloud/vue/components/NcAppNavigationCaption'
import NcAppNavigationItem from '@nextcloud/vue/components/NcAppNavigationItem'
import NcCounterBubble from '@nextcloud/vue/components/NcCounterBubble'
import usePrincipalStore from '@/store/principals'
// types, object and stores
import useProposalStore from '@/store/proposalStore'
import { ProposalParticipantStatus } from '@/types/proposals/proposalEnums'

export default {
	name: 'ProposalList',

	components: {
		NcAppNavigationCaption,
		NcAppNavigationItem,
		NcActionButton,
		NcCounterBubble,
		WarningIcon,
		PendingIcon,
		CompleteIcon,
		VotingIcon,
		ViewIcon,
		CreateIcon,
		ModifyIcon,
		DestroyIcon,
	},

	data() {
		const principalStore = usePrincipalStore()
		const proposalStore = useProposalStore()
		return {
			principalStore,
			proposalStore,
			storedProposals: [] as Array<Proposal>,
		}
	},

	computed: {
		userHasEmailAddress() {
			return this.principalStore?.getCurrentUserPrincipal?.emailAddress?.length > 0
		},
	},

	watch: {
		'proposalStore.modalVisible': function(newValue: boolean, oldValue: boolean) {
			// Refresh the list when the modal closes (was true, now false)
			if (oldValue === true && newValue === false) {
				this.fetchProposals()
			}
		},
	},

	mounted() {
		this.fetchProposals()
	},

	methods: {
		t,

		generateUrl,

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
			if (!confirm(t('calendar', 'Are you sure you want to delete "{title}"?', { title: proposal.title ?? t('calendar', 'No title') }))) {
				return
			}
			try {
				showSuccess(t('calendar', 'Deleting proposal "{title}"', { title: proposal.title ?? t('calendar', 'No title') }))
				await this.proposalStore.destroyProposal(proposal)
				showSuccess(t('calendar', 'Successfully deleted proposal'))
				this.fetchProposals()
			} catch (error) {
				showError(t('calendar', 'Failed to delete proposal'))
			}
		},

		async fetchProposals() {
			try {
				this.storedProposals = await this.proposalStore.listProposals()
			} catch (error) {
				showError(t('calendar', 'Failed to retrieve proposals'))
			}
		},

		proposalParticipantsTotal(proposal: Proposal): number {
			return proposal.participants.length
		},

		proposalParticipantsResponded(proposal: Proposal): number {
			return proposal.participants.filter((p) => p.status === ProposalParticipantStatus.Responded).length
		},
	},
}
</script>

<style lang="scss" scoped>
.proposal-list__icon--complete {
	color: #009f05;
}
</style>
