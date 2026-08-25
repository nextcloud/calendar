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
					<WarningIcon :size="20" class="proposal-list__warning-icon" />
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
					<NcCounterBubble
						:count="`${proposalParticipantsResponded(proposal)}/${proposalParticipantsTotal(proposal)}`"
						:raw="true" />
				</template>
				<template #actions>
					<NcActionButton
						:closeAfterClick="true"
						@click="onProposalView(proposal)">
						<template #icon>
							<ViewIcon :size="20" />
						</template>
						{{ t('calendar', 'View') }}
					</NcActionButton>
					<NcActionButton
						:closeAfterClick="true"
						@click="onProposalModify(proposal)">
						<template #icon>
							<ModifyIcon :size="20" />
						</template>
						{{ t('calendar', 'Edit') }}
					</NcActionButton>
					<NcActionButton
						:closeAfterClick="true"
						@click="onProposalDestroy(proposal)">
						<template #icon>
							<DestroyIcon :size="20" />
						</template>
						{{ t('calendar', 'Delete') }}
					</NcActionButton>
				</template>
			</NcAppNavigationItem>
		</template>
		<NcDialog
			:open="showDeleteDialog"
			:name="t('calendar', 'Delete proposal')"
			:message="deleteDialogMessage"
			:buttons="deleteDialogButtons"
			@update:open="showDeleteDialog = $event" />
	</div>
</template>

<script setup lang="ts">
import type { Proposal } from '@/models/proposals/proposals'

import { showError, showSuccess } from '@nextcloud/dialogs'
import { t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'
import { computed, onMounted, ref, watch } from 'vue'
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
import NcDialog from '@nextcloud/vue/components/NcDialog'
import usePrincipalStore from '@/store/principals'
// types, object and stores
import useProposalStore from '@/store/proposalStore'
import { ProposalParticipantStatus } from '@/types/proposals/proposalEnums'

const principalStore = usePrincipalStore()
const proposalStore = useProposalStore()

const storedProposals = ref<Proposal[]>([])
const showDeleteDialog = ref(false)
const pendingDeleteProposal = ref<Proposal | null>(null)

const userHasEmailAddress = computed(() => (principalStore?.getCurrentUserPrincipal?.emailAddress?.length ?? 0) > 0)

const deleteDialogMessage = computed(() => {
	const title = pendingDeleteProposal.value?.title ?? t('calendar', 'No title')
	return t('calendar', 'Are you sure you want to delete "{title}"?', { title })
})

const deleteDialogButtons = computed(() => [
	{
		label: t('calendar', 'Delete'),
		variant: 'secondary',
		callback: () => destroyProposal(),
	},
	{
		label: t('calendar', 'Cancel'),
		variant: 'primary',
		callback: () => { showDeleteDialog.value = false },
	},
])

function onProposalView(proposal: Proposal): void {
	proposalStore.showModal('view', proposal)
}

function onProposalCreate(): void {
	proposalStore.showModal('create')
}

function onProposalModify(proposal: Proposal): void {
	proposalStore.showModal('modify', proposal)
}

function onProposalDestroy(proposal: Proposal): void {
	pendingDeleteProposal.value = proposal
	showDeleteDialog.value = true
}

async function destroyProposal(): Promise<void> {
	const proposal = pendingDeleteProposal.value
	pendingDeleteProposal.value = null
	showDeleteDialog.value = false
	if (!proposal) {
		return
	}
	try {
		showSuccess(t('calendar', 'Deleting proposal "{title}"', { title: proposal.title ?? t('calendar', 'No title') }))
		await proposalStore.destroyProposal(proposal)
		showSuccess(t('calendar', 'Successfully deleted proposal'))
		fetchProposals()
	} catch {
		showError(t('calendar', 'Failed to delete proposal'))
	}
}

async function fetchProposals(): Promise<void> {
	try {
		storedProposals.value = await proposalStore.listProposals()
	} catch {
		showError(t('calendar', 'Failed to retrieve proposals'))
	}
}

function proposalParticipantsTotal(proposal: Proposal): number {
	return proposal.participants.length
}

function proposalParticipantsResponded(proposal: Proposal): number {
	return proposal.participants.filter((p) => p.status === ProposalParticipantStatus.Responded).length
}

watch(() => proposalStore.modalVisible, (newValue, oldValue) => {
	// Refresh the list when the modal closes (was true, now false)
	if (oldValue === true && newValue === false) {
		fetchProposals()
	}
})

onMounted(() => {
	fetchProposals()
})
</script>

<style lang="scss" scoped>
.proposal-list__icon--complete {
	color: var(--color-success-text);
}

:deep(.proposal-list__warning-icon) {
	color: var(--color-element-warning);
}
</style>
